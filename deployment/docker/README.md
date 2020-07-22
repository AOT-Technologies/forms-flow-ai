# FormsFlow.AI

This page elaborates how to setup the overall solution using docker.


## Table of Contents
* [Prerequisites](#prerequisites)
* [Project Setup](#project-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Initial Installation](#installation)
  * [Step 3 : Setting up the environment](#environment-configuration)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Health Check](#health-check) 


## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Project Setup

### Keycloak Setup

Follow the instructions given on [link](../../forms-flow-idm/keycloak-setup.md)


      
### Initial Installation

   * Make sure you have a Docker machine up and running.
   * Start the analytics server by following the instructions given on  [README](../../forms-flow-analytics/README.md)
   * Start the FormIO server by following the instructions given on  [README](../../forms-flow-forms/README.md)
   * Make sure your current working directory is "/deployment/docker".
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. Details in the below Environment Configuration,   
### Environment Configuration

Environment variables are set in **.env** and read by the system.  

**FormsFlow.AI Role Mapping:**
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CLIENT_ROLE`|	The role name used for client users|| formsflow-client
`CLIENT_ROLE_ID`|form.io client role Id|eg. 10121d8f7fadb18402a4c|must get the value from form.io resource **/roles**
`REVIEWER_ROLE`|The role name used for staff/reviewer users||`formsflow-reviewer`
`REVIEWER_ROLE_ID`|form.io reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|must get the value from form.io resource **/roles**
`DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
`DESIGNER_ROLE_ID`|form.io administrator role Id|eg. 5ee090afee045f1597609cae|must get the value from form.io resource **/roles**
`ANONYMOUS_ID`|form.io anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|must get the value from form.io resource **/roles** 
`USER_RESOURCE_ID`|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|must get the value from form.io resource **/user**

**FormsFlow.AI Datastore Settings:**
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`WEB_API_DATABASE_URL`|JDBC DB Connection URL for FormsFlow||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/formsflow`
`WEB_API_POSTGRES_USER`|FormsFlow database postgres user|Used on installation to create the database.Choose your own|`postgres`
`WEB_API_POSTGRES_PASSWORD`|FormsFlow database postgres password|ditto|`changeme`
`WEB_API_POSTGRES_DB`|FormsFlow database name||`formsflow`

**FormsFlow.AI Integration Settings:**
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`NODE_ENV`| Define project level configuration | `development, test, production` | `development`
`CAMUNDA_API_URI`|Camunda Rest API URI||`http://localhost:8000/camunda/engine-rest/`
`FORMIO_DEFAULT_PROJECT_URL`|The URL of the form.io server||`http://localhost:3001`
`REACT_APP_WEB_BASE_URL`|FormsFlow Rest API URI||`http://localhost:5000/api`

**Authentication Provider (Keycloak) Settings:**
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_TOKEN_URL`|Keycloak OIDC token API for clients|Plug in your Keycloak base url and realm name|`{Keycloak URL}/auth/realms/<realm>/protocol/openid-connect/token`
`KEYCLOAK_JWT_OIDC_CONFIG`|Path to Keycloak well-know config for realm|Plug in your Keycloak URL plus realm|`{Keycloak URL}/auth/realms/<REALM>/.well-known/openid-configuration`
`KEYCLOAK_JWT_OIDC_JWKS_URI`|Keycloak JWKS URI|Plug in Keycloak base url plus realm|`{Keycloak URL}/auth/realms/<REALM>/protocol/openid-connect/certs`
`KEYCLOAK_JWT_OIDC_ISSUER`|The issuer of JWT's from Keycloak for your realm|Plug in your realm and Keycloak base url|`{Keycloak URL}/auth/realms/forms-flow-ai`
`KEYCLOAK_BPM_CLIENTID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|must be set to your Keycloak client id
`KEYCLOAK_BPM_CLIENTSECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret
`KEYCLOAK_WEB_CLIENTID`|Client ID for FormsFlow to register with Keycloak|eg. forms-flow-web|must be set to your Keycloak client id

**BPM (Camunda) Datastore Settings:**
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CAMUNDA_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database.Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/postgres`
`CAMUNDA_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
`CAMUNDA_POSTGRES_USER`|Postgres Database Username|Used on installation to create the database.Choose your own|`postgres`
`CAMUNDA_POSTGRES_PASSWORD`|Postgres Database Password|Used on installation to create the database.Choose your own|`changeme`
`CAMUNDA_POSTGRES_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`camunda`


**Analytics (Redash) Integration Settings:**
 
 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_BASE`|Insight Api base end-point||`http://localhost:7000`
`INSIGHT_API_KEY`|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| must be set to your ReDash API key
   
   **Additionally, you may want to change these**
 ```  
        * The value of database details (especially if this instance is not just for testing purposes)
 ```
 ```
        * The Postgres volume definition [This may apply for windows based setup. Refer the README of individual modules.]  
                    *  [forms-flow-analytics](../../forms-flow-analytics/README.md)  
                    *  [forms-flow-forms](../../forms-flow-forms/README.md)  
                    *  [forms-flow-bpm](../../forms-flow-bpm/README.md)  
                    *  [forms-flow-api](../../forms-flow-api/README.md)     
```

### Running the Application
   * Run `docker-compose build` to build.
   * Run `docker-compose up -d` to start.
  
### Health Check
  * Analytics should be up and available for use at port defaulted to 7000 i.e. http://localhost:7000/
  * Business Process Engine should be up and available for use at port defaulted to 8000 i.e. http://localhost:8000/camunda/
  * FormIO should be up and available for use at port defaulted to 3001 i.e. http://localhost:3001/
  * FormsFlow Rest API should be up and available for use at port defaulted to 5000 i.e. http://localhost:5000/api/
  * FormsFlow web application should be up and available for use at port defaulted to 3000 i.e. http://localhost:3000/
  
