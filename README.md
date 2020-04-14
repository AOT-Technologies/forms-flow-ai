# Forms Flow.AI
`Forms Flow.AI` is an open source solution framework that is being developed by [AOT Technologies](https://www.aot-technologies.com/) that helps organizations to configure and deploy electronic forms along with related role based access, workflows and analytics in a short period of time.  This containerized devOps friendly solution can be easily deployed on-prem or on the public cloud secured with existing identity and access management systems owned by organizations. Solution uses an open source forms engine which allows staff users to self-create forms and attach to predefined or custom workflows. Solution includes capabilities to extract data for analytics, SLA tracking and lifecycle management of application submissions.

Technologies Used
------------------

- [form.io](https://www.form.io/opensource) (included under forms-flow-ai/forms-flow-forms)
- [Camunda](https://camunda.com/) (included under forms-flow-ai/forms-flow-bpm)
- [Keycloak](https://www.keycloak.org/) (existing Keycloak server required)


Run with Docker Compose
------------------
The fastest way to run this library locally is to use [Docker](https://docker.com).

 - [Install Docker](https://docs.docker.com/v17.12/install/)
 - Clone the github repository
 - Set the appropriate environment variables in .env file
   - postgres db is used for camunda server
   - mongo db is used for forms-flow-forms server
   - Keycloak configuraions has to be done prior and the secrets has to be configured in the KEYCLOAK section
   - UserId's secrets from Keycloak has to be configured in the forms-flow-web section
   - Camunda UserId's from Keycloak has to be configured in the forms-flow-bpm section
   - Default username and password has to be configured in the forms-flow-forms section
   - Change the REACT_APP_API_PROJECT_URL and REACT_APP_API_SERVER_URL with http://localhost:3001
   - Change the REACT_APP_BPM_API_BASE with https://localhost:8000
 - Open up your terminal and navigate to the root folder of this project
 - Type the following in your terminal
    ```
    docker-compose up --build
    ```
 - The following applications will be started and can be accessed in your browser for additional configurations.
   - http://localhost:3000 - forms-flow-web
   - http://localhost:3001 - forms-flow-forms
   - https://localhost:8000 - forms-flow-bpm
    
Importing and Exporting Forms
-----------------------------

Refer [forms-flow-web](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web#forms-flow-web)


Nginx configurations for the App for HTTPS
------------------------------------------
  - Create hostnames and secure them using the appropriate certificates
  - Open /nginx/conf.d/app.conf
  - Update the ip address to your server and apply the certificates for the below URLs
    - Example given in the current configuration:
      - http://localhost:3000 - app1.aot-technologies.com
      - http://localhost:3001 - forms1.aot-technologies.com
      - https://localhost:8000 - bpm1.aot-technologies.com
        - Note 'https' for localhost:8000, camunda should be started securely (config yml: /forms-flow-bpm/src/main/resources/application.yaml)
  - Once applied change the hostnames in the Keycloak server for forms-flow-web and forms-flow-bpm
  - Also change values for REACT_APP_API_SERVER_URL and REACT_APP_API_PROJECT_URL with the hostname in .env file
