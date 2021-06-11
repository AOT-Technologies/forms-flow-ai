# formsflow.ai Web Application

![React](https://img.shields.io/badge/React-17.0.2-blue)

**formsflow.ai** delivers progressive web application with React version `17.0.2` and `create-react-app`. Also currently uses  [form.io](https://github.com/formio/formio) version `2.0.0--rc.34`.

A React library for rendering out forms based on the form.io platform.

Also **formsflow.ai** provides a Vue.js based web user interface for easy integration of **formsflow.ai with your existing UI based on Vue**. To know more details checkout
[formsflow-ai-extension repository](https://github.com/AOT-Technologies/forms-flow-ai-extensions/tree/master/camunda-formio-tasklist-vue), which can be easily intergrated
with your project by installing our [npm package](https://www.npmjs.com/package/camunda-formio-tasklist-vue).

## Table of Content
1. [Prerequisites](#prerequisites)
2. [Solution Setup](#solution-setup)
   - [Step 1 : Keycloak Setup](#keycloak-setup)
   - [Step 2 : Installation](#installation)
   - [Step 3 : Running the Application](#running-the-application)
   - [Step 4 : Health Check](#health-check)
3. [How to Create Your First Form](#how-to-create-your-first-form)
4. [Logo change](#logo-change)

## Prerequisites

* For docker based installation [Docker](https://docker.com) need to be installed.
* Admin access to a [Keycloak](https://www.keycloak.org/) server. For local development / testing follow [Keycloak installation](../forms-flow-idm/keycloak).
* Please make sure the [Formio server](../forms-flow-forms/) is up and running.

## Solution Setup

### Keycloak Setup

***Skip this step if you are already having a setup ready.***

* Detailed instructions on setting up Keycloak for **formsflow.ai web application**
is mentioned on the [link](../forms-flow-idm/keycloak/README.md#create-forms-flow-web-client).

### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-ai/forms-flow-web".
   * *Skip this if forms-flow-analytics setup is completed* - Start the **analytics server** by following the instructions given on  [readme](../forms-flow-analytics/README.md)
   * Rename the file [sample.env](./sample.env) to **.env**.
   * Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
   * **NOTE : {your-ip-address} given inside the .env file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file
   
 Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `NODE_ENV`| Define project level configuration | `development, test, production` | `development`
 `FORMIO_DEFAULT_PROJECT_URL`:triangular_flag_on_post:|The URL of the form.io server||`http://{your-ip-address}:3001`
 `INSIGHT_API_URL`:triangular_flag_on_post:|Insight Api base end-point||`http://{your-ip-address}:7000`
 `INSIGHT_API_KEY`:triangular_flag_on_post:|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw|`Get the api key from forms-flow-analytics (REDASH) by following the 'Get the Redash API Key' steps from `[here](../forms-flow-analytics/README.md#get-the-redash-api-key)
 `FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow Rest API URL||`http://{your-ip-address}:5000/api`
 `CAMUNDA_API_URL`:triangular_flag_on_post:|Camunda Rest API URL||`http://{your-ip-address}:8000/camunda`
 `KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
 `KEYCLOAK_URL_REALM`|	The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
 `KEYCLOAK_WEB_CLIENTID`|Your Keycloak Client ID within the realm| eg. forms-flow-web | `forms-flow-web`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token| | `giert989jkwrgb@DR55`
 `APPLICATION_NAME`|Application name is used to provide clients application name|

* [STEP 1](): Getting **ROLE_ID** and **RESOURCE_ID** are mandatory for role based access. To generate ID go to ["Formsflow-forms user/role API"](../forms-flow-forms/README.md#formsflow-forms-api-requesting) and follow the steps.
* [STEP 2](): Modify the environment variables using the values from step 1.

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CLIENT_ROLE`|	The role name used for client users|| `formsflow-client`
`CLIENT_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms client role Id|eg. 10121d8f7fadb18402a4c|`must get the client role Id value from Prerequisites step 1 above.`)
`REVIEWER_ROLE`|The role name used for reviewer users||`formsflow-reviewer`
`REVIEWER_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|`must get the reviewer role Id value from Prerequisites step 1 above..`
`DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
`DESIGNER_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms administrator role Id|eg. 5ee090afee045f1597609cae|`must get the administrator role Id value from Prerequisites step 1 above..`
`ANONYMOUS_ID`|forms-flow-forms anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|`must get the anonymous role Id value from Prerequisites step 1 above..`
`USER_RESOURCE_ID`:triangular_flag_on_post:|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|`must get the value from the step 1 above..`


### Running the application

   * forms-flow-web service uses port 5000, make sure the port is available.
   * `cd {Your Directory}/forms-flow-ai/forms-flow-web`
   * Run `docker-compose up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose up --build -d`*

#### To stop the application
   * Run `docker-compose stop` to stop.

### Health Check

   * The application should be up and available for use at port defaulted to 3000 in  http://localhost:3000/
   * Default user credentials are provided [here](../forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).

### How to Create Your First Form
  * Login to **http://localhost:3000/** using valid [designer](../forms-flow-idm/keycloak/README.md#default-user-credentials) credentials 
  * Navigate to menu **Forms**
  * Click the button **+ Create Form** to launch the form designer studio.
  * Design the form using **Drag and Drop** of components from LHS to RHS and publish by clicking the button **Create Form**.
  
### Logo change
  * Default Logo can be changed to the users logo by replacing the logo.svg in public folder of forms-flow-web.
     The default width and height of the logo is 50 and 55 also the image format is svg
  * The icon can also be replaced to the users icon by replacing the favicon in the public folder of forms-flow-web
