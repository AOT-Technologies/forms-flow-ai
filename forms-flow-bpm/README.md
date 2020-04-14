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
2. Select your realm --> Go to clients tab --> create a new service account enabled client --> Assign listed realm based service account roles to client.
    * query-groups
    * query-users
    * view-users
    
 NOTE: The default admin group "camunda-admin" has been provided in application.yaml, and this gets created durring container startup.
 
### Step 2 : Environment Variables

  
