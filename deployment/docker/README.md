# formsflow.ai - Docker Setup

This page elaborates how to setup the overall solution using docker.


## Table of Contents
1. [Application Setup](#application-setup)
   * [Step 1 : Installation Steps](#installation-steps)
   * [Step 2 : Running the Application](#running-the-application)
   * [Step 3 : Health Check](#health-check)
2. [Usage Instructions](#usage-instructions)

## Application Setup

* The application will be installed in the following order.
* Some of the services have dependencies, mentioned below.

 Srl No | Service Name | Usage | Access | Dependency | Details |
--- | --- | --- | --- | --- | ---
1|`Keycloak`|Authentication|`http://localhost:8080`||[Keycloak](../../forms-flow-idm/keycloak/README.md)
2|`forms-flow-forms`|form.io form building. This must be started earlier for resource role id's creation|`http:/localhost:3001`||[forms-flow-forms](../../forms-flow-forms/README.md)
3|`forms-flow-analytics`|Redash analytics server, This must be started earlier for redash key creation|`http://localhost:7000`|`Keycloak`|[forms-flow-analytics](../../forms-flow-analytics/README.md)
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
* Rename the file [sample.env](./sample.env) to **.env**.
* Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
* **NOTE : `{your-ip-address}` given inside the `.env` file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file

 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMIO_DB_USERNAME`|Mongo Root Username. Used on installation, Choose your own||`admin`
`FORMIO_DB_PASSWORD`|Mongo Root Password. Used on installation, Choose your own||`changeme`
`FORMIO_DB_NAME`|Mongo Database  Name. Used on installation to create the database. Choose your own||`formio`
`NO_INSTALL`|To setup FORMIO client ui disabled |1 / 0|`1`
`FORMIO_DEFAULT_PROJECT_URL`:triangular_flag_on_post:|The URL of the forms-flow-forms server||`http://{your-ip-address}:3001`
`FORMIO_ROOT_EMAIL`|forms-flow-forms admin login|eg. admin@example.com|`admin@example.com`
`FORMIO_ROOT_PASSWORD`|forms-flow-forms admin password|eg.changeme|`changeme`
`FORMIO_JWT_SECRET`|forms-flow-forms jwt secret| |`--- change me now ---`
`NO_INSTALL`|to enable/disable UI for Formio client| 1 or 0 | `1`
 


*  Follow the below steps for mapping the role IDs.   
   - Start the forms-flow-forms service. 
       - Run `docker-compose up -d forms-flow-forms` to start.  
       
##### Health Check
------------------
   - Access forms-flow-forms at port defaulted to 3001 i.e. http://localhost:3001/ .
   
           Default Login Credentials
           -----------------
           User Name / Email : admin@example.com
           Password  : changeme   
                   
*NOTE: Use --build command with the start command to reflect any future **.env** / code changes eg : `docker-compose up --build -d`*

#### forms-flow-web, forms-flow-bpm & forms-flow-api Setup
-----------------------------------
```
- [x] Keycloak setup
- [x] forms-flow-analytics setup
- [x] forms-flow-forms setup
- [x] forms-flow-web, forms-flow-bpm, forms-flow-api setup
```
* Make sure your current working directory is "/forms-flow-ai/deployment/docker".
* Modify the environment variables inside **.env** file if needed. Environment variables are given in the tables below.

> :information_source: Variables with trailing:triangular_flag_on_post: in below table should be updated in the .env file

##### formsflow.ai keycloak variable settings
-----------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
`KEYCLOAK_URL_REALM`|The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
`KEYCLOAK_BPM_CLIENT_ID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|`forms-flow-bpm`
`KEYCLOAK_BPM_CLIENT_SECRET`|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`e4bdbd25-1467-4f7f-b993-bc4b1944c943` <br><br>`To generate a new keycloak secret by yourself follow the steps from` [here](../../forms-flow-idm/keycloak/README.md#get-the-keycloak-client-secret)
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for formsflow.ai to register with Keycloak|eg. forms-flow-web|`forms-flow-web`

##### formsflow.ai analytics variable settings
-----------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_URL`:triangular_flag_on_post:|Insight Api base end-point||`http://{your-ip-address}:7000`
`INSIGHT_API_KEY`:triangular_flag_on_post:|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| `Get the api key from forms-flow-analytics (REDASH) by following the 'Get the Redash API Key' steps from `[here](../../forms-flow-analytics/README.md#get-the-redash-api-key)

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
--- | --- |-----------| ---
`NODE_ENV`| Define project level configuration | `development, test, production` | `development`
`APPLICATION_NAME`| Application_Name | eg: formsflow.ai | `formsflow.ai`
`WEB_BASE_CUSTOM_URL`| Custom_URL | eg: https://formsflow.ai | `custom url`
`FORMSFLOW_API_CORS_ORIGINS`| formsflow.ai Rest API allowed origins, for allowing multiple origins you can separate host address using a comma seperated string or use * to allow all origins | eg:`host1, host2, host3` | `*`
`BPM_API_URL` :triangular_flag_on_post: |Camunda Rest API URL|           |`http://{your-ip-address}:8000/camunda`
`FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow.ai Rest API URL|           |`http://{your-ip-address}:5000`
`ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK`| To Enable Role level permission check for enabling Application| true/false| false
`MULTI_TENANCY_ENABLED`|Multi tenancy enabled flag for the environment| true/false | false
` DRAFT_ENABLED`|Enable draft feature| true/false 
`DRAFT_POLLING_RATE`|Control draft timing|           |15000
`EXPORT_PDF_ENABLED`|Manage export to pdf feature| true/false 
`PUBLIC_WORKFLOW_ENABLED`|Enable creating workflow for all tenants
`DOCUMENT_SERVICE_URL`|Formsflow document service api url|           |`http://{your-ip-address}:5006`
`MT_ADMIN_BASE_URL`|Multitenancy admin url|           |`http://{your-ip-address}:5010/api`
`MT_ADMIN_BASE_URL_VERSION=v1`|Version of multitenancy admin| v1        




* NOTE - While configuring ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK will hide / show application tab.To enable this feature you need to add access-allow-applications with the respective user group in keycloak.

##### CAMUNDA_JDBC : Dedicated camunda database.
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
  
##### Camunda formsflow.ai Integration variable settings  
------------------------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`WEBSOCKET_SECURITY_ORIGIN` :triangular_flag_on_post:|Camunda task event streaming. Origin setting, for multiple origins you can separate host address using a comma |eg:`host1, host2`|`http://{your-ip-address}:3000`
`WEBSOCKET_MESSAGE_TYPE`|Camunda task event streaming. Message type ||`TASK_EVENT`
`WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token||`giert989jkwrgb@DR55`
`DATA_ANALYSIS_URL`|sentiment analysis url||`http://{your-ip-address}:6000/analysis`
`REDIS_HOST`|Redis hostname||`localhost`
`REDIS_PORT`|Redis portname||`6379`
`REDIS_PASSCODE`|Redis passcode||`changeme`
`REDIS_ENABLED`|Boolean flag to enable redis|`true`|`false`
 
```
Modify the file **mail-config.properties** (under `forms-flow-bpm/src/main/resources/`). The default settings provided are for the Gmail server, and you need to change the credentials at the bottom of the file. Note that you want to configure your own Gmail setting to allow unsecure apps first. 
```

##### Camunda - General variable settings  
-------------------------------

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `APP_SECURITY_ORIGIN`|CORS setup, for multiple origins you can separate host address using a comma |eg:`host1, host2`| `*` 
 `CAMUNDA_APP_ROOT_LOG_FLAG`|Log level setting||`error` 
 `DATA_BUFFER_SIZE`|Configure a limit on the number of bytes that can be buffered for webclient||`2 (In MB)`
 `IDENTITY_PROVIDER_MAX_RESULT_SIZE`|Maximum result size for Keycloak user queries||`250`
 `BPM_CLIENT_CONN_TIMEOUT`|Webclient Connection timeout in milli seconds||`5000`
 `BPM_BASE_URL`:triangular_flag_on_post:|BPM Client URL||`http://{your-ip-address}:8000/engine-bpm`

### Running the application

* Run `docker-compose up -d` to start.
   
*NOTE: Use --build command with the start command to reflect any future **.env** / code changes eg : `docker-compose up --build -d`*

#### To stop the application

* Run `docker-compose stop` to stop.
  
### Health Check
* Analytics should be up and available for use at port defaulted to 7000 i.e. http://localhost:7000/
* Business Process Engine should be up and available for use at port defaulted to 8000 i.e. http://localhost:8000/camunda/
* FormIO should be up and available for use at port defaulted to 3001 i.e. http://localhost:3001/
* formsflow.ai Rest API should be up and available for use at port defaulted to 5000 i.e. http://localhost:5000/checkpoint
* formsflow.ai web application should be up and available for use at port defaulted to 3000 i.e. http://localhost:3000/
* Access credentials are mentioned [here](../README.md#verifying-the-installation-status).

### Usage Instructions

> End to end usage of formsflow.ai is mentioned in this section with sample forms and workflows.

* The complete usage instructions with examples are mentioned [here](./../../USAGE.md).
