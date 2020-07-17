# **Workflow Engine**

**Forms Flow.AI** leverages Camunda for workflow and decision automation.
It is currently based on camunda version `7.13.0` , Keycloak, Spring boot `2.2.7.RELEASE` and PostgreSQL (latest).
 
To know more about Camunda, go to https://github.com/camunda/camunda-bpm-identity-keycloak.

## Table of contents
* [Prerequisites](#prerequisites)
* [Project setup](#project-setup)
  * [Step 1 : Keycloak Configuration](#keycloak-configuration)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : Build and Deploy](#build-and-deploy)
  * [Step 4 : Verify the application status](#verify-the-application-status)
* [How to Deploy Process](#how-to-deploy-process)
* [How to Enable SSL](#how-to-enable-ssl)

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 
There needs to be a [Keycloak](https://www.keycloak.org/) server available and you need admin privileges (to create realms, users etc. in Keycloak).

## Project Setup

### Keycloak Configuration

1. Login to keycloak
2. Select your realm --> Go to clients tab --> Create a new service account enabled client 
3. Configure the client for protocol "openid-connect", and configure the following listed roles under "Service Client Roles":
    * query-groups
    * query-users
    * view-users
4. Configure a custom Client Scope named `camunda-rest-api` [to include the expected audience claim in delivered tokens](https://github.com/camunda/camunda-bpm-identity-keycloak/tree/master/examples/sso-kubernetes#optional-security-for-the-camunda-rest-api)
    * Add a mapper with type `Audience` and configure the required audience `camunda-rest-api`
    * Assign the created Client Scope to our existing Camunda-Identity-Service used for authentication

 NOTE: The default admin group "camunda-admin" has been referenced in application.yaml, and this needs to be available for use.
 
### Environment Configuration

This section elaborates on properties exposed for tuning the system.
 
 Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `KEYCLOAK_URL`| URL to your keycloak server |eg. https://iam.aot-technologies.com | must be set to your keycloak serve
 `KEYCLOAK_URL_REALM`|	The Keyvcloak realm to use|eg. forms-flow-ai | must be set to your keycloak realm
 `KEYCLOAK_BPM_CLIENTID`|Your Keycloak Client ID within the realm| eg. forms-flow-bpm | must be set to your keycloak client id
 `KEYCLOAK_BPM_CLIENTSECRET`|The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to yourkeycloak client secret
 `CAMUNDA_JDBC_URL`|Postgres JDBC DB Connection URL|Used on installation to create the database.Choose your own|`jdbc:postgresql://forms-flow-bpm-db:5432/postgres`
 `CAMUNDA_JDBC_DRIVER`|Postgres JDBC Database Driver||`org.postgresql.Driver`
 `CAMUNDA_POSTGRES_USER`|Postgres Database Username|Used on installation to create the database.Choose your own|`postgres`
 `CAMUNDA_POSTGRES_PASSWORD`|Postgres Database Password|Used on installation to create the database.Choose your own|`changeme`
 `CAMUNDA_POSTGRES_DB`|Postgres Database Name|Used on installation to create the database.Choose your own|`camunda`
   
### Build and Deploy

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is forms-flow-bpm.
   * Modify the configuration values as needed. For example, you may want to change these:
        * The Postgres volume location
        * The value of datastore credentials   
   * Run `docker-compose build` to build.
   * Run `docker-compose up -d` to start.
      
### Verify the application status

   The application should be up and available for use at port defaulted to 8000 in application.yaml http://localhost:8000/camunda/
   
## How to Deploy Process

   REST service **/camunda/engine-rest/deployment/create** will be used for deployment of process.
   
   CURL commands are leveraged for this action. 
   
   ##### 1. Generate token using elevated user or service-client credentials
```   
      export token=`curl -X POST "https://sso-dev.com/auth/realms/forms-flow-ai/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test" -d "password=test" -d "grant_type=password" -d "client_id=forms-flow-bpm" -d "client_secret=xxxxxxxxxxxxxx" | jq -r ".access_token"`
```
   ##### 2. Post the process as file with HTTP verb POST.
```
   curl -H "Authorization: Bearer ${token}" -H "Accept: application/json" -F "deployment-name=One Step Approval" -F "enable-duplicate-filtering=false" -F "deploy-changed-only=falses" -F "one_step_approval.bpmnn=@one_step_approval.bpmn"  https://bpm1.aot-technologies.com/camunda/engine-rest/deployment/create
```
   
   **NOTE: In case, POST request fails with permission issue. Login to camunda -> Admin -> Authorizations -> Deployment; then verify the account existence under "deployment" service. If does not, please add it manually.**
   
Post successful deployment of process, it is ready for use.
   
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
**NOTE: Alternatively, you can directly place your ssl cert under the classpath "/forms-flow-bpm/src/main/resources". Your configuration for the key-store in application.yaml would be `key-store: classpath:/keystore.ks`**
