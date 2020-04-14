# **forms-flow-bpm**

## Table of contents
* [Prerequisites](#prerequisites)
    * [Keycloak Configuration](#keycloak-configuration)
    * [Environment Configuration](#environment-configuration)
* [Project setup](#project-setup)

## Table of contents
* [Prerequisites](#pre-requisites)
* [Project setup](#project-setups)

## Prerequisites

- based on camunda version `7.12.0` , Spring boot 2.2.6.RELEASE and PostgreSQL (latest)

### Step 1 : Make sure you've set up the Keycloak 

1. Login to keycloak
2. Select your realm --> Go to clients tab --> create a new service account enabled client 
3. Besides configuring the client for protocol "openid-connect", the listed roles under "Service Client Roles".
    * query-groups
    * query-users
    * view-users
    
 NOTE: The default admin group "camunda-admin" has been provided in application.yaml, and this gets created durring container startup.
 
### Step 2 : Environment Variables

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

### Step 3 : Build and Deploy

   Use the following set of commands to build and run the application
      docker-compose build
      docker-compse up
      
### Step 4 : Verify the application status

   The application should be up and available for use at port defaulted to 8000 in application.yaml http://localhost:8000/camunda/
   
### Step 5 : Process Deployment

   REST service /camunda/engine-rest/deployment/create will be used for deployment of process.
   CURL commands are leveraged for this action. 
   1. Get the token
      export token=`curl -X POST "https://sso-dev.com/auth/realms/forms-flow-ai/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test" -d "password=test" -d "grant_type=password" -d "client_id=forms-flow-bpm" -d "client_secret=xxxxxxxxxxxxxx" | jq -r ".access_token"`
   2. Post the process as file with HTTP Verb POST.
   curl -H "Authorization: Bearer ${token}" -H "Accept: application/json" -F "deployment-name=One Step Approval" -F "enable-duplicate-filtering=false" -F "deploy-changed-only=falses" -F "one_step_approval.bpmnn=@one_step_approval.bpmn"  https://bpm1.aot-technologies.com/camunda/engine-rest/deployment/create
   
   NOTE: In case, POST request fails with permission issue. Login to camunda -> Admin -> Authorizations -> Deployment; then verif the user existence under "deployment" service. If does not, please add it manually. 
   
Post successful deployment of process, it is ready for use.
   
   ### Step 6 : Service Account Setup in Camunda
   
    For service account based rengine-rest accessibility i.e. process instance creation. Ensure to setup the service account  "service-account-forms-flow-bpm" in necessary services.
   
   






