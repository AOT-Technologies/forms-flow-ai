from pathlib import Path
from typing import List

import spacy
from nltk.sentiment.vader import SentimentIntensityAnalyzer

def sentiment_analysis_pipeline(text: str, topics:List[str]=None, entity_sentiment: bool = True):
    """A input pipeline which returns for a given text blob, output of
    aspect based sentiment analaysis as list of entities with associated
    sentiment.

    :params text: The input text blob being entered by user
    :params topic: Associated topics for which sentiment is being calculated

    Usage:
        >> sentiment_pipeline(text="awesome location and great staff. Staff provided excellent service.",
                              topics=["staff", "service"],
                              entity_sentiment=True)
        {'sentiment': {'location': 'positive', 'facility': 'positive'},
        'overall_sentiment': 'positive'}
    """
    if entity_sentiment: return sentiment_entity_analysis(text, topics)
    else:
        return {"overall_sentiment": overall_sentiment(text)}

def sentiment_entity_analysis(text: str, topics: List[str]=None):
    sentence, labels = load_model_output(text)
    ent = []

    for i, v in enumerate(labels):
        if v in topics:
            ent.append(sentence[i])

    if not ent:
        response = {"sentiment": None, "overall_sentiment": overall_sentiment(text)}
        return response

    else:
        full_sentence = []
        full_text = text.split(".")

        # code to match entities based on splliting point `.`. Scope for further improvement
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
            item = labels[i]  # returns topic value instead of entity value
            # sentiment_output.setdefault(item, [])
            if ss["compound"] >= 0.15:
                sentiment_output[item] = "positive"
                # sentiment_output[item].append("positive")
            elif ss["compound"] <= -0.01:
                sentiment_output[item] = "negative"
                # sentiment_output[item].append("negative")
            else:
                sentiment_output[item] = "neutral"
                # sentiment_output[item].append("neutral")

        response = {}
        response["sentiment"] = sentiment_output
        response["overall_sentiment"] = overall_sentiment(text)

        return response


def load_model_output(text: str):
    """Function to load the trained machine learning model for inference and
    return the output as the necessary entities and topics for each element

    param text: The input text blob being entered by user
    """
    model_path = Path("../../models/quick-spacy/")
    nlp = spacy.load(model_path)
    doc = nlp(text)
    sentence = [ent.text for ent in doc.ents]
    labels = [ent.label_ for ent in doc.ents]
    return sentence, labels


def overall_sentiment(text: str):
    """Function to calculate the overall sentiment using NLTK's vader library.

    param text: The input text blob being entered by user
    """
    sid = SentimentIntensityAnalyzer()
    ss = sid.polarity_scores(text)
    for _ in sorted(ss):
        if ss["compound"] >= 0.15:
            return "POSITIVE"
        elif ss["compound"] <= -0.01:
            return "NEGATIVE"
        else:
            return "NEUTRAL"

