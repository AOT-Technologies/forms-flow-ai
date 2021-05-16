# Workflow Engine
![Camunda](https://img.shields.io/badge/Camunda-7.13.0-blue)  ![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.2.7.RELEASE-blue)  ![postgres](https://img.shields.io/badge/postgres-latest-blue)  
**formsflow.ai** leverages Camunda for workflow and decision automation.

To know more about Camunda, go to https://github.com/camunda/camunda-bpm-identity-keycloak.

## Table of Content
* [Prerequisites](#prerequisites)
* [Solution setup](#solution-setup)
  * [Step 1 : Keycloak Configuration](#keycloak-configuration)
  * [Step 2 : Installation](#installation)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Health Check](#health-check)
* [How to Deploy Process](#how-to-deploy-process)
* [How to Enable SSL](#how-to-enable-ssl)

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 
There needs to be a [Keycloak](https://www.keycloak.org/) server available and you need admin privileges (to create realms, users etc. in Keycloak).

## Solution Setup

### Keycloak Configuration

1. Login to KeyCloak Realm with admin privileges
2. For client **forms-flow-bpm** creation, follow the instructions given on [link](../forms-flow-idm/keycloak/README.md) 

 NOTE: The default admin group "camunda-admin" has been referenced in application.yaml, and this needs to be available for use.
 
### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is forms-flow-bpm.
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. Details below,
   
#### Keycloak Integration

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `KEYCLOAK_URL`| URL to your Keycloak server |eg. https://iam.aot-technologies.com | must be set to your Keycloak serve
 `KEYCLOAK_URL_REALM`|	The Keyvcloak realm to use|eg. forms-flow-ai | must be set to your Keycloak realm
 `KEYCLOAK_BPM_CLIENTID`|Your Keycloak Client ID within the realm| eg. forms-flow-bpm | must be set to your Keycloak client id
 `KEYCLOAK_BPM_CLIENTSECRET`|The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret

#### Database Connection Details(The solution manages 3 connections)
 
##### CAMUNDA_JDBC : Dedicated camunda database (Prefixed with CAMUNDA_).

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database.Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/formsflow-bpm`
 `CAMUNDA_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_POSTGRES_USER`|Postgres Database Username|Used on installation to create the database.Choose your own|`postgres`
 `CAMUNDA_POSTGRES_PASSWORD`|Postgres Database Password|Used on installation to create the database.Choose your own|`changeme`
 `CAMUNDA_JDBC_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`formsflow-bpm`
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
 `CAMUNDA_JDBC_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`formsflow-bpm-session`
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
 `CAMUNDA_JDBC_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`formsflow-bpm-analytics`
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
  `CAMUNDA_AUTHORIZATION_REVOKE_CHECK_FLAG`|Engine Configuration Properties||`auto`
  
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
   
 **Additionally, you may want to change these**  
*   The value of Datastore credentials (especially if this instance is not just for testing purposes)

### Running the application
* For Linux,
   * Run `docker-compose -f docker-compose-linux.yml build` to build.
   * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
   * Run `docker-compose -f docker-compose-windows.yml build` to build.
   * Run `docker-compose -f docker-compose-windows.yml up -d` to start.

#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml down` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml down` to stop.
      
      
### Health Check

   The application should be up and available for use at port defaulted to 8000 in application.yaml http://localhost:8000/camunda/
   
## How to Deploy Process

   REST service **/camunda/engine-rest/deployment/create** will be used for deployment of process.
   
   CURL commands are leveraged for this action. 
   
   ##### 1. Generate token using elevated user or service-client credentials
```   
      export token=`curl -X POST "https://iam.aot-technologies.com/auth/realms/forms-flow-ai/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test" -d "password=test" -d "grant_type=password" -d "client_id=forms-flow-bpm" -d "client_secret=xxxxxxxxxxxxxx" | jq -r ".access_token"`
```
   ##### 2. Post the process as file with HTTP verb POST.
```
   curl -H "Authorization: Bearer ${token}" -H "Accept: application/json" -F "deployment-name=One Step Approval" -F "enable-duplicate-filtering=false" -F "deploy-changed-only=falses" -F "one_step_approval.bpmnn=@one_step_approval.bpmn"  http://localhost:8000/camunda/engine-rest/deployment/create
```
   
* **NOTE: If POST request fails with permission issue, login to Camunda and go to Admin -> Authorizations -> Deployment. Then, verify the account existence under "deployment" service. If does not, please add it manually.**
   
## How to Enable SSL

##### 1. Generate domain specific pem format and convert into pkcs12 using below commands.      
```       
openssl pkcs12 -export -out bpm1.pkcs12 -in combined.pem
keytool -genkey -keyalg RSA -alias tomcat -keystore truststore.ks
keytool -delete -alias tomcat -keystore truststore.ks

keytool -import -v -trustcacerts -alias tomcat -file fullchain.pem -keystore truststore.ks
keytool -genkey -keyalg RSA -alias tomcat -keystore keystore.ks

keytool -v -importkeystore -srckeystore bpm1.pkcs12 -srcstoretype PKCS12 -destkeystore keystore.ks -des
```      
##### 2. Place the generated keystore.ks file under cert path ~/certs/keystore.ks. 
##### 3. Include the below **ssl configuration** in application.yaml present in path /forms-flow-bpm/src/main/resources.
``` 
server:
  port: 8443
  ssl:
    key-store: file:/certs/keystore.ks
    key-store-password: password
    key-store-type: pkcs12
    key-alias: tomcat
    key-password: password
  servlet.context-path: /camunda
``` 
* **NOTE: Alternatively, you can directly place your ssl cert under the classpath "/forms-flow-bpm/src/main/resources". Your configuration for the key-store in application.yaml would be `key-store: classpath:/keystore.ks`.**

