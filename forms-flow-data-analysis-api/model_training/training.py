import string

import numpy as np

import datasets
import pandas as pd
import pyarrow as pa
from datasets import load_metric
from sklearn.metrics import accuracy_score, f1_score, recall_score
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.preprocessing import LabelEncoder
from transformers import (
    AutoModel,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
    pipeline,
)

"""Loading dataset."""

file_name = "copy the path of dataset to be trained"
dataset = pd.read_csv(file_name)

"""Preprocessing."""

def preprocess(dataset, data_column):
    """Performs data preprocessing on the given dataset."""
    dataset[f"{data_column}_processed"] = dataset[data_column].apply(
        lambda x: " ".join(x.lower() for x in x.split())
    )
    dataset[f"{data_column}_processed"] = dataset[
        f"{data_column}_processed"
    ].str.replace("[^\w\s]", "")
    return dataset


dataset = preprocess(dataset, "feedback")
dataset = dataset.dropna(how="any")
dataset = dataset.loc[(dataset["feedback_processed"].str.count(" ") > 1)]
dataset = dataset.reset_index(drop=True)
dataset.count()

label_encoder = LabelEncoder()
dataset["labels"] = label_encoder.fit_transform(dataset["labels"])

dataset["labels"].count()

s = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
for train_index, test_index in s.split(dataset, dataset["labels"]):
    train_set = dataset.loc[train_index]
    test_set = dataset.loc[test_index]


d = datasets.DatasetDict(
    {
        "train": datasets.Dataset(pa.Table.from_pandas(train_set)),
        "test": datasets.Dataset(pa.Table.from_pandas(test_set)),
    }
)
d.reset_format()

checkpoint = "distilbert-base-uncased"

tokenizer = AutoTokenizer.from_pretrained(checkpoint)

data_collator = DataCollatorWithPadding(tokenizer=tokenizer)


def tokenize_function(examples):
    return tokenizer(examples["feedback_processed"], truncation=True)


tokenized_datasets = d.map(tokenize_function, batched=True)

tokenized_datasets = tokenized_datasets.remove_columns(
    ["feedback", "__index_level_0__", "feedback_processed"]
)
tokenized_datasets.set_format("torch")

full_train_dataset = tokenized_datasets["train"]
full_eval_dataset = tokenized_datasets["test"]

metric = load_metric("accuracy")


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)


model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=3)

"""Hyper parameters for training."""

training_args = TrainingArguments(
    "test_trainer",
    learning_rate=5.691013656357132e-06,
    num_train_epochs=5,
    per_device_train_batch_size=8,
    seed=36,
    optim="adamw_torch",
)

"""The Trainer class provides an API for feature-complete training in PyTorch."""

trainer = Trainer(
    model=model,
    args=training_args,
    compute_metrics=compute_metrics,
    train_dataset=full_train_dataset,
    eval_dataset=full_eval_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
)
trainer.train()

"""Runs the evaluation against the test set."""

trainer.evaluate()

"""To save the trained model weights to current environment."""

trainer.save_model()

"""Load the trained model from the current environment."""

classifier = pipeline("sentiment-analysis", model="test_trainer", truncation=True)


def preprocess_incoming(str_data):
    return str_data.translate(str.maketrans("", "", string.punctuation)).lower()


def predict(string):
    data = preprocess_incoming(string)
    prediction = classifier(string)
    if prediction[0]["label"] == "LABEL_1":
        # return "NEUTRAL"
        return 1
    elif prediction[0]["label"] == "LABEL_0":
        # return "NEGATIVE"
        return 0
    elif prediction[0]["label"] == "LABEL_2":
        # return "POSITIVE"
        return 2


"""Loading a validation dataset."""

VALIDATION_SET = pd.read_csv("copy the path of validation dataset")
VALIDATION_SET["labels"] = label_encoder.fit_transform(VALIDATION_SET["labels"])
y_valid = VALIDATION_SET["labels"]
y_valid = y_valid.tolist()
y_pred = []
for i in VALIDATION_SET["feedback"]:
    y_pred.append(predict(i))

"""Validation accuracy."""
accuracy_score(y_valid, y_pred)

