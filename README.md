# FormsFlow.AI
**FormsFlow.AI** is an open source solution framework developed and maintained by [AOT Technologies](https://www.aot-technologies.com/). The framework combines selected  open source Forms, Workflow, Analytics and Security products with custom-built integration code to provide a seamless solution which provides a viable alternative to expensive, enterprise software products.

## Table of Content
* [About the Project](#about-the-project)
  * [Project Dependencies](#project-dependencies)
  * [Project Tree](#project-tree)
* [Features](#features)
* [System Architecture](#system-architecture)
* [User and Roles](#users-and-roles)
* [System Operation](#system-operation)
* [Deployment and Configuration](#deployment-and-configuration)
  * [Prerequisites](#prerequisites)
  * [Configure and Build](#configure-and-build)
* [Running the Application](#running-the-application)
* [Managing Forms](#managing-forms)
* [Managing Workflows](#managing-workflows)
* [Managing Analytics Dashboard](#managing-analytics-dashboard)
* [License](#license)
* [Links](#links)

## About the Project
The project was initiated by AOT Technologies as a means of addressing the general situation whereby end-users fill in a form, the form is processed and there may be a requirement to report on the form metrics or data. Typical use cases are:

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

### Project Dependencies


- [form.io](https://www.form.io/opensource) (included under ./forms-flow-forms)
- [Camunda](https://camunda.com/) (included under ./forms-flow-bpm)
- [Redash](https://redash.io) (included under ./forms-flow-analytics)
- [Keycloak](https://www.keycloak.org/) (existing Keycloak server required)
- [Python](https://www.python.org/) (included under ./forms-flow-api)
- **Optional**: [Nginx](https://www.nginx.com) (included under ./deployment/nginx) 

### Project Tree


 * [README.md](./README.md) This file
 * [deployment](./deployment) Deployment of complete framework
   * [README](./deployment/README)
 * [forms-flow-analytics](./forms-flow-analytics) Redash analytics components
   * [README](./forms-flow-analytics/README)
 * [forms-flow-bpm](./forms-flow-bpm) Camunda Workflow deployment and integration
    * [README](./forms-flow-bpm/README)
 * [forms-flow-forms](./forms-flow-forms) form. io deployment and  integration
   * [README](./forms-flow-forms/README)
 * [forms-flow-idm](./forms-flow-idm) Identity Management (Keycloak)
   * [README](./forms-flow-idm/README)
 * [forms-flow-web](./forms-flow-web) Forms Flow Integration client
   * [README](./forms-flow-web/README)
* [forms-flow-api](./forms-flow-api) REST API to FormsFlow integration components
   * [README](./forms-flow-api/README)

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



## System Architecture

See diagram 

![FormsFlow AI Component Architecture](./.images/formsflow-ai-components.png)

### Components 

The components of the system are:
#### Formsflow UI
Browser-based React integration web UI
Most of the day-to-day end-user and review tasks are performed from this application,  built specifically to act as a common UI combining forms, workflow and analytics functionality. The web-application is written as a [progressive](https://en.wikipedia.org/wiki/Progressive_web_application) app with potential for offline data-entry. FormsFlow UI accesses the individual system component data through native API's using OIDC or SAML access tokens.

#### Redash Admin UI
The native admin interface to Redash (bundled and unchanged). Use this to build analytics dashboards.
#### Redash API
The REST interface to the Redash core. Bundled and unchanged
#### Form.io API
The REST interface to the form.io core
#### Camunda Admin UI
The native admin interface to Camunda (bundled and unchannged) . Use this to define workflows and to manage workflow tasks as an admin.
#### REST API
API providing business logic around Formsflow Postgres  developed in Python. This API is used extensively by the FormsFlow UI to synchronize, maintain state, extend functionality and integrate between components.
#### Nginx Web server (optional)
Webserver providing reverse-proxy redirection and SSL to components for remote deployments. ( bundled and configured ) 

#### Keycloak Identity management server 
The system  uses an existing (your) Keycloak server which provides a common identity management capability. Provisioning of the Keycloak server is not part of this project, however there are specific [Keycloak configuration tasks](./forms-flow-idm/README) which are required for this project. 

## Users and Roles

The framework defines user roles which are standardised across all the products. During the installation process, component-specific variants of these roles are set up , these need to be added to the main .env file in order to provide seamless integration:

- formsflow-designer  
  * Design and manage electronic forms
- formsflow-bpm
  * Create workflows and associate forms with deployed workflows
- formsflow-analyst
  * Create metrics and analytics dashboards. 
- formsflow-reviewer
  * Receive and process online submissions. 
  * Fill in forms on behalf of the client if needed. 
  * View reports on analytics (slice 'n dice the data within the form) and metrics (details about the process eg. how many cases processed per day  )
- formsflow-client 
  * Fill in and submit online form(s)


  A user may be assigned multiple roles. This is done in Keycloak by the Keycloak administrator. 

  For example it is possible to assign a user to roles formsflow-analyst and formsflow-reviewer, which would allow the user to not only process forms but also design analytics dashboards. 



## System Operation

In general operation is as follows (assuming local installation ):

#### End-user
* End-user logs into FormsFlow UI at url https://localhost/formsflow-ui
* User is redirected to Keycloak via OIDC where user's roles are returned as OIDC claims in a JWT
* User selects a form from the list of forms available. The available forms can be filtered by the user group with advanced configuration, by default the user sees all forms published. Form details are provided through form.io 
* The user fills in the form and submits it
* The form data is added to the Mongo DB. Details of the transaction are added to the Postgress DB
* A task is created on the Camunda server corresponding to the form type
* Notifications are sent to reviewers associated with that task type

#### Reviewer

* Reviewer logs into FormsFlow UI at url https://localhost/formsflow-ui
* Reviewer is redirected to Keycloak via OIDC where user's roles are returned as OIDC claims in a JWT. The fact that the reviewer has a reviewer role from Keycloak enables additional capabilities in the UI.
* Reviewer accesses task from task list. Tasks are retrieved through the Camunda API, filtered by the reviewer group memberships mapped between Keycloak and native Camunda. 
* Reviewer claims a task and processes it. The task moves to the next step in the workflow, with appropriate notifications and actions specific to that workflow.
* Reviewer  has the capability to access forms from the forms list, filtered by the group permissions of the user groups as per advanced configuration.
* Reviewer  has the ability to access metrics data from Postgres database filtered according to the configuration. FormsFLow UI renders these metrics into usable pages. 
* Reviewer has the ability to access Redash analytics dashboards (as iframes). Access to the Redash dashboards and the configuration for them is covered in 

#### Designers / Administrators

These users are responsible for accessing the native capabilities of the embedded products in order to configure analytics dashboards, create and manage workflows and create and manage forms. It is beyond the scope of this document to describe the detailed functionality of these products, however the general process is :

* Access product URL as follows:
  * Camunda: https://localhost/camunda
  * form.io: https://localhost/formflow-ui (the form designer is embedded into the FormsFlow UI)
  * Redash: https://localhost/analytics
* The login process is the same for all of them, redirect to Keycloak as OIDC (SAML for Redash) and optain the appropriate JWT + claims. 
* For the forms designer, the FormFlow UI recognises the additional role of formsflow-designer and enables a form design capability
* For Redash and Camunda, there is a mapping in the configuration file which needs to be setup between formsflow-analyst and formsflow-bpm and the corresponding groups in Redash and Camunda respectively. This is all covered in the installation instructions.



## Deployment and Configuration
 The framework installs the products mentioned above (with the exception of Keycloak which must either be pre-existing or installed and configured in advance).

The products are installed with a default configuration so that the base system works "out-the-box", however the advanced configuration and management of the products requires the relevant product documentation. 

### Prerequisites

* Admin access to a local or remote server (can be local PC or Mac provided it is 64-bit with at least 16GB RAM and 100GB HDD) where [docker-compose](https://docker.com) and [docker](https://docker.com) are installed and configured. 
* Admin access to a [Keycloak](https://www.keycloak.org/) server  (ability to create realms, users etc.)

### Configure and Build

* Clone this github repo
* cd  to deployment/docker folder using ```cd ./deployment/docker```
* Follow the instructions in the [README](./deployment/docker/README.md)
* If deploying to a remote server, you can use nginx as a reverse proxy. To help you, follow the instructions in the [README of Nginx](./deployment/nginx/README.md)
* Start the system as per [Running the application](#running-the-application)


## Running the Application
* Open up your terminal and navigate to the root folder of this project
* Start the application using the command
            ```docker-compose up --build           ```
* The following applications will be started and can be accessed in your browser.
         - http://localhost:3000 - forms-flow-web
         - http://localhost:3001 - forms-flow-forms
         - https://localhost:8000/camunda - forms-flow-bpm
    
## Managing Forms

  * Login to **http://localhost:3000/** using valid **designer** credentials
  * Navigate to menu **Forms**
  * Click the button **+ Create Form** to launch the form designer studio.
  * Design the form using **Drag and Drop** of components from LHS to RHS and publish by clicking the button **Create Form**.

To know more about formio, go to https://help.form.io/userguide/introduction/.

## Managing Workflows

* You would need the Camunda Modeler to design your BPMN: https://camunda.com/download/modeler/
* To learn about designing your BPMN, go to https://docs.camunda.org/get-started/quick-start/service-task/
* To learn about deploying your BPMN, go to https://docs.camunda.org/get-started/quick-start/deploy/. Note that your default endpoint for Camunda's REST API is http://localhost:8000/camunda/engine-rest


## Managing Analytics Dashboard

- Please refer to [forms-flow-analytics](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-analytics#how-to-run)

 
## License

Copyright 2020 AOT-Technoogies

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Links

* [Web site](https://www.aot-technologies.com/)
* [Source code](https://github.com/AOT-Technologies/forms-flow-ai)

