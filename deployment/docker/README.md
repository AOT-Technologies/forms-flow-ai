# formsflow.ai

This page elaborates how to setup the overall solution using docker.


## Table of Contents
* [Prerequisites](#prerequisites)
* [Solution Setup](#solution-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Installation](#installation)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Health Check](#health-check) 


## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Solution Setup

### Keycloak Setup

Follow the instructions given on [link](../../forms-flow-idm/keycloak-setup.md)

      
### Installation

   * Make sure you have a Docker machine up and running.
   * Start the **analytics server** by following the instructions given on  [README](../../forms-flow-analytics/README.md)
   * Make sure your current working directory is "/deployment/docker".
   * Rename the file **sample.env** to **.env**.
   * Start the **form.io server** by modifying listed form.io related environment variables **(Skip this step if the pre-defined template i.e.sample.json is already imported and role IDs are mapped in this .env)**    
    (**Note: This step is required only if the installation is is done for the first time or new volume mounts**. The instruction to import forms to FORMIO are
    [mentioned here](../../forms-flow-forms/README.md#import-of-predefined-roles-and-forms))   
       
**formsflow.ai form.io Server Variables:**  

 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMIO_MONGO_USERNAME`|Mongo Root Username. Used on installation to create the database.Choose your own||`admin`
`FORMIO_MONGO_PASSWORD`|Mongo Root Password||`changeme`
`FORMIO_MONGO_DATABASE`|Mongo Database  Name. Used on installation to create the database.Choose your own||`formio`
`FORMIO_ROOT_EMAIL`|form.io admin login|eg. admin@example.com|`must be set to whatever email address you want form.io to have as admin user`
`FORMIO_ROOT_PASSWORD`|form.io admin password|eg.CHANGEME|`must be set to whatever password you want for your form.io admin user`
 * Build all the services.
    * For Linux,
        * Run `docker-compose -f docker-compose-linux.yml build` to build.
    * For Windows,
        * Run `docker-compose -f docker-compose-windows.yml build` to build.
 *  Follow the listed sub-instructions for mapping the pre-defined role IDs. **(Skip this step if the pre-defined template i.e.sample.json is already imported and role IDs are mapped in this .env)**   
      *  Start the form.io service.  
        For Linux,  
        Run `docker-compose -f docker-compose-linux.yml up -d forms-flow-forms` to start.  
        For Windows,  
        Run `docker-compose -f docker-compose-windows.yml up -d forms-flow-forms` to start.  
        * Do a [health check for forms-flow-forms](../../forms-flow-forms#health-check)
      * Import the predefined Roles and Forms using [sample.json](../../forms-flow-forms/sample.json) using instructions from [Import the predefined Roles and Forms](../../forms-flow-forms/README.md#import-of-predefined-roles-and-forms)
 * Modify the configuration values as needed. Details below,
 
**formsflow.ai Role Mapping:**

 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CLIENT_ROLE`|	The role name used for client users|| formsflow-client
`CLIENT_ROLE_ID`|form.io client role Id|eg. 10121d8f7fadb18402a4c|must get the value from form.io resource **http://localhost:3001/role**
`REVIEWER_ROLE`|The role name used for staff/reviewer users||`formsflow-reviewer`
`REVIEWER_ROLE_ID`|form.io reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|must get the value from form.io resource **http://localhost:3001/role**
`DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
`DESIGNER_ROLE_ID`|form.io administrator role Id|eg. 5ee090afee045f1597609cae|must get the value from form.io resource **http://localhost:3001/role**
`ANONYMOUS_ID`|form.io anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|must get the value from form.io resource **http://localhost:3001/role** 
`USER_RESOURCE_ID`|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|must get the value from form.io resource **http://localhost:3001/user**

**formsflow.ai Datastore Settings:**

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`WEB_API_DATABASE_URL`|JDBC DB Connection URL for formsflow.ai||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/formsflow`
`WEB_API_POSTGRES_USER`|formsflow.ai database postgres user|Used on installation to create the database.Choose your own|`postgres`
`WEB_API_POSTGRES_PASSWORD`|formsflow.ai database postgres password|ditto|`changeme`
`WEB_API_POSTGRES_DB`|formsflow.ai database name||`formsflow`

**formsflow.ai Integration Settings:**

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`NODE_ENV`| Define project level configuration | `development, test, production` | `development`
`CAMUNDA_API_URI`|Camunda Rest API URI||`http://localhost:8000/camunda`
`FORMIO_DEFAULT_PROJECT_URL`|The URL of the form.io server||`http://localhost:3001`
`WEB_API_BASE_URL`|formsflow.ai Rest API URI||`http://localhost:5000`
`MONGODB_URI`|Mongo DB Connection URL of formio for sentiment analysis||`mongodb://username:password@host:port/analytics?authSource=admin&authMechanism=SCRAM-SHA-256`

**Authentication Provider (Keycloak) Settings:**

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_TOKEN_URL`|Keycloak OIDC token API for clients|Plug in your Keycloak base url and realm name|`{Keycloak URL}/auth/realms/<realm>/protocol/openid-connect/token`
`KEYCLOAK_JWT_OIDC_CONFIG`|Path to Keycloak well-know config for realm|Plug in your Keycloak URL plus realm|`{Keycloak URL}/auth/realms/<REALM>/.well-known/openid-configuration`
`KEYCLOAK_JWT_OIDC_JWKS_URI`|Keycloak JWKS URI|Plug in Keycloak base url plus realm|`{Keycloak URL}/auth/realms/<REALM>/protocol/openid-connect/certs`
`KEYCLOAK_JWT_OIDC_ISSUER`|The issuer of JWT's from Keycloak for your realm|Plug in your realm and Keycloak base url|`{Keycloak URL}/auth/realms/<REALM>`
`KEYCLOAK_BPM_CLIENTID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|must be set to your Keycloak client id
`KEYCLOAK_BPM_CLIENTSECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret
`KEYCLOAK_WEB_CLIENTID`|Client ID for formsflow.ai to register with Keycloak|eg. forms-flow-web|must be set to your Keycloak client id

**BPM (Camunda) Settings:**

#### Database Connection Details(The solution manages 3 connections)
 
##### CAMUNDA_JDBC : Dedicated camunda database (Prefixed with CAMUNDA_).

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database.Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/formsflow-bpm`
 `CAMUNDA_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_POSTGRES_USER`|Postgres Database Username|Used on installation to create the database.Choose your own|`postgres`
 `CAMUNDA_POSTGRES_PASSWORD`|Postgres Database Password|Used on installation to create the database.Choose your own|`changeme`
 `CAMUNDA_POSTGRES_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`formsflow-bpm`
 `CAMUNDA_HIKARI_CONN_TIMEOUT`|Hikari Connection optimization setting||`30000`
 `CAMUNDA_HIKARI_IDLE_TIMEOUT`|Hikari Connection optimization setting||`600000`
 `CAMUNDA_HIKARI_MAX_POOLSIZE`|Hikari Connection optimization setting||`10`
 `CAMUNDA_HIKARI_VALID_TIMEOUT`|Hikari Connection optimization setting||`5000`

##### CAMUNDA_SESSION_JDBC : Session Management (High Availability) (Prefixed with CAMUNDA_SESSION_).

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_SESSION_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database.Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/formsflow-bpm-session`
 `CAMUNDA_SESSION_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_SESSION_JDBC_USER`|Postgres Database Username|Used on installation to create the database.Choose your own|`postgres`
 `CAMUNDA_SESSION_JDBC_PASSWORD`|Postgres Database Password|Used on installation to create the database.Choose your own|`changeme`
 `CAMUNDA_POSTGRES_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`formsflow-bpm-session`
 `CAMUNDA_SESSION_HIKARI_CONN_TIMEOUT`|Hikari Connection optimization setting||`30000`
 `CAMUNDA_SESSION_HIKARI_IDLE_TIMEOUT`|Hikari Connection optimization setting||`600000`
 `CAMUNDA_SESSION_HIKARI_MAX_POOLSIZE`|Hikari Connection optimization setting||`10`
 `CAMUNDA_SESSION_HIKARI_VALID_TIMEOUT`|Hikari Connection optimization setting||`5000`

##### CAMUNDA_ANALYTICS_JDBC : Application's Audit Management (Only Cam variables) (Prefixed with CAMUNDA_ANALYTICS_).

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_ANALYTICS_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database.Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/formsflow-bpm-analytics`
 `CAMUNDA_ANALYTICS_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_ANALYTICS_JDBC_USER`|Postgres Database Username|Used on installation to create the database.Choose your own|`postgres`
 `CAMUNDA_ANALYTICS_JDBC_PASSWORD`|Postgres Database Password|Used on installation to create the database.Choose your own|`changeme`
 `CAMUNDA_POSTGRES_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`formsflow-bpm-analytics`
 `CAMUNDA_ANALYTICS_HIKARI_CONN_TIMEOUT`|Hikari Connection optimization setting||`30000`
 `CAMUNDA_ANALYTICS_HIKARI_IDLE_TIMEOUT`|Hikari Connection optimization setting||`600000`
 `CAMUNDA_ANALYTICS_HIKARI_MAX_POOLSIZE`|Hikari Connection optimization setting||`10`
 `CAMUNDA_ANALYTICS_HIKARI_VALID_TIMEOUT`|Hikari Connection optimization setting||`5000`

#### Session Management
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_SESSION_STORE_TYPE`| Store type for holding the state | | `jdbc`
 `CAMUNDA_SESSION_STORE_TIMEOUT`| Timeout Setting in seconds| | `30`

#### Camunda System Tuning  
 
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
  `CAMUNDA_JOB_CORE_POOL_SIZE`|Job-Executor Configuration Properties||`10`
  `CAMUNDA_JOB_MAX_POOL_SIZE`|Job-Executor Configuration Properties||`20`
  `CAMUNDA_JOB_QUEUE_SIZE`|Job-Executor Configuration Properties||`10`
  `CAMUNDA_JOB_LOCK_TIME_MILLIS`|Job-Executor Configuration Properties||`300000`
  `CAMUNDA_JOB_MAXJOBS_PER_ACQUISITION`|Job-Executor Configuration Properties||`10`
  `CAMUNDA_JOB_WAIT_TIME_MILLIS`|Job-Executor Configuration Properties||`5000`
  `CAMUNDA_JOB_MAX_WAIT`|Job-Executor Configuration Properties||`60000`
  `CAMUNDA_METRICS_FLAG`|Job-Executor Configuration Properties||`false`
  `CAMUNDA_BPM_HISTORY_LEVEL`|Engine Configuration Properties||`none`
  `CAMUNDA_AUTHORIZATION_FLAG`|Engine Configuration Properties||`true`
  `CAMUNDA_AUTHORIZATION_FLAG`|Engine Configuration Properties||`auto`
  
 Reference: 
 * https://docs.camunda.org/manual/latest/reference/deployment-descriptors/tags/job-executor/#job-executor-configuration-properties
 * https://docs.camunda.org/manual/latest/reference/deployment-descriptors/tags/process-engine/
 
#### Camunda formsflow.ai Integration Settings  
 
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `FORMSFLOW_API_URL`|formsflow.ai Rest API URI||`http://localhost:5000`
 `FORMIO_DEFAULT_PROJECT_URL`|The URL of the form.io server||`http://localhost:3001`
 `FORMIO_ROOT_EMAIL`|form.io admin login|eg. admin@example.com|`must be set to whatever email address you want form.io to have as admin user`
 `FORMIO_ROOT_PASSWORD`|form.io admin password|eg.CHANGEME|`must be set to whatever password you want for your form.io admin user`
 `WEBSOCKET_SECURITY_ORIGIN`|Camunda task event streaming. Origin setting|`http://localhost:3000`|
 `WEBSOCKET_MESSAGE_TYPE`|Camunda task event streaming. Message type |`TASK_EVENT` `TASK_EVENT_DETAILS`|`TASK_EVENT`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token||`giert989jkwrgb@DR55`
 * Modify the file **mail-config.properties** (under forms-flow-bpm/src/main/resources/). The default settings provided are for the Gmail server, and you need to change the credentials at the bottom of the file. Note that you want to configure your own Gmail setting to allow unsecure apps first. 
 
#### Camunda - Orbeon Integration Settings  
 
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_FORMBUILDER_PIPELINE_USERNAME`|Basic Authentication Support. Username||`http://localhost:5000`
 `CAMUNDA_FORMBUILDER_PIPELINE_PASSWORD`|Basic Authentication Support. Password||`http://localhost:5000`
 `CAMUNDA_FORMBUILDER_PIPELINE_BPM_URL`|Engine Context URL.Leverages elevated admin account.||`http://username:password@localhost:8000/camunda`
 
#### Camunda - General Settings  
 
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `APP_SECURITY_ORIGIN`|CORS setup||`*` 
 `CAMUNDA_APP_ROOT_LOG_FLAG`|Log level setting||`error` 

**Analytics (Redash) Integration Settings:**
 
 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_BASE`|Insight Api base end-point||`http://localhost:7000`
`INSIGHT_API_KEY`|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| must be set to your ReDash API key
   
   **Additionally, you may want to change these**
   * The value of database details (especially if this instance is not just for testing purposes)
  

### Running the application
* For Linux,
   * Run `docker-compose -f docker-compose-linux.yml up --build -d` to start.
* For Windows,
   * Run `docker-compose -f docker-compose-windows.yml up --build -d` to start.
   
#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml down` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml down` to stop.
  
### Health Check
  * Analytics should be up and available for use at port defaulted to 7000 i.e. http://localhost:7000/
  * Business Process Engine should be up and available for use at port defaulted to 8000 i.e. http://localhost:8000/camunda/
  * FormIO should be up and available for use at port defaulted to 3001 i.e. http://localhost:3001/
  * formsflow.ai Rest API should be up and available for use at port defaulted to 5000 i.e. http://localhost:5000/api/
  * formsflow.ai web application should be up and available for use at port defaulted to 3000 i.e. http://localhost:3000/
  
