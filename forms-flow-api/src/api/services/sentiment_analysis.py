import spacy
import nltk

nltk.downloader.download("vader_lexicon")
nltk.downloader.download("punkt")
nltk.downloader.download("subjectivity")

from pathlib import Path
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize


def sentiment_pipeline(text):
    """
    A input pipeline which returns for a given text blob, output of
    aspect based sentiment analaysis as list of entities with associated
    sentiment.

    Usage::
        >> pipeline(text="awesome staff and tea was epic.")
        {
            "overall_sentiment": "positive",
            "sentiment": {
                "tea": "positive",
                "staff": "positive"
            }
        }

    :param  text: The input text blob which is being used by model
    """
    # uncomment when working in linux and remove subsequent two lines
    # nlp = spacy.load("../models/quick-spacy/")
    model_path = Path(
        r"D:\work\forms-flow-ai-dev\forms-flow-api\src\api\service\models\quick-spacy"
    )  # modify later
    nlp = spacy.load(model_path)
    doc = nlp(text)
    a = [ent.text for ent in doc.ents]
    ent = a.copy()
    full_sentence = []
    full_text = text.split(".")

    for i in range(len(ent)):
        temp = ""
        for t in full_text:
            if len(full_text) >= 1:
                if ent[i] in t.lstrip():
                    temp += t
        full_sentence.append(temp)

    sid = SentimentIntensityAnalyzer()
    full_text = full_sentence
    sentiment_output = {}

    for i, t in enumerate(full_text):
        ss = sid.polarity_scores(t)
        item = ent[i]
        if ss["compound"] >= 0.15:
            sentiment_output[item] = "positive"
        elif ss["compound"] <= -0.01:
            sentiment_output[item] = "negative"
        else:
            sentiment_output[item] = "neutral"
    ans = {}
    ans["sentiment"] = sentiment_output
    ans["overall_sentiment"] = overall_sentiment(text)

    return ans
