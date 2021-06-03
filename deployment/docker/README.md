# formsflow.ai

This page elaborates how to setup the overall solution using docker.


## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Application Setup](#application-setup)
   * [Step 1 : Installation Steps](#installation-steps)
   * [Step 2 : Running the Application](#running-the-application)
   * [Step 3 : Health Check](#health-check) 


## Prerequisites

 * The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Application Setup

* The application will be installed in the following order.
* Some of the services have dependencies, mentioned below.

 Srl No | Service Name | Usage | Access | Dependency | Details |
--- | --- | --- | --- | --- | ---
1|`Keycloak`|Authentication|`http://localhost:8080`||[Keycloak](../../forms-flow-idm/keycloak/README.md)
2|`forms-flow-forms`|form.io form building. This must be started earlier for resource role id's creation|`http:/localhost:3001`||[forms-flow-forms](../../forms-flow-forms/README.md)
3|`forms-flow-analytics`|Redash analytics server, This must be started earlier for redash key creation|`ttp://localhost:7000`|`Keycloak`|[forms-flow-analytics](../../forms-flow-analytics/README.md)
4|`forms-flow-web`|formsflow Landing web app|`http://localhost:3000`|`Keycloak`, `forms-flow-forms`, `forms-flow-analytics`|[forms-flow-web](../../forms-flow-web/README.md)
5|`forms-flow-api`|API services|`http://localhost:5000`|`Keycloak`|[forms-flow-api](../../forms-flow-api/README.md)
6|`forms-flow-bpm`|Camunda integration|`http://localhost:8000/camunda`|`Keycloak`|[forms-flow-bpm](../../forms-flow-bpm/README.md)

### Installation Steps

These are the steps required to complete the installation and setup of formsflow.ai solution
- [ ] Keycloak setup
- [ ] forms-flow-analytics setup
- [ ] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup

> Make sure you have a Docker machine up and running.

#### Keycloak Setup
--------------------
```
- [x] Keycloak setup
- [ ] forms-flow-analytics setup
- [ ] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup
```
Follow the instructions given [here](../../forms-flow-idm/keycloak/README.md)

#### forms-flow-analytics Setup
------------------------------
```
- [x] Keycloak setup
- [x] forms-flow-analytics setup
- [ ] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup
``` 
Start the **analytics server** by following the instructions given [here](../../forms-flow-analytics/README.md)
   
#### forms-flow-forms Setup       
---------------------------
```
- [x] Keycloak setup
- [x] forms-flow-analytics setup
- [x] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup
```
* Make sure your current working directory is "/forms-flow-ai/deployment/docker".
* Rename the file **sample.env** to **.env**. 
* Modify the **.env** file using the instructions below.
* **NOTE : {your-ip-address} on the .env variables have to be changed as per your host system IP address, for the systems with multiple network cards the IP address configurations have to be handled accordingly**
>Environment variables are set in **.env** file and read by the system.


 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMIO_DB_USERNAME`|Mongo Root Username. Used on installation, Choose your own||`admin`
`FORMIO_DB_PASSWORD`|Mongo Root Password. Used on installation, Choose your own||`changeme`
`FORMIO_DB_NAME`|Mongo Database  Name. Used on installation to create the database. Choose your own||`formio`
`FORMIO_DEFAULT_PROJECT_URL`|The URL of the forms-flow-forms server||`http://{your-ip-address}:3001`
`FORMIO_ROOT_EMAIL`|forms-flow-forms admin login|eg. admin@example.com|`admin@example.com`
`FORMIO_ROOT_PASSWORD`|forms-flow-forms admin password|eg.changeme|`changeme`


*  Follow the below steps for mapping the role IDs.   
   - Start the forms-flow-forms service.
     - For Linux
       - Run `docker-compose -f docker-compose-linux.yml up -d forms-flow-forms` to start.  
     - For Windows  
       - Run `docker-compose -f docker-compose-windows.yml up -d forms-flow-forms` to start.  
   - Access formIO at port defaulted to 3001 i.e. http://{your-ip-address}:3001/ .
   
           Default Login Credentials
           -----------------
           User Name / Email : admin@example.com
           Password  : changeme   
                   
*NOTE: Use --build command with the start command to reflect any future **.env** / code changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

#### forms-flow-web, forms-flow-bpm & forms-flow-web Setup
-----------------------------------
```
- [x] Keycloak setup
- [x] forms-flow-analytics setup
- [x] forms-flow-forms setup
- [x] forms-flow-web, forms-flow-bpm, forms-flow-api setup
```
* Make sure your current working directory is "/forms-flow-ai/deployment/docker".
* Modify the **.env** file using the instructions below.

##### formsflow.ai keycloak variable settings
-----------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_URL`| URL to your Keycloak server || `http://{your-ip-address}:8080`
`KEYCLOAK_URL_REALM`|	The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
`KEYCLOAK_BPM_CLIENT_ID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|`forms-flow-bpm`
`KEYCLOAK_BPM_CLIENT_SECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret. Follow the steps from [Here](../../forms-flow-idm/keycloak/README.md#getting-the-client-secret)
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for formsflow.ai to register with Keycloak|eg. forms-flow-web|`forms-flow-web`

##### formsflow.ai analytics variable settings
-----------------------------------
 * Get the API_KEY from forms-flow-analytics (REDASH) by following the instructions given [here](../../forms-flow-analytics/README.md#getting-redash-api-key)

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_URL`|Insight Api base end-point||`http://{your-ip-address}:7000`
`INSIGHT_API_KEY`|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| `must be set to your ReDash API key`

##### formsflow.ai forms variable settings
-----------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CLIENT_ROLE`|	The role name used for client users|| `formsflow-client`
`CLIENT_ROLE_ID`|forms-flow-forms client role Id|eg. 10121d8f7fadb18402a4c|`must get the client role Id value from forms-flow-forms resource.` [Get client role Id](../../forms-flow-forms/README.md#how-to-get-role-id)
`REVIEWER_ROLE`|The role name used for reviewer users||`formsflow-reviewer`
`REVIEWER_ROLE_ID`|forms-flow-forms reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|`must get the reviewer role Id value from forms-flow-forms resource.` [Get reviewer role Id](../../forms-flow-forms/README.md#how-to-get-role-id)
`DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
`DESIGNER_ROLE_ID`|forms-flow-forms administrator role Id|eg. 5ee090afee045f1597609cae|`must get the administrator role Id value from forms-flow-forms resource.` [Get administrator role Id](../../forms-flow-forms/README.md#how-to-get-role-id)
`ANONYMOUS_ID`|forms-flow-forms anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|`must get the anonymous role Id value from forms-flow-forms resource.` [Get anonymous role Id](../../forms-flow-forms/README.md#how-to-get-role-id)
`USER_RESOURCE_ID`|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|`must get the value from form.io resource.` [Get user resource Id](../../forms-flow-forms/README.md#how-to-get-user-resource-id)

##### formsflow.ai Datastore variable settings
-----------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMSFLOW_API_DB_URL`|JDBC DB Connection URL for formsflow.ai||`postgresql://postgres:changeme@forms-flow-webapi-db:5432/webapi`
`FORMSFLOW_API_DB_USER`|formsflow.ai database postgres user|Used on installation to create the database. Choose your own|`postgres`
`FORMSFLOW_API_DB_PASSWORD`|formsflow.ai database postgres password|Used on installation to create the database. Choose your own|`changeme`
`FORMSFLOW_API_DB_NAME`|formsflow.ai database name|Used on installation to create the database. Choose your own|`webapi`

##### formsflow.ai Integration variable settings
--------------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`NODE_ENV`| Define project level configuration | `development, test, production` | `development`
`APPLICATION_NAME`| Application_Name | eg: formsflow.ai| `formsflow.ai`
`FORMSFLOW_API_CORS_ORIGINS`| formsflow.ai Rest API allowed origins, for multiple origins you can separate host address using a comma |eg:`host1, host2`| `*`
`CAMUNDA_API_URL`|Camunda Rest API URI||`http://{your-ip-address}:8000/camunda`
`FORMSFLOW_API_URL`|formsflow.ai Rest API URI||`http://{your-ip-address}:5000`
`FORMSFLOW_API_ANALYTICS_DB_USERNAME`|Mongo DB Connection username|Used on installation to create the database. Choose your own|`mongo`
`FORMSFLOW_API_ANALYTICS_DB_PASSWORD`|Mongo DB Connection password|Used on installation to create the database. Choose your own|`changeme`
`FORMSFLOW_API_ANALYTICS_DB_NAME`|Mongo DB Connection database name|Used on installation to create the database. Choose your own|`analytics`
`FORMSFLOW_API_ANALYTICS_DB_URL`|Mongo DB Connection URL of formio for sentiment analysis|Used on installation to create the database. Choose your own|`mongodb://mongo:changeme@forms-flow-webapi-analytics-db:27019/analytics?authSource=admin&authMechanism=SCRAM-SHA-256`


##### BPM (Camunda) variable settings
---------------------------

* Database Connection Details(The solution manages CAMUNDA_JDBC & CAMUNDA_SESSION_JDBC connections)
 
###### CAMUNDA_JDBC : Dedicated camunda database (Prefixed with CAMUNDA_).
--------------------------------------

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_JDBC_DB_NAME`|Postgres JDBC DB Name|Used on installation to create the database. Choose your own|`formsflow-bpm`
 `CAMUNDA_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database. Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/formsflow-bpm`
 `CAMUNDA_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_JDBC_USER`|Postgres Database Username|Used on installation to create the database. Choose your own|`admin`
 `CAMUNDA_JDBC_PASSWORD`|Postgres Database Password|Used on installation to create the database. Choose your own|`changeme`
 `CAMUNDA_HIKARI_CONN_TIMEOUT`|Hikari Connection optimization setting||`30000`
 `CAMUNDA_HIKARI_IDLE_TIMEOUT`|Hikari Connection optimization setting||`600000`
 `CAMUNDA_HIKARI_MAX_POOLSIZE`|Hikari Connection optimization setting||`10`
 `CAMUNDA_HIKARI_VALID_TIMEOUT`|Hikari Connection optimization setting||`5000`

##### Camunda System Tuning  
----------------------------
 
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
  
 Reference: 
 * https://docs.camunda.org/manual/latest/reference/deployment-descriptors/tags/job-executor/#job-executor-configuration-properties
 * https://docs.camunda.org/manual/latest/reference/deployment-descriptors/tags/process-engine/
 
##### Camunda formsflow.ai Integration variable settings  
------------------------------------------------

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `FORMSFLOW_API_URL`|formsflow.ai Rest API URI||`http://{your-ip-address}:5000`
 `WEBSOCKET_SECURITY_ORIGIN`|Camunda task event streaming. Origin setting, for multiple origins you can separate host address using a comma |eg:`host1, host2`|`http://{your-ip-address}:3000`|
 `WEBSOCKET_MESSAGE_TYPE`|Camunda task event streaming. Message type ||`TASK_EVENT`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token||`giert989jkwrgb@DR55`
 
 ```
 * Modify the file **mail-config.properties** (under forms-flow-bpm/src/main/resources/). The default settings provided are for the Gmail server, and you need to change the credentials at the bottom of the file. Note that you want to configure your own Gmail setting to allow unsecure apps first. 
```

##### Camunda - General variable settings  
-------------------------------

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `APP_SECURITY_ORIGIN`|CORS setup, for multiple origins you can separate host address using a comma |eg:`host1, host2`| `*` 
 `CAMUNDA_APP_ROOT_LOG_FLAG`|Log level setting||`error` 

### Running the application
* For Linux,
   * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
   * Run `docker-compose -f docker-compose-windows.yml up -d` to start.
   
*NOTE: Use --build command with the start command to reflect any future **.env** / code changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml stop` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml stop` to stop.
  
### Health Check
  * Analytics should be up and available for use at port defaulted to 7000 i.e. http://localhost:7000/
  * Business Process Engine should be up and available for use at port defaulted to 8000 i.e. http://localhost:8000/camunda/
  * FormIO should be up and available for use at port defaulted to 3001 i.e. http://localhost:3001/
  * formsflow.ai Rest API should be up and available for use at port defaulted to 5000 i.e. http://localhost:5000/api/
  * formsflow.ai web application should be up and available for use at port defaulted to 3000 i.e. http://localhost:3000/
  
 * Access credentials are mentioned [here](../README.md#verifying-the-installation-status).
