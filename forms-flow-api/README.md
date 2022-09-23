# formsflow.ai API

[![FormsFlow API CI](https://github.com/AOT-Technologies/forms-flow-ai-dev/actions/workflows/forms-flow-api-ci.yml/badge.svg?branch=develop)](https://github.com/AOT-Technologies/forms-flow-ai-dev/actions)
![Python](https://img.shields.io/badge/python-3.9-blue) ![Flask](https://img.shields.io/badge/Flask-2.1.3-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)
[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=ef8336)](https://pycqa.github.io/isort/) [![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)[![linting: pylint](https://img.shields.io/badge/linting-pylint-yellowgreen)](https://github.com/PyCQA/pylint)

**formsflow.ai** has built this adaptive tier for correlating form management, BPM and analytics together.

The goal of the REST API is to provide access to all relevant interfaces of
the system. It is built using Python :snake: .

## Table of Content

1. [Prerequisites](#prerequisites)
2. [Solution Setup](#solution-setup)
   * [Step 1 : Installation](#installation)
   * [Step 2 : Environment Configuration](#environment-configuration)
   * [Step 3 : Running the Application](#running-the-application)
   * [Step 4 : Verify the Application Status](#verify-the-application-status)
3. [API Documentation](#api-documentation)
4. [Unit Testing](#unit-testing)

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
* Make sure your current working directory is "forms-flow-ai/forms-flow-api".
* Rename the file [sample.env](./sample.env) to **.env**.
* Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
* **NOTE : {your-ip-address} given inside the .env file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_URL`:triangular_flag_on_post: | The forms-flow-analytics Api base end-point | | <http://{your-ip-address}:7000> |
`INSIGHT_API_KEY` :triangular_flag_on_post: | The forms-flow-analytics admin API key | | `Get the api key from forms-flow-analytics (REDASH) by following the 'Get the Redash API Key' steps from [here](../forms-flow-analytics/README.md#get-the-redash-api-key)`
`FORMSFLOW_API_DB_USER`|formsflow database postgres user|Used on installation to create the database.Choose your own|`postgres`
`FORMSFLOW_API_DB_PASSWORD`|formsflow database postgres password|Used on installation to create the database.Choose your own|`changeme`
`FORMSFLOW_API_DB_NAME`|formsflow database name|Used on installation to create the database.Choose your own|`FORMSFLOW_API_DB`
`FORMSFLOW_API_DB_URL`|JDBC DB Connection URL for formsflow||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/webapi`
`KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
`KEYCLOAK_URL_REALM`|The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
`KEYCLOAK_BPM_CLIENT_ID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|`forms-flow-bpm`
`KEYCLOAK_BPM_CLIENT_SECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`e4bdbd25-1467-4f7f-b993-bc4b1944c943` <br><br>`To generate a new keycloak client seceret by yourself follow the steps from` [here](../forms-flow-idm/keycloak/README.md#getting-the-client-secret)
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for formsflow to register with Keycloak|eg. forms-flow-web|`forms-flow-web`
`BPM_API_URL`:triangular_flag_on_post:|Camunda Rest API URL||`http://{your-ip-address}:8000/camunda`
`FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow.ai Rest API URL||`http://{your-ip-address}:5000`
`FORMSFLOW_API_CORS_ORIGINS`| formsflow.ai Rest API allowed origins, for allowing multiple origins you can separate host address using a comma seperated string or use * to allow all origins |eg:`host1, host2, host3`| `*`

**NOTE : Default realm is `forms-flow-ai`**

### Running the Application

* forms-flow-api service uses port 5000, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-api`

* Run `docker-compose up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose up --build -d`*

#### To Stop the Application

* Run `docker-compose stop` to stop.

### Verify the Application Status

   The application should be up and available for use at port defaulted to 5000 in <http://localhost:5000/>
  
* Access the **/checkpoint** endpoint for a Health Check on API to see it's up and running.

```
GET http://localhost:5000/checkpoint

RESPONSE

{
    "message": "Welcome to formsflow.ai API"
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

* Access the **/task** endpoint and verify response. Ensure Bearer token is passed along

```
GET http://localhost:5000/task

Headers:
Content-Type : application/json
Authorization: Bearer {access token}
```

## API Documentation

The API docs can be accessed by checking the **/** root endpoint.

![image](https://user-images.githubusercontent.com/70306694/130730233-cf443a84-7716-4be6-b196-cb340509c495.png)

Further documentation and associated postman collection for API endpoint
can found in the [docs folder](./docs)

## Unit Testing

We have implemented unit tests with pytest.

* Test cases are provided in the [tests folder](./tests).
* Run the tests by ensuring appropriate test environment variables are
setup in the [.env file](./sample.env).
* Using the make command, run the tests by running `make test`.

Things to note when writing tests:

* Isolated: Each test should be an introvert, working in their own isolated bubble. You should never have to think about what other tests have put in the database.
* Tests functions should contain always `app, client, session`

#### References for Testing in Python

* [pytest](https://docs.pytest.org/en/latest/getting-started.html)
* [Real Python Unit Testing with Pytest](https://realpython.com/pytest-python-testing/)
* [More about similar test config we have used](http://alexmic.net/flask-sqlalchemy-pytest/)

