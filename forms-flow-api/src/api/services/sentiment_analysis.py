from app import app

import spacy
import nltk

nltk.downloader.download("vader_lexicon")
nltk.downloader.download("punkt")
nltk.downloader.download("subjectivity")

from pathlib import Path
from collections import defaultdict

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize


def load_model_output(text):
    # uncomment when working in linux and remove subsequent two lines
    # nlp = spacy.load("../models/quick-spacy/")
    model_path = Path("../models/quick-spacy")  # modify later
    nlp = spacy.load(model_path)
    doc = nlp(text)
    sentence = [ent.text for ent in doc.ents]
    labels = [ent.label_ for ent in doc.ents]
    return sentence, labels


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
    sentence, labels = load_model_output(text)
    ent = sentence.copy()

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


def overall_sentiment(text):
    # tokenize_text = tokenize.sent_tokenize(text)
    # print(tokenize_text)
    sid = SentimentIntensityAnalyzer()
    ss = sid.polarity_scores(text)
    for k in sorted(ss):
        # print('{0}: {1}, '.format(k, ss[k]), end='')
        if ss["compound"] >= 0.15:
            return "positive"
        elif ss["compound"] <= -0.01:
            return "negative"
        else:
            return "neutral"


def entity_category(text):
    """" function to return the associated entities under each topic
    final output=>
        defaultdict(<class 'list'>, {'FAC': ['flat sheets', 'comforter Gym', 'Views'], 
        'PERSON': ['staff'], 'SER': ['Room service'], 'FOOD': ['Cerise Bar']})
    """"
    sentence, labels = load_model_output(text)
    # check docs to know more about defaultdict: https://docs.python.org/3/library/collections.html#collections.defaultdict
    d = defaultdict(list)
    l = len(sentence)
    for i in range(l):
        d[labels[i]].append(sentence[i])

    return d
