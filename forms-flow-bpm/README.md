# Workflow Engine
![Camunda](https://img.shields.io/badge/Camunda-7.13.0-blue)  ![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.2.7.RELEASE-blue)  ![postgres](https://img.shields.io/badge/postgres-latest-blue)  
**formsflow.ai** leverages Camunda for workflow and decision automation.

To know more about Camunda, visit https://camunda.com/.

## Table of Content
1. [Prerequisites](#prerequisites)
2. [Solution setup](#solution-setup)
   - [Step 1 : Keycloak Configuration](#keycloak-configuration)
   - [Step 2 : Installation](#installation)
   - [Step 3 : Running the Application](#running-the-application)
   - [Step 4 : Health Check](#health-check)
3. [How to Deploy Process](#how-to-deploy-process)
4. [How to Enable SSL](#how-to-enable-ssl)
5. [forms-flow-bpm Listeners](#forms-flow-bpm-listeners)

## Prerequisites

* For docker based installation [Docker](https://docker.com) need to be installed.
* Admin access to [Keycloak](../forms-flow-idm/keycloak) server.

## Solution Setup

### Keycloak Configuration

***Skip this step if you are already having a setup ready.***

1. Login to KeyCloak Realm with admin privileges
2. For client **forms-flow-bpm** creation, follow the instructions given on [link](../forms-flow-idm/keycloak/README.md) 
 
### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-ai/forms-flow-bpm".
   * Rename the file [sample.env](./sample.env) to **.env**.
   * Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
   * **NOTE : {your-ip-address} given inside the .env file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**
 
> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file
     
#### Keycloak Integration
--------------------------

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
 `KEYCLOAK_URL_REALM`|	The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
 `KEYCLOAK_BPM_CLIENT_ID`|Your Keycloak Client ID within the realm| eg. forms-flow-bpm | `forms-flow-bpm`
 `KEYCLOAK_BPM_CLIENT_SECRET`:triangular_flag_on_post:|The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`must be set to your Keycloak client secret`go to [link](../forms-flow-idm/keycloak/README.md#get-the-keycloak-client-secret)

##### CAMUNDA_JDBC : Dedicated camunda database (Prefixed with CAMUNDA_).
-----------------------------------------------------------------------

   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `CAMUNDA_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database. Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/formsflow-bpm`
 `CAMUNDA_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_POSTGRES_USER`|Postgres Database Username|Used on installation to create the database. Choose your own|`admin`
 `CAMUNDA_POSTGRES_PASSWORD`|Postgres Database Password|Used on installation to create the database. Choose your own|`changeme`
 `CAMUNDA_JDBC_DB_NAME`|Postgres Database Name|Used on installation to create the database. Choose your own|`formsflow-bpm`
 `CAMUNDA_HIKARI_CONN_TIMEOUT`|Hikari Connection optimization setting||`30000`
 `CAMUNDA_HIKARI_IDLE_TIMEOUT`|Hikari Connection optimization setting||`600000`
 `CAMUNDA_HIKARI_MAX_POOLSIZE`|Hikari Connection optimization setting||`10`
 `CAMUNDA_HIKARI_VALID_TIMEOUT`|Hikari Connection optimization setting||`5000`

#### Camunda System Tuning 
---------------------------
 
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
  
#### Camunda formsflow.ai Integration Settings  
----------------------------------------------
 
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow.ai Rest API URI||`http://{your-ip-address}:5000`
 `FORMIO_DEFAULT_PROJECT_URL`:triangular_flag_on_post:|The URL of the forms-flow-forms server||`http://{your-ip-address}:3001`
 `FORMIO_ROOT_EMAIL`|forms-flow-forms admin login|eg. admin@example.com|`admin@example.com`
 `FORMIO_ROOT_PASSWORD`|forms-flow-forms admin password|eg.changeme|`changeme`
 `WEBSOCKET_SECURITY_ORIGIN` :triangular_flag_on_post:|Camunda task event streaming, for multiple origins you can separate them using a comma |eg:`host1, host2`| `http://{your-ip-address}:3000`
 `WEBSOCKET_MESSAGE_TYPE`|Camunda task event streaming. Message type ||`TASK_EVENT`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token||`giert989jkwrgb@DR55`
 
 #### Mail Configuration
 * Modify the file **mail-config.properties** (under forms-flow-bpm/src/main/resources/). The default settings provided are for the Gmail server, and you need to change the credentials at the bottom of the file. Note that you want to configure your own Gmail setting to allow unsecure apps first. 
 
#### Camunda - General Settings 
 ------------------------------
 
   Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `APP_SECURITY_ORIGIN`|CORS setup, for multiple origins you can separate them using a comma |eg:`host1, host2`| `*`
 `CAMUNDA_APP_ROOT_LOG_FLAG`|Log level setting||`error` 
   
 **Additionally, you may want to change these**  
*   The value of Datastore credentials (especially if this instance is not just for testing purposes)

### Running the application

* forms-flow-bpm service uses port 8000, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-bpm`

* For Linux,
   * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
   * Run `docker-compose -f docker-compose-windows.yml up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml stop` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml stop` to stop.
      
      
### Health Check

   The application should be up and available for use at port defaulted to 8000 in http://localhost:8000/camunda/
   
## How to Deploy Process

   REST service **/camunda/engine-rest/deployment/create** will be used for deployment of process.
   
   CURL commands are leveraged for this action. 
   
   ##### 1. Generate token using elevated user or service-client credentials
```   
      export token=`curl -X POST "{your keycloak url}/auth/realms/{realm}/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test" -d "password=test" -d "grant_type=password" -d "client_id=forms-flow-bpm" -d "client_secret=xxxxxxxxxxxxxx" | jq -r ".access_token"`
```
   ##### 2. Post the process as file with HTTP verb POST.
```
   curl -H "Authorization: Bearer ${token}" -H "Accept: application/json" -F "deployment-name=One Step Approval" -F "enable-duplicate-filtering=false" -F "deploy-changed-only=falses" -F "one_step_approval.bpmnn=@one_step_approval.bpmn"  http://{your-ip-address}:8000/camunda/engine-rest/deployment/create
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

## forms-flow-bpm Listeners
> This section elaborates on listeners created for use.

* The complete usage instructions on Listeners used with information on purpose, how-it-works and how-to-use is mentioned [here](./starter-examples/listeners/listeners-readme.md#listeners).

