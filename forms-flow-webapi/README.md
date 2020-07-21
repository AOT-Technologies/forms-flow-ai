# FormsFlow.AI Rest API 
**FormsFlow.AI** has built this adaptive tier for correlating form management, BPM and analytics together.

The goal of the REST API is to provide access to all relevant interfaces of the system.

## Table of Content
* [Prerequisites](#prerequisites)
* [Solution Setup](#solution-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Verify the application status](#verify-the-application-status) 
* [How-to export roles and Forms](#how-to-export-roles-and-forms)   

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Solution Setup

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
`KEYCLOAK_TOKEN_URL`|Keycloak OIDC token API for clients|Plug in your Keycloak base url and realm name|`{Keycloak URL}/auth/realms/<realm>/protocol/openid-connect/token`
`KEYCLOAK_JWT_OIDC_CONFIG`|Path to Keycloak well-know config for realm|Plug in your Keycloak URL plus realm|`{Keycloak URL}/auth/realms/<REALM>/.well-known/openid-configuration`
`KEYCLOAK_JWT_OIDC_JWKS_URI`|Keycloak JWKS URI|Plug in Keycloak base url plus realm|`{Keycloak URL}/auth/realms/<REALM>/protocol/openid-connect/certs`
`KEYCLOAK_JWT_OIDC_ISSUER`|The issuer of JWT's from Keycloak for your realm|Plug in your realm and Keycloak base url|`{Keycloak URL}/auth/realms/forms-flow-ai`
`KEYCLOAK_BPM_CLIENTID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|must be set to your Keycloak client id
`KEYCLOAK_BPM_CLIENTSECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret
`KEYCLOAK_WEB_CLIENTID`|Client ID for FormsFlow to register with Keycloak|eg. forms-flow-web|must be set to your Keycloak client id
`CAMUNDA_API_URI`|Camunda Rest API URI||`http://localhost:8000/camunda/engine-rest/`

### Running the Application

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-webapi".
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. Additionally, you may want to change these
  ```       
         The Postgres volume definition
    volumes:
       - ./postgres/webapi:/data/postgres
  ```
         The value of Postgres database details (especially if this instance is not just for testing purposes)
   * Run `docker-compose build` to build.
   * Run `docker-compose up -d` to start.
  

### Verify the application status

   The application should be up and available for use at port defaulted to 5000 in docker-compose.yml (i.e. http://localhost:5000/)
  
    
   * Get the access token
```
POST {Keycloak URL}/auth/realms/process-engine/protocol/openid-connect/token

Body:
grant_type: client_credentials
client_secret: a3413dbd-caf2-41a8-ae54-e7aa448154d8
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


