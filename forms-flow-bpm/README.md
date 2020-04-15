# **forms-flow-bpm**

## Table of contents
* [Prerequisites](#prerequisites)
* [Project setup](#project-setup)
  * [Step 1 : Make sure you have set up the Keycloak](#make-sure-you-have-set-up-the-keycloak)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : HTTP-HTTPS Setup](#http-https-setup)
  * [Step 4 : Build and Deploy](#build-and-deploy)
  * [Step 5 : Verify the application status](#verify-the-application-status)
  * [Step 6 : Process Deployment](#process-deployment)
  * [Step 7 : Service Account Setup in Camunda](#service-account-setup-in-camunda)

## Prerequisites

- based on camunda version `7.12.0` , Keycloak, Spring boot 2.2.6.RELEASE and PostgreSQL (latest)

## Project Setup

## Make sure you have set up the Keycloak 

1. Login to keycloak
2. Select your realm --> Go to clients tab --> create a new service account enabled client 
3. Besides configuring the client for protocol "openid-connect", the listed roles under "Service Client Roles".
    * query-groups
    * query-users
    * view-users
    
 NOTE: The default admin group "camunda-admin" has been referenced in application.yaml, and this needs to be available for use.
 
## Environment Configuration

1. Keycloak variables (Security)
    * KEYCLOAK_URL
    * KEYCLOAK_URL_REALM
    * KEYCLOAK_CLIENTID
    * KEYCLOAK_CLIENTSECRET
2. Database variables (Database)
    * JDBC_URL
    * JDBC_USER
    * JDBC_PASSWORD
    * JDBC_DRIVER
    
## HTTP-HTTPS Setup

### Enable SSL:

  
    1. Generate domain specific pem format and convert into pkcs12 using below commands.
 ```       
         openssl pkcs12 -export -out bpm1.pkcs12 -in combined.pem
         keytool -genkey -keyalg RSA -alias tomcat -keystore truststore.ks
         keytool -delete -alias tomcat -keystore truststore.ks

         keytool -import -v -trustcacerts -alias tomcat -file fullchain.pem -keystore truststore.ks
         keytool -genkey -keyalg RSA -alias tomcat -keystore keystore.ks

         keytool -v -importkeystore -srckeystore bpm1.pkcs12 -srcstoretype PKCS12 -destkeystore keystore.ks -des
 ```      
      2. Place the generated keystore.ks file and place in cert path ~/certs/keystore.ks. 
         
       NOTE: This configuration can be found in /forms-flow-bpm/src/mai/resources
       
  
### DISABLE SSL:
     
      Comment `server.ssl` block, and change the port to `8080` in application.yaml present in path /forms-flow-bpm/src/mai/resources
         
      NOTE: Accordingly, change the service port of `forms-flow-bpm` to `8000:8080` in docker-compose.yml present in root path.

## Build and Deploy

   Use the following set of commands to build and run the application
      docker-compose build
      docker-compse up
      
## Verify the application status

   The application should be up and available for use at port defaulted to 8000 in application.yaml http://localhost:8000/camunda/
   
## Process Deployment

   REST service /camunda/engine-rest/deployment/create will be used for deployment of process.
   CURL commands are leveraged for this action. 
   1. Get the token
      export token=`curl -X POST "https://sso-dev.com/auth/realms/forms-flow-ai/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test" -d "password=test" -d "grant_type=password" -d "client_id=forms-flow-bpm" -d "client_secret=xxxxxxxxxxxxxx" | jq -r ".access_token"`
   2. Post the process as file with HTTP Verb POST.
   curl -H "Authorization: Bearer ${token}" -H "Accept: application/json" -F "deployment-name=One Step Approval" -F "enable-duplicate-filtering=false" -F "deploy-changed-only=falses" -F "one_step_approval.bpmnn=@one_step_approval.bpmn"  https://bpm1.aot-technologies.com/camunda/engine-rest/deployment/create
   
   NOTE: In case, POST request fails with permission issue. Login to camunda -> Admin -> Authorizations -> Deployment; then verif the user existence under "deployment" service. If does not, please add it manually. 
   
Post successful deployment of process, it is ready for use.
   
## Service Account Setup in Camunda
   
    For service account based rengine-rest accessibility i.e. process instance creation. Ensure to setup the service account  `service-account-forms-flow-bpm` in necessary services.
   
