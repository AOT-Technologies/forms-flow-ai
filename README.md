# Forms Flow.AI
`Forms Flow.AI` is an open source solution framework that is being developed by [AOT Technologies](https://www.aot-technologies.com/) that helps organizations to configure and deploy electronic forms along with related role based access, workflows and analytics in a short period of time.  This containerized devOps friendly solution can be easily deployed on-prem or on the public cloud secured with existing identity and access management systems owned by organizations. Solution uses an open source forms engine which allows staff users to self-create forms and attach to predefined or custom workflows. Solution includes capabilities to extract data for analytics, SLA tracking and lifecycle management of application submissions.

## Table of contents
* [Technologies Used](#technologies-used)
* [Running the application in Docker Environment](#running-the-application-in-docker-environment)
    * [Prerequisites](#prerequisites)
    * [Environment Variables Setup](#environment-variables-setup)
    * [Running the Application](#running-the-application)
* [Managing forms](#managing-forms)
* [Analytics-Redash](#analytics-redash)
* [Additional Configurations](#additional-configurations)
    * [SSL Nginx configurations](#ssl-nginx-configurations)

Technologies Used
------------------
- [form.io](https://www.form.io/opensource) (included under forms-flow-ai/forms-flow-forms)
- [Camunda](https://camunda.com/) (included under forms-flow-ai/forms-flow-bpm)
- [Keycloak](https://www.keycloak.org/) (existing Keycloak server required)
- [Redash](https://redash.io)(included under forms-flow-ai/forms-flow-analytics)
- [Nginx](https://www.nginx.com)(included under forms-flow-ai/nginx)

Running the application in Docker Environment
---------------------------------------------
The fastest way to run this library locally is to use [Docker](https://docker.com)

 [Install Docker](https://docs.docker.com/v17.12/install/), clone this github repository and follow the instructions below
 
   - Prerequisites
     -------------
      - Keycloak Configuration
         - [forms-flow-web](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web#keycloak-configuration)
         - [forms-flow-idm](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-idm#keycloak-configuration)
      - Camunda Keystore Setup - [Refer](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-bpm#http-https-setup)
         - Camunda should be started securely and keystore.ks configurations should be configured in the config yml: /forms-flow-bpm/src/main/resources/application.yaml

   - Environment Variables Setup
     ---------------------------
     - Set the appropriate environment variables given in the sample.env file and create a .env file in the projects root folder 
      - postgres db is used for camunda server
      - mongo db is used for forms-flow-forms server
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
- Refer [forms-flow-analytics](https://github.com/AOT-Technologies/forms-flow-ai/feature/tasks-base/forms-flow-analytics#how-to-run)

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
  - Refer [nginx](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/nginx#nginx)
  
NOTE:
  - Once nginx server is applied, change the hostnames in the Keycloak server for forms-flow-web and forms-flow-bpm
  - Also change values for REACT_APP_API_SERVER_URL and REACT_APP_API_PROJECT_URL with the hostname in .env file
  


