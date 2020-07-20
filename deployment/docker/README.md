# FormsFlow.AI

## Table of contents
* [Prerequisites](#prerequisites)
* [Project Setup](#project-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Verify the application status](#verify-the-application-status) 

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Project Setup

### Keycloak Setup

TO DO

### Environment Configuration

Environment variables are set in **.env** and read by system.

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`WEB_API_POSTGRES_USER`|FormsFlow database postgres user|Used on installation to create the database.Choose your own|`postgres`
`WEB_API_POSTGRES_PASSWORD`|FormsFlow database postgres password|ditto|`changeme`
`WEB_API_POSTGRES_DB`|FormsFlow database name||`formsflow`
`WEB_API_DATABASE_URL`|JDBC DB Connection URL for FormsFlow||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/formsflow`
`KEYCLOAK_TOKEN_URL`|Keycloak OIDC token API for clients|Plug in your keycloak base url and realm name|`{Keycloak URL}/auth/realms/<realm>/protocol/openid-connect/token`
`KEYCLOAK_JWT_OIDC_CONFIG`|Path to Keycloak well-know config for realm|Plug in your keycloak URL plus realm|`{Keycloak URL}/auth/realms/<REALM>/.well-known/openid-configuration`
`KEYCLOAK_JWT_OIDC_JWKS_URI`|Keycloak JWKS URI|Plug in Keycloak base url plus realm|`{Keycloak URL}/auth/realms/<REALM>/protocol/openid-connect/certs`
`KEYCLOAK_JWT_OIDC_ISSUER`|The issuer of JWT's from Keycloak for your realm|Plug in your realm and Keycloak base url|`{Keycloak URL}/auth/realms/forms-flow-ai`
`KEYCLOAK_BPM_CLIENTID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|must be set to your keycloak client id
`KEYCLOAK_BPM_CLIENTSECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to yourkeycloak client secret
`KEYCLOAK_WEB_CLIENTID`|Client ID for FormsFlow to register with Keycloak|eg. forms-flow-web|must be set to your keycloak client id
`CAMUNDA_API_URI`|Camunda Rest API URI||`http://localhost:8000/camunda/engine-rest/`

### Running the Application

#### Using Docker
   * Make sure you have a Docker machine up and running.
   * Start the analytics server by following the instructions given on  [README](../../forms-flow-analytics/README.md)
   * Start the FormIO server by following the instructions given on  [README](../../forms-flow-forms/README.md)
   * Make sure your current working directory is "/deployment/docker".
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. For example, you may want to change these:
  ```       
         The Postgres volume definition
    volumes:
       - ./postgres/webapi:/data/postgres
  ```
         The value of Postgres database details (especially if this instance is not just for testing purposes)
   * Run `docker-compose build` to build.
   * Run `docker-compose up -d` to start.
  

