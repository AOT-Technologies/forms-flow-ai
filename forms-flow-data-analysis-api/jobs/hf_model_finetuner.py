"""Script to demonstrate how to fine tune a model to
calculate overall sentiment score for a given dataset
using Hugging FACE library. 

Dataset used: IMDB
Model used: distilbert-base-uncased-finetuned-sst-2-english
"""
import numpy as np
from datasets import load_dataset
from datasets import load_metric
from transformers import AutoTokenizer
from transformers import AutoModel
from transformers import AutoModelForSequenceClassification
from transformers import Trainer
from transformers import TrainingArguments

imdb = load_dataset("imdb")
labels = imdb["train"].features["label"].names

checkpoint = "distilbert-base-uncased-finetuned-sst-2-english"

tokenizer = AutoTokenizer.from_pretrained(checkpoint)


def tokenize_imdb_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)


tokenized_datasets = imdb.map(tokenize_imdb_function, batched=True)
tokenized_datasets = tokenized_datasets.remove_columns(["text"])
tokenized_datasets = tokenized_datasets.rename_column("label", "labels")
tokenized_datasets.set_format("torch")

full_train_dataset = tokenized_datasets["train"]
full_eval_dataset = tokenized_datasets["test"]

metric = load_metric("accuracy")


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)


model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)

batch_size = 8
logging_steps = len(imdb["train"]) // batch_size
model_name = f"{checkpoint}-finetuned-imdb"
training_args = TrainingArguments(
    output_dir=model_name,
    num_train_epochs=1,
    learning_rate=2e-5,
    per_device_train_batch_size=batch_size,
    per_device_eval_batch_size=batch_size,
    weight_decay=0.01,
    evaluation_strategy="epoch",
    disable_tqdm=False,
    logging_steps=logging_steps,
    push_to_hub=True,
    log_level="error",
)

model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)
trainer = Trainer(
    model=model,
    args=training_args,
    compute_metrics=compute_metrics,
    train_dataset=full_train_dataset,
    eval_dataset=full_eval_dataset,
    tokenizer=tokenizer,
)
trainer.train()

trainer.evaluate()

trainer.push_to_hub("pushing imdb-fine tuned model")
