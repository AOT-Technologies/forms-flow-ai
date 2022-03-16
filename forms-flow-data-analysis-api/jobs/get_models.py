"""The file to download ML pretrained models from HuggingFace.
> Should be run during build process of ML model.
"""
from transformers import AutoTokenizer
from transformers import AutoModel

checkpoint = "distilbert-base-uncased"


def get_model(checkpoint):
    """Loads model from Hugginface model hub"""
    tokenizer = AutoTokenizer.from_pretrained(checkpoint)
    model = AutoModel.from_pretrained(checkpoint)
    return tokenizer, model


def main():
    get_model(checkpoint)


if __name__ == "__main__":
    main()
