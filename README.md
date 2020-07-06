# Forms Flow.AI
`Forms Flow.AI` is an open source solution framework that is being developed by [AOT Technologies](https://www.aot-technologies.com/) that helps organizations to design electronic forms using a simple drag-and-drop form builder interface. These forms can be associated with any workflow of choice. The system does allow visualization of data.  

This containerized devOps friendly solution can be easily deployed on-prem or on the public cloud secured with an existing identity and access management owned by organizations. 

## Table of contents
* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Features](#features)
* [How It Works](#how-it-works)
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
TO DO

Built With
------------------

- [form.io](https://www.form.io/opensource) (included under forms-flow-ai/forms-flow-forms)
- [Camunda](https://camunda.com/) (included under forms-flow-ai/forms-flow-bpm)
- [Keycloak](https://www.keycloak.org/) (existing Keycloak server required)
- [Redash](https://redash.io)(included under forms-flow-ai/forms-flow-analytics)
- [Python]() (included under forms-flow-ai/forms-flow-webapi)
- [Nginx](https://www.nginx.com)(included under forms-flow-ai/nginx)

Features and advantages of this project
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

How It Works
------------------
The system has listed roles for system administration.
- Designer – Design and manage electronic forms.
- Reviewer(Staff) – Receive and process online submissions.
- Client – Fill in and submit online form(s).

User Story #1: 
```
1. As a designer, I want to design any electronic forms, and associate with any already deployed workflows of choice, so that the clients can access them.
2. As a Client, I want to fill any of the available forms seemelessly and submit them for processing.
3. As a Staff, I want to see all applications i.e. form submissions of my group, so that can act upon it.
```

User Story #2:
```
1. As a designer, I want to update any of the existing electronic form, so that the clients can access them.
2. As a Client, I want to fill any of the available forms seemelessly and submit them for processing.
```

User Story #3:
```
1. As a Staff, I want to get a detailed insight on form data; which would aid me in decision making.
```

User Story #4:
```
1. As a Staff, I want to get an aggregated analytics about operational activities.
```

Installation
---------------------------------------------
### Running the application using [Docker](https://docker.com)

 1. [Install Docker](https://docs.docker.com/v17.12/install/), clone this github repository and follow the instructions below
 
 2.
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

