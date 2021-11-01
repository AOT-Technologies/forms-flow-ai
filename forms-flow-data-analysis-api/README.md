## formsflow.ai Sentiment Analysis Component

![Python](https://img.shields.io/badge/python-3.8-blue) ![Flask](https://img.shields.io/badge/Flask-1.1.4-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)

### About Sentiment Analysis model


1. Our dynamic ontology aware topics modelling and sentiment analysis module required data for analysis. 
So we have collected the initial data from a generic dataset in Kaggle along by collecting dataset obtained
from public sources like customer reviews of BC Government services centres from google maps.

2. The input dataset was cleaned using various preprocessing techniques and transformed into tidy text data.
 
3. The collected Data was annotated using a NER analyser tool like Docanno to understand the specific entities
of the dataset. A sample text 

```
     (
        "The service at Victoria centre was completed very quickly. Also the staff was very helpful"
        {
            "entities": [
                (4, 11, "SER", "pos"),
                (15, 23, "LOC", "pos"),
                (68, 73, "STAFF", "pos"),
            ]
        },
    )
```

4. Once the data was prepared, a variety of techniques for identifying topics and sentiment analysis was tried
out like Latent Semantic Analysis, LSTMs, BERTs. Finally, the ML model was built using a two-stage pipeline process
to identify entities and their associated sentiment. We use a named entity recognition model(NER) to
identify the topics, and further sentiment analysis is being done for individual entities.


5. The output of our model for the model using our ML model for a sample input is as shown below:

> text="awesome location and great staff. Staff provided excellent service."

```
{
  'sentiment': {'location': 'positive', 'facility': 'positive'},
  'overall_sentiment': 'positive'
}
```

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

A potential architectural conflict, which can happen is the choosing of
postgres database and mongodb database. What database should we use, for
which arhchitecure. 
