## formsflow.ai Sentiment Analysis Component

![Python](https://img.shields.io/badge/python-3.8-blue) ![Flask](https://img.shields.io/badge/Flask-1.1.4-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)

### About Sentiment Analysis model

Currently, the ML model is build leveraging libraries like Spacy and NLTK. It uses a two
stage pipeline process to find the entities belonging to a topic and their associated
sentiment. We use a named entity recognition model(NER) to train to identify the topics,
and further sentiment analysis is being done for individual entities.

## Steps for enabling Sentiment Analysis component

One of the unique features of the formsflow.ai framework is Sentiment Analysis. It can
analyze the sentiment from forms based on specific topics mentioned by the designer
during form creation.

- A form designer can drag and drop **Text Area with Analytics component** and in section
**Data** add key topics for Sentiment Analysis like facility, service, etc. This activates
sentiment analysis component.
- Based on the input responses of the user formsflow.ai process sentiment associated
 with each user's responses and stores it MongoDB database using **Python API**.
- You can take data stored in mongodb and create **meaningful visualization** based on the 
output of sentiment API in Redash dashboards. This information can be found in the **Insights section**
for staff user formsflow.ai.

