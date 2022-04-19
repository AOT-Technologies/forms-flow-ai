# formsflow.ai Sentiment Analysis Component

![Python](https://img.shields.io/badge/Python-3.8-blue) ![Flask](https://img.shields.io/badge/Flask-1.1.4-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)
![Transformers](https://img.shields.io/badge/Transformers-4.18.0-blue)
![Torch](https://img.shields.io/badge/Torch-1.10.0+cu111-blue)

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

### Keycloak Setup

No specific client creation is required. Audience has been added for clients
**forms-flow-web** and **forms-flow-bpm**.  

### Environment Configuration

* Make sure you have a Docker machine up and running.
* Make sure your current working directory is "forms-flow-ai/forms-flow-data-analysis-api".
* Rename the file [sample.env](./sample.env) to **.env**.
* Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
* **NOTE : {your-ip-address} given inside the .env file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
`KEYCLOAK_URL_REALM`|The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for Web to register with Keycloak|eg. forms-flow-web|`forms-flow-web`
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for Web to register with Keycloak|eg. forms-flow-web|`forms-flow-web`
`DATA_ANALYSIS_DB_USER` |formsflow data analysis database postgres user|Used on installation to create the database.Choose your own|`general`
`DATA_ANALYSIS_DB_PASSWORD` |formsflow data analysis database postgres password|Used on installation to create the database.Choose your own|`changeme`
`DATA_ANALYSIS_DB_NAME` |formsflow data analysis database name|Used on installation to create the database.Choose your own|`dataanalysis`
`DATA_ANALYSIS_DB_URL` |JDBC DB Connection URL for formsflow||`postgresql://general:changeme@forms-flow-data-analysis-db:5432/dataanalysis`
`DATA_ANALYSIS_API_BASE_URL`:triangular_flag_on_post:|formsflow.ai Data analysis API URL||`http://{your-ip-address}:5001`
`MODEL_ID`:triangular_flag_on_post:|formsflow.ai Hugging face model id||`xaqren/sentiment_analysis`

**NOTE : Default realm is `forms-flow-ai`**

### Running the Application

* forms-flow-data-analysis-api service uses port 5001, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-data-analysis-api`

* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

#### To Stop the Application

* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml stop` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml stop` to stop.

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

## Model description [xaqren/sentiment_analysis](https://huggingface.co/xaqren/sentiment_analysis)


This is a fine-tuned downstream version of the bert-base-uncased model for sentiment analysis, this model is not intended for further downstream fine-tuning for any other tasks. This model is trained on a classified dataset for text-classification.


## Steps for enabling Sentiment Analysis component

One of the unique features of the formsflow.ai framework is Sentiment Analysis. It can analyze the sentiment from forms based on specific topics mentioned by the designer during form creation.

* A form designer can drag and drop **Text Area with Analytics component** and in section **Data** add key topics for Sentiment Analysis like facility, service, etc. This activates sentiment analysis component.
* Based on the input responses of the user formsflow.ai process sentiment associated with each user's responses and stores it MongoDB database using **Python API**.
* You can take data stored in mongodb and create **meaningful visualization** based on the  output of sentiment API in Redash dashboards. This information can be found in the **Insights section** for staff user formsflow.ai.

A potential architectural conflict, which can happen is the choosing of postgres database and mongodb database. What database should we use, for which arhchitecure.

