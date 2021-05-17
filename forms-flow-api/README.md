# formsflow.ai API 

![Python](https://img.shields.io/badge/python-3.8-blue) ![Flask](https://img.shields.io/badge/Flask-1.1.1-blue) ![postgres](https://img.shields.io/badge/postgres-latest-blue)

**formsflow.ai** has built this adaptive tier for correlating form management, BPM and analytics together.

The goal of the REST API is to provide access to all relevant interfaces of 
the system. It is built using Python :snake: .

## Table of Content
* [Prerequisites](#prerequisites)
* [Solution Setup](#solution-setup)
  * [Step 1 : Installation](#intallation)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Verify the Application Status](#verify-the-application-status) 
* [Steps for enabling sentiment analysis component](#steps-for-enabling-sentiment-analysis-component)

## Prerequisites

We are assuming [docker-compose](https://docs.docker.com/compose/) and [docker](https://docker.com)
is already installed, which is required to run and deploy the system.

## Solution Setup

### Keycloak Setup

No specific client creation is required. Audience has been added for clients 
**forms-flow-web** and **forms-flow-bpm**.  

### Environment Configuration

Environment variables are set in **.env** and read by the system.

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-api".
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. Details below,

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`WEB_API_POSTGRES_USER`|formsflow database postgres user|Used on installation to create the database.Choose your own|`postgres`
`WEB_API_POSTGRES_PASSWORD`|formsflow database postgres password|ditto|`changeme`
`WEB_API_POSTGRES_DB`|formsflow database name||`formsflow`
`WEB_API_DATABASE_URL`|JDBC DB Connection URL for formsflow||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/formsflow`
`KEYCLOAK_TOKEN_URL`|Keycloak OIDC token API for clients|Plug in your Keycloak base url and realm name|`{Keycloak URL}/auth/realms/<realm>/protocol/openid-connect/token`
`KEYCLOAK_JWT_OIDC_CONFIG`|Path to Keycloak well-know config for realm|Plug in your Keycloak URL plus realm|`{Keycloak URL}/auth/realms/<REALM>/.well-known/openid-configuration`
`KEYCLOAK_JWT_OIDC_JWKS_URI`|Keycloak JWKS URI|Plug in Keycloak base url plus realm|`{Keycloak URL}/auth/realms/<REALM>/protocol/openid-connect/certs`
`KEYCLOAK_JWT_OIDC_ISSUER`|The issuer of JWT's from Keycloak for your realm|Plug in your realm and Keycloak base url|`{Keycloak URL}/auth/realms/forms-flow-ai`
`KEYCLOAK_BPM_CLIENTID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|must be set to your Keycloak client id
`KEYCLOAK_BPM_CLIENTSECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret
`KEYCLOAK_WEB_CLIENTID`|Client ID for formsflow to register with Keycloak|eg. forms-flow-web|must be set to your Keycloak client id
`CAMUNDA_API_URI`|Camunda Rest API URI||`http://localhost:8000/camunda`
`WEB_API_BASE_URL`|formsflow.ai Rest API URI||`http://localhost:5000`
`MONGODB_URI`|Mongo DB Connection URL of formio for sentiment analysis||`mongodb://username:password@host:port/analytics?authSource=admin&authMechanism=SCRAM-SHA-256`


 **Additionally, you may want to change these**  
 
*   Uncomment below variables if no external mongo db setup is available

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`WEBAPI_MONGO_USERNAME`|Mongo DB Connection username||`mongo`
`WEBAPI_MONGO_PASSWORD`|Mongo DB Connection password||`changeme`
`WEBAPI_MONGO_DATABASE`|Mongo DB Connection database name||`analytics`

   * Modify MONGODB_URI variable accordingly
   * Uncomment Analytics DB section from docker-compose-{Your Variant}.yml 

*   The value of Datastore credentials (especially if this instance is not just for testing purposes)

### Running the Application
* For Linux,
   * Run `docker-compose -f docker-compose-linux.yml build` to build.
   * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
   * Run `docker-compose -f docker-compose-windows.yml build` to build.
   * Run `docker-compose -f docker-compose-windows.yml up -d` to start.
   
#### To Stop the Application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml down` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml down` to stop.
   
### Verify the Application Status

   The application should be up and available for use at port defaulted to 5000 in docker-compose.yml (i.e. http://localhost:5000/)
  
    
   * Get the access token
```
POST {Keycloak URL}/auth/realms/process-engine/protocol/openid-connect/token

Body:
grant_type: client_credentials
client_secret: {set client token}
client_id: forms-flow-bpm

Headers:
Content-Type : application/x-www-form-urlencoded

```   
   * Access the **/task** endpoint and verify response.
``` 
GET http://localhost:5000/task

Headers:
Content-Type : application/json
Authorization: Bearer {access token}
``` 

   * Checkout out the API documentation which can be accessed at **/swagger** endpoint.
   
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

### About Sentiment Analysis model

Currently, the ML model is build leveraging libraries like Spacy and NLTK. It uses a two
stage pipeline process to find the entities belonging to a topic and their associated
sentiment. We use a named entity recognition model(NER) to train to identify the topics,
and further sentiment analysis is being done for individual entities.
