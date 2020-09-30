import spacy
import nltk

from pathlib import Path

nltk.downloader.download("vader_lexicon")
nltk.downloader.download("punkt")
nltk.downloader.download("subjectivity")

from pathlib import Path
from collections import defaultdict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize


class SentimentAnalyserService():

    @staticmethod
    def sentiment_pipeline(text, topics):
        """
            sentiment analysis result
        """
        sentence, labels = load_model_output(text)
        ent = []

        for i, v in enumerate(labels):
            if v in topics:
                ent.append(sentence[i])
            
            
        if ent==[]:
            response = {}
            response["sentiment"] = None
            response["overall_sentiment"] = overall_sentiment(text)
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
                item = labels[i] #returns topic value instead of entity value
                if ss["compound"] >= 0.15:
                    sentiment_output[item] = "positive"
                elif ss["compound"] <= -0.01:
                    sentiment_output[item] = "negative"
                else:
                    sentiment_output[item] = "neutral"
            response = {}
            response["sentiment"] = sentiment_output
            response["overall_sentiment"] = overall_sentiment(text)

            return response



def load_model_output(text):
    # uncomment when working in linux and remove subsequent two lines
    # nlp = spacy.load("../models/quick-spacy/")
    model_path = Path(__file__).parent.absolute()/'models/quick-fourlabels/'
    nlp = spacy.load(model_path)
    doc = nlp(text)
    sentence = [ent.text for ent in doc.ents]
    labels = [ent.label_ for ent in doc.ents]
    return sentence, labels


def overall_sentiment(text):
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



def entity_category(text, topics):
    """ function to return the associated entities under each topic
    params text: Input text
    params topic: Suitable topics

    Output response:
        [
            {"topic": "staff", "entity": "frontdesk"},
            {"topic": "facility", "entity": "restroom"},
            {"topic": "service", "entity": "driving license application"}
        ]
    """
    sentence, labels = load_model_output(text)
    # check docs to know more about defaultdict: https://docs.python.org/3/library/collections.html#collections.defaultdict
    d = defaultdict(list)
    l = len(sentence)
    for i in range(l):
        d[labels[i]].append(sentence[i])

    entity_response = sorted(d.items())
    

    new = []
    for _, t in enumerate(entity_response):
        k, value = t
        if k in topics:
            for _, t in enumerate(value):
                entity_object = {"topic":k, "entity":t}
                new.append(entity_object)
    return new
