# formsflow.ai Sentiment Analysis Component

![Python](https://img.shields.io/badge/Python-3.11.7-blue) ![Flask](https://img.shields.io/badge/Flask-3.1.0-blue) ![postgres](https://img.shields.io/badge/postgres-13.0-blue)
![Transformers](https://img.shields.io/badge/Transformers-4.49.0-blue)
![Torch](https://img.shields.io/badge/Torch-2.6.0-blue)

Sentiment Analysisis used to understand the sentiments of the customer for products, movies, and other such things, whether they feel positive, negative, or neutral about it. BERT is a very good pre-trained language model which helps machines learn excellent representations of text with respect to context in many natural language tasks. 

The goal of the Data Analysis API is to provide access to all relevant interfaces of
the system. It is built using Python :snake: .

## Table of Content

1. [Prerequisites](#prerequisites)
2. [Solution Setup](#solution-setup)
   * [Step 1 : Installation](#installation)
   * [Step 2 : Environment Configuration](#environment-configuration)
   * [Step 3 : Running the Application](#running-the-application)
   * [Step 4 : Verify the Application Status](#verify-the-application-status)


## Prerequisites

* For docker based installation [Docker](https://docker.com) need to be installed.
* Admin access to [Keycloak](../forms-flow-idm/keycloak) server and ensure audience(camunda-rest-api) is setup in Keycloak-bpm server.

## Solution Setup

### Installation

If you are interested in contributing to the project, you can install through docker or locally.

It's recommended to download dev-packages to follow Python coding standards for project like PEP8 if you are interested in contributing to project.
You installing dev-packages using pip as follows:

```python3 -m pip install -r requirements/dev.txt```
```python3 -m pip install -r requirements.txt```

### Running the Application

* forms-flow-data-analysis-api service uses port 5001, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-data-analysis-api`

* Run `docker-compose up -d` to start.


*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose up --build -d`*

#### To Stop the Application

* Run `docker-compose stop` to stop.

### Verify the Application Status

   The application should be up and available for use at port defaulted to 5001 in <http://localhost:5001/>
  
* Access the **/checkpoint** endpoint for a Health Check on API to see it's up and running.

```
GET http://localhost:5001/checkpoint

RESPONSE

{
    "message": "Welcome to formsflow.ai Data Analysis API"
}
```

* Get the access token

```
POST {Keycloak URL}/auth/realms/<realm>/protocol/openid-connect/token

Body:
grant_type: client_credentials
client_secret: {set client token}
client_id: forms-flow-bpm

Headers:
Content-Type : application/x-www-form-urlencoded

```

* Access the **/sentiment** endpoint and verify response. Ensure Bearer token is passed along

```
POST http://localhost:5001/sentiment

Headers:
Content-Type : application/json
Authorization: Bearer {access token}

Payload:
{   
    "applicationId":{Valid application id},
    "formUrl":"{Valid form URL}",
    "data":[{
        "text":"{Sample text}",
        "elementId":""
    }]
}

```

## Steps for enabling Sentiment Analysis component

One of the unique features of the formsflow.ai framework is Sentiment Analysis. It can analyze the sentiment from forms based on specific topics mentioned by the designer during form creation.

* A form designer can drag and drop **Text Area with Analytics component** and in section **Data** add key topics for Sentiment Analysis like facility, service, etc. This activates sentiment analysis component.
* Based on the input responses of the user formsflow.ai process sentiment associated with each user's responses and the response will be patched to mongo by Camunda listener.
* Workflow associated with sentiment analysis, you need to add the java class in listeners as `org.camunda.bpm.extension.hooks.delegates.FormTextAnalysisDelegate`. Refer the sample shown below:
![image (13)](https://user-images.githubusercontent.com/83584866/170023331-f5c6b5d0-e7ca-44a7-891d-7d06bbea5095.png)

* You can take data stored in mongodb and create **meaningful visualization** based on the  output of sentiment API in Redash dashboards. This information can be found in the **Insights section** for staff user formsflow.ai.

A potential architectural conflict, which can happen is the choosing of postgres database and mongodb database. What database should we use, for which arhchitecure.

### Additional reference

Check out the [installation documentation](https://aot-technologies.github.io/forms-flow-installation-doc/) for installation instructions and [features documentation](https://aot-technologies.github.io/forms-flow-ai-doc) to explore features and capabilities in detail.