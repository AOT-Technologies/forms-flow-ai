# formsflow.ai

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
`FORMIO_DEFAULT_PROJECT_URL`:triangular_flag_on_post:|The URL of the forms-flow-forms server||`http://{your-ip-address}:3001`
`FORMIO_ROOT_EMAIL`|forms-flow-forms admin login|eg. admin@example.com|`admin@example.com`
`FORMIO_ROOT_PASSWORD`|forms-flow-forms admin password|eg.changeme|`changeme`


*  Follow the below steps for mapping the role IDs.   
   - Start the forms-flow-forms service.
     - For Linux
       - Run `docker-compose -f docker-compose-linux.yml up -d forms-flow-forms` to start.  
     - For Windows  
       - Run `docker-compose -f docker-compose-windows.yml up -d forms-flow-forms` to start.  
       
##### Health Check
------------------
   - Access forms-flow-forms at port defaulted to 3001 i.e. http://localhost:3001/ .
   
           Default Login Credentials
           -----------------
           User Name / Email : admin@example.com
           Password  : changeme   
                   
*NOTE: Use --build command with the start command to reflect any future **.env** / code changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

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
`KEYCLOAK_BPM_CLIENT_SECRET`:triangular_flag_on_post:|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret. Follow the 'Get the keycloak client secret' steps from [Here](../../forms-flow-idm/keycloak/README.md#get-the-keycloak-client-secret)
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for formsflow.ai to register with Keycloak|eg. forms-flow-web|`forms-flow-web`

##### formsflow.ai analytics variable settings
-----------------------------------

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_URL`:triangular_flag_on_post:|Insight Api base end-point||`http://{your-ip-address}:7000`
`INSIGHT_API_KEY`:triangular_flag_on_post:|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| `Get the api key from forms-flow-analytics (REDASH) by following the 'Get the Redash API Key' steps from `[here](../../forms-flow-analytics/README.md#get-the-redash-api-key)

##### formsflow.ai forms variable settings
-----------------------------------

* [STEP 1](): Getting **ROLE_ID** and **RESOURCE_ID** are mandatory for role based access. To generate ID go to ["Formsflow-forms user/role API"](../../forms-flow-forms/README.md#formsflow-forms-userrole-api) and follow the steps.
* [STEP 2](): Modify the environment variables using the values from step 1.

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CLIENT_ROLE`|	The role name used for client users|| `formsflow-client`
`CLIENT_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms client role Id|eg. 10121d8f7fadb18402a4c|`must get the **formsflow Client** role Id value from step #1 above.`
`REVIEWER_ROLE`|The role name used for reviewer users||`formsflow-reviewer`
`REVIEWER_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|`must get the **formsflow Reviewer** role Id value from step #1 above.`
`DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
`DESIGNER_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms administrator role Id|eg. 5ee090afee045f1597609cae|`must get the **Administrator** role Id value from step #1 above.`
`ANONYMOUS_ID`|forms-flow-forms anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|`must get the **Anonymous** role Id value from step #1 above.`
`USER_RESOURCE_ID`:triangular_flag_on_post:|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|`must get the **user resource** id value from the step #1 above.`

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
`FORMSFLOW_API_CORS_ORIGINS`| formsflow.ai Rest API allowed origins, for allowing multiple origins you can separate host address using a comma seperated string or use * to allow all origins |eg:`host1, host2, host3`| `*`
`CAMUNDA_API_URL` :triangular_flag_on_post: |Camunda Rest API URL||`http://{your-ip-address}:8000/camunda`
`FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow.ai Rest API URL||`http://{your-ip-address}:5000`
`FORMSFLOW_API_ANALYTICS_DB_USERNAME`|Mongo DB Connection username|Used on installation to create the database. Choose your own|`mongo`
`FORMSFLOW_API_ANALYTICS_DB_PASSWORD`|Mongo DB Connection password|Used on installation to create the database. Choose your own|`changeme`
`FORMSFLOW_API_ANALYTICS_DB_NAME`|Mongo DB Connection database name|Used on installation to create the database. Choose your own|`analytics`
`FORMSFLOW_API_ANALYTICS_DB_URL`|Mongo DB Connection URL of formio for sentiment analysis|Used on installation to create the database. Choose your own|`mongodb://mongo:changeme@forms-flow-webapi-analytics-db:27019/analytics?authSource=admin&authMechanism=SCRAM-SHA-256`
`USER_ACCESS_PERMISSIONS`| JSON formatted permissions to enable / disable few access on user login.|| `{"accessAllowApplications":false,"accessAllowSubmissions":false}`

* NOTE - While configuring USER_ACCESS_PERMISSIONS the accessAllowApplications will hide / show application tab, the same way accessAllowSubmissions does for viewSubmission button. To enable this feature you need to add access-allow-applications, access-allow-submissions with the respective user group in keycloak.

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
 
 ```
Modify the file **mail-config.properties** (under `forms-flow-bpm/src/main/resources/`). The default settings provided are for the Gmail server, and you need to change the credentials at the bottom of the file. Note that you want to configure your own Gmail setting to allow unsecure apps first. 
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
* formsflow.ai Rest API should be up and available for use at port defaulted to 5000 i.e. http://localhost:5000/checkpoint
* formsflow.ai web application should be up and available for use at port defaulted to 3000 i.e. http://localhost:3000/
* Access credentials are mentioned [here](../README.md#verifying-the-installation-status).

### Usage Instructions

> End to end usage of formsflow.ai is mentioned in this section with sample forms and workflows.

* The complete usage instructions with examples are mentioned [here](./../../USAGE.md).
