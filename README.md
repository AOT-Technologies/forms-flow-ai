# Forms Flow.AI
`Forms Flow.AI` is an open source solution framework developed and maintained by [AOT Technologies](https://www.aot-technologies.com/). The framework combines selected  open source Forms, Workflow, Analytics and Security products with custom-built integration code to provide a seamless solution which provides a viable alternative to expensive, enterprise software products.

## Table of contents
* [About the Project](#about-the-project)
  * [Project dependencies](#project-dependencies)
* [Features](#features)
* [User and roles](#users-and-roles)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Running the application in Docker Environment](#running-the-application-in-docker-environment)
* [Managing forms](#managing-forms)
* [Additional Configurations](#additional-configurations)
    * [SSL Nginx configurations](#ssl-nginx-configurations)
* [License](#license)
* [Links](#links)

About the Project
------------------
The project was initiated by AOT Technologies as a means of addressing the general situation whereby end-users fill in a form, the form is processed and there may be a requirement to report on the form metrics or data. Typical use cases are :

* Applications for licences
* Public submissions
* FOI requests
* Applications for funding
* Statements of compliance
* Employee onboarding
* Performance Reviews
* Emergency processes
* Escalations
* Surveys
* Case Management


Project Dependencies
------------------

- [form.io](https://www.form.io/opensource) (included under forms-flow-ai/forms-flow-forms)
- [Camunda](https://camunda.com/) (included under forms-flow-ai/forms-flow-bpm)
- [Keycloak](https://www.keycloak.org/) (existing Keycloak server required)
- [Redash](https://redash.io)(included under forms-flow-ai/forms-flow-analytics)
- [Python]() (included under forms-flow-ai/forms-flow-webapi)
- [Nginx](https://www.nginx.com)(included under forms-flow-ai/nginx)

Features 
------------------
- Ease-of-use: Drag drop and build forms using designer studio interface
- Lightweight Workflow Engine: Support for both (micro-)service orchestration and human task management
- Business Driven Decision Engine: Pre-integrated with the workflow engine, and also can be used as a stand-alone via REST 
- Notifications: Custom built components sends information about new submissions, reminders on nearing SLAs and followups. 
- Escalation and Alerts Management: Customizable escalation strategy of sending notifications, re-assigning the tasks and alerts on thresholds 
- Visualization and dashboards: Create beautiful visualizations with drag and drop
- Multi-tenancy isolation.
- Get up and running quickly with prebuilt Forms, workflows and dashboards.
- User your Keycloak-server for authentication


## Project tree

. * [README.md](./README.md) This file
 * [forms-flow-analytics](./forms-flow-analytics) ReDash analytics components
   * [README](./forms-flow-analytics/README)
 * [forms-flow-bpm](./forms-flow-bpm) Camunda Workflow deployment and integration
    * [README](./forms-flow-bpm/README)
* [forms-flow-db](./forms-flow-db) Database scripts
   * [README](./forms-flow-db/README)
 * [forms-flow-forms](./forms-flow-forms) form. io deployment and  integration
   * [README](./forms-flow-forms/README)
 * [forms-flow-idm](./forms-flow-idm) Identity Management (Keycloak)
   * [README](./forms-flow-idm/README)
 * [forms-flow-web](./forms-flow-web) React Integration client
   * [README](./forms-flow-web/README)
 * [mongodb](./mongodb) Mongodb database for form.io integration
   * [README](./mongodb/README)
 * [openshift](./openshift)  Openshift deploynent
   * [README](./openshift/README)
 * [postgres](./postgres) Postgres database for BPM integration
   * [README](./postgres/README)
* [nginx](./nginx) nginx front-end web server
   * [README](./nginx/README)

Users and Roles
------------------
The framework defines user roles which are standardised across all the products. During the installation process, component-specific variants of these roles are set up , these need to be added to the main .env file in order to provide seamless integration

- Designer (Admin)  

  * Design and manage electronic forms. 
  * Create workflows and associate forms with deployed workflows. 
  * Create metrics and analytics dashboards. 
- Reviewer(Staff)
  * Receive and process online submissions. 
  * Fill in forms on behalf of the client if needed. 
  * View reports on analytics (slice 'n dice the data within the form) and metrics (details about the process eg. how many cases processed per day  )
- Client 
  * Fill in and submit online form(s).


Installation and configuration
---------------------------------------------
The framework installs the products  mentioned above (with the exception of Keycloak which must either be pre-existing or installed and configured in advance).

The products are installed with a default configuration so that the base system works "out-the-box", however the advanced configuration and management of the products requires the relevant product documentation. 

## Prerequisites

* The system is deployed and run using [docker-compose](https://docker.com) and [docker](https://docker.com). These need to be available. 
* There needs to be a [Keycloak](https://www.keycloak.org/) server available and you need admin privileges (ability to create realms, users etc.). Keycloak needs to be set up as per the instructions in [BLAH]
* All components are installed by default onto a single server. Distribution across multiple servers would be possible but beyond the scope of this document
* This server  can be a local PC or Mac provided it is 64-bit with at least 16GB RAM and 100GB HDD

## Default settings

By default the following component settings are configured. These could be changed to other components if needed but it is beyound the scope of this document 
* postgres db is used for the Camunda server
* mongo db is used for the form.io server
* Keycloak is used as the identity management server. The Keycloak setup 


## Build

* Clone this github repo.
* In the project root folder copy the sample.env file to .env 
* Edit the .env file according to the details contained in [Environment Variables Setup](#environment-variables-setup)
* Start the system as per [Running the application](#running-the-application)

## Environment Variables Setup

Environment variable with no default value need to be defined (unless otherwise specified). In general those with a default value can be left as is depending on specific circumstances. 

#### General

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`NODE_ENV` | define project level configuration | `development, test, production` | `development`
`APP_SECURITY_ORIGIN` | Set CORS Origin |Domains from which cross-site requests are allowed |`*`

### Postgres
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`POSTGRES_USER`|Postgres Root Username| choose your own |`postgres`
`POSTGRES_PASSWORD`|Postgres Root Password|choose your own|`changeme`
`POSTGRES_DB`|Postgres Database Name|choose your own|`postgres`

### Mongo
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`MONGO_INITDB_ROOT_USERNAME`|Mongo Root Username|Can be blank|
`MONGO_INITDB_ROOT_PASSWORD`|Mongo Root Password|Can be blank
`MONGO_INITDB_DATABASE`|Mongo Database Name||formio
`MONGO_REPLICA_SET_NAME`|Mongo Replica set name|| rs0


###  KEYCLOAK
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_URL`| URL to your keycloak server|eg. https://iam.aot-technologies.com| must be set to your keycloak server
`KEYCLOAK_URL_REALM`|The Keyvcloak realm to use| eg. form-test| must be set to your keycloak realm
`KEYCLOAK_CLIENTID`|Your Keycloak Client ID within the realm|eg. forms-flow-bpm | must be set to your keycloak client id
`KEYCLOAK_CLIENTSECRET`|The secret for your Keycloak Client Id| eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12 | must be set to yourkeycloak client secret


 
### Environment Variables for form.io 
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`ROOT_EMAIL`|form.io admin login |eg. user@gov.bc.ca | must be set to whatever email address you want form.io to have as admin user|
`ROOT_PASSWORD`|form.io admin password|eg. dontusethis|must be set to whatever password you want for your form.io admin user

### Environment Variables for React app

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`REACT_APP_CLIENT_ROLE`|The role name used for client users|Must match corresponding name set up in keycloak|`formsflow-client`
`REACT_APP_STAFF_DESIGNER_ROLE`|The role name used for designer users|Must match corresponding name set up in keycloak|`formsflow-designer`
`REACT_APP_STAFF_REVIEWER_ROLE`|The role name used for reviewer users|Must match corresponding name set up in keycloak|`formsflow-reviewer`
`REACT_APP_API_SERVER_URL`|The URL of the form.io server ||`http://localhost:3001`
`REACT_APP_API_PROJECT_URL`|The URL of the form.io project server ||`http://localhost:3001`
`REACT_APP_CLIENT_ID`|form.io client role Id|eg. 10121d8f7fadb18402a4c|must get the value from form.io interface as per 
`REACT_APP_STAFF_REVIEWER_ID`|form.io reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d| must get the value from form.io interface as per 
`REACT_APP_STAFF_DESIGNER_ID`|form.io administrator role Id|eg. 5ee090afee045f1597609cae|must get the value from form.io interface as per 
`REACT_APP_ANONYMOUS_ID`|form.io anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|must get the value from form.io interface as per
`REACT_APP_USER_RESOURCE_FORM_ID`| User forms form-Id| eg.5ee090b0ee045f51c5609cb1| must get the value from form.io interface as per
`REACT_APP_KEYCLOAK_CLIENT`|Keycloak-client-name for web||forms-flow-web
`REACT_APP_EMAIL_SUBMISSION_GROUP`|Keycloak group to to which to send Email notifications| | `formsflow-reviewer`
`REACT_APP_INSIGHT_API_BASE`| Insight Api base end-point| eg. | 
`REACT_APP_INSIGHTS_API_KEY`| API_KEY from REDASH | | must insert your ReDash API key here
`REACT_APP_WEB_BASE_URL`|Web API base endpoint|||
`REACT_APP_BPM_API_BASE`| URL of BPM API||`http://localhost:8000`
`JDBC_URL`|JDBC DB Connection URL for BPM-API||`jdbc:postgresql://forms-flow-bpm-db:5432/postgres`	
`JDBC_USER`|Username for BPM database user|||	
`JDBC_PASSWORD`|Password for BPM database user|||
`JDBC_DRIVER`|JDBC driver||`org.postgresql.Driver`
# Environment variables for forms-flow-webapi##

WEB_API_DATABASE_URL=postgresql://<USER>:<PASSWORD>@forms-flow-webapi-db:5432/<WEBAPI_DB>
WEB_API_POSTGRES_USER=<USER>
WEB_API_POSTGRES_PASSWORD=<PASSWORD>
WEB_API_POSTGRES_DB=<WEBAPI_DB>

SECRET_KEY='--- change me now ---'

BPM_TOKEN_API=<KEYCLOAK-BASE-URL>/auth/realms/forms-flow-ai/protocol/openid-connect/token
BPM_CLIENT_ID=forms-flow-bpm
BPM_CLIENT_SECRET=<BPM CLIENT SECRET KEY HERE>
BPM_GRANT_TYPE=client_credentials

BPM_API_BASE=http://localhost:8000/camunda/engine-rest/
API_PROCESS=process-definition/
API_TASK_HISTORY=history/task/
API_TASK=task/

JWT_OIDC_WELL_KNOWN_CONFIG = https://iam.aot-technologies.com/auth/realms/forms-flow-ai/.well-known/openid-configuration
JWT_OIDC_ALGORITHMS = RS256
JWT_OIDC_JWKS_URI = https://iam.aot-technologies.com/auth/realms/forms-flow-ai/protocol/openid-connect/certs
JWT_OIDC_ISSUER = https://iam.aot-technologies.com/auth/realms/forms-flow-ai
JWT_OIDC_AUDIENCE = forms-flow-web
JWT_OIDC_CACHING_ENABLED = True
JWT_OIDC_JWKS_CACHE_TIMEOUT = 300
```
     ---------------------------
    
      - Keycloak configuraions has to be done prior and the secrets has to be configured in the **Environment Variables for KEYCLOAK** section
      - Roles names from Keycloak has to be configured in the **Environment Variables for forms-flow-web** section
      - Role Id's and URL from forms-flow-forms has to be configured in the **Environment Variables for forms-flow-web** section - [Refer section](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web#environment-configuration) for setup
      - Camunda UserId's from Keycloak URLs has to be configured in the **Environment Variables for forms-flow-bpm** section
      - Default username and password for admin has to be configured in the **Environment Variables for forms-flow-forms** section
      - Change the REACT_APP_API_PROJECT_URL and REACT_APP_API_SERVER_URL with http://localhost:3001
      - Change the REACT_APP_BPM_API_BASE with https://localhost:8000

   - Running the Application
     -----------------------
      - Open up your terminal and navigate to the root folder of this project
      - Start the application using the command
            ```docker-compose up --build
            ```
       - The following applications will be started and can be accessed in your browser.
         - http://localhost:3000 - forms-flow-web
         - http://localhost:3001 - forms-flow-forms
         - https://localhost:8000/camunda - forms-flow-bpm
    
Managing forms
--------------
- Refer [forms-flow-web](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web#forms-flow-web)

Analytics-Redash
----------------
- Refer [forms-flow-analytics](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-analytics#how-to-run)

Additional Configurations
-------------------------
- SSL Nginx configurations
  ------------------------
   - Create hostnames and secure them using the appropriate certificates
     - Generate certificates as below and place in the appropriate server paths
         - forms-flow-web hostname fullchain.pem
         - forms-flow-web hostname privkey.pem
         - forms-flow-forms hostname fullchain.pem
         - forms-flow-forms hostname privkey.pem
         - forms-flow-bpm hostname fullchain.pem
         - forms-flow-bpm hostname privkey.pem
  - Open /nginx/conf.d/app.conf
  - Update the paths accordingly in the app.conf
     - Update the localhost to the server IP address for the below URLs
         - http://localhost:3000
         - http://localhost:3001
         - https://localhost:8000
           - NOTE: 'https' for localhost:8000
  - Refer [nginx](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/nginx#how-to-run)
  
NOTE:
  - Once nginx server is applied, change the hostnames in the Keycloak server for forms-flow-web and forms-flow-bpm
  - Also change values for REACT_APP_API_SERVER_URL and REACT_APP_API_PROJECT_URL with the hostname in .env file
  
## License

FormsFlow-AI is licensed under the terms of the GPL Open Source
license and is available for free.

## Links

* [Web site](https://www.aot-technologies.com/)
* [Source code](https://github.com/AOT-Technologies/forms-flow-ai)

