# Formsflow.ai Web Application

![React](https://img.shields.io/badge/React-17.0.2-blue)

**formsflow.ai** delivers progressive web application with React version `17.0.2` and `create-react-app`. Also currently uses  [form.io](https://github.com/formio/formio) version `2.0.0--rc.34`.

A React library for rendering out forms based on the form.io platform.

## Table of Content
1. [Prerequisites](#prerequisites)
2. [Solution Setup](#solution-setup)
   - [Step 1 : Keycloak Setup](#keycloak-setup)
   - [Step 2 : Installation](#installation)
   - [Step 3 : Running the Application](#running-the-application)
   - [Step 4 : Health Check](#health-check)
3. [How to Create Your First Form](#how-to-create-your-first-form)

## Prerequisites

* The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available.
* There needs to be a [Keycloak](https://www.keycloak.org/downloads.html) server available and you need admin privileges (to create realms, users etc. in Keycloak).
* Please make sure the [Formio server](../forms-flow-forms/) is up and running.

## Solution Setup

### Keycloak Setup

NOTE:***Skip this step if you are already having a setup ready.***

* Detailed instructions on setting up Keycloak for **formsflow.ai web application**
is mentioned on the [link](../forms-flow-idm/keycloak/README.md#create-forms-flow-web-client).

### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is forms-flow-web.
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. Details below,

 Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `NODE_ENV`| Define project level configuration | `development, test, production` | `development`
 `CLIENT_ROLE`|	The role name used for client users|| `formsflow-client`
 `CLIENT_ROLE_ID`|form.io client role Id|eg. 10121d8f7fadb18402a4c|`must get the value from form.io resource ` **http://localhost:3001/role**
 `REVIEWER_ROLE`|The role name used for staff/reviewer users||`formsflow-reviewer`
 `REVIEWER_ROLE_ID`|form.io reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|`must get the value from form.io resource ` **http://localhost:3001/role**
 `DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
 `DESIGNER_ROLE_ID`|form.io administrator role Id|eg. 5ee090afee045f1597609cae|`must get the value from form.io resource ` **http://localhost:3001/role**
 `ANONYMOUS_ID`|form.io anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|`must get the value from form.io resource ` **http://localhost:3001/role**
 `USER_RESOURCE_ID`|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|`must get the value from form.io resource `**http://localhost:3001/user**
 `FORMIO_DEFAULT_PROJECT_URL`|The URL of the form.io server||`http://your-ip-address:3001`
 `INSIGHT_API_BASE`|Insight Api base end-point||`http://your-ip-address:7000`
 `INSIGHT_API_KEY`|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| must be set to your ReDash API key
 `WEB_API_BASE_URL`|formsflow Rest API URI||`http://your-ip-address:5000/api`
 `CAMUNDA_API_URI`|Camunda Rest API URI||`http://your-ip-address:8000/camunda`
 `KEYCLOAK_URL`| URL to your Keycloak server |eg. https://iam.aot-technologies.com | `http://your-ip-address:8080`
 `KEYCLOAK_URL_REALM`|	The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
 `KEYCLOAK_WEB_CLIENTID`|Your Keycloak Client ID within the realm| eg. forms-flow-web | `forms-flow-web`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token| | `giert989jkwrgb@DR55`

### Running the application
   * Run `docker-compose up --build -d` to start.

#### To stop the application
   * Run `docker-compose down` to stop.

### Health Check

   The application should be up and available for use at port defaulted to 3000 in  http://localhost:3000/

### How to Create Your First Form
  * Login to **http://localhost:3000/** using valid **designer** credentials 
  * Navigate to menu **Forms**
  * Click the button **+ Create Form** to launch the form designer studio.
  * Design the form using **Drag and Drop** of components from LHS to RHS and publish by clicking the button **Create Form**.

To know more about form.io, go to https://help.form.io/userguide/introduction/.


