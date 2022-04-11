# formsflow.ai Web Application

![React](https://img.shields.io/badge/React-17.0.2-blue)

**formsflow.ai** delivers progressive web application with React version `17.0.2` and `create-react-app`. Also currently uses  [form.io](https://github.com/formio/formio) version `2.3.0`.

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
5. [Code coverage](#code-coverage)

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
 `FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow Rest API URL||`http://{your-ip-address}:5000/api`
 `CAMUNDA_API_URL`:triangular_flag_on_post:|Camunda Rest API URL||`http://{your-ip-address}:8000/camunda`
 `KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
 `KEYCLOAK_URL_REALM`|	The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
 `KEYCLOAK_WEB_CLIENTID`|Your Keycloak Client ID within the realm| eg. forms-flow-web | `forms-flow-web`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token| | `giert989jkwrgb@DR55`
 `APPLICATION_NAME`|Application name is used to provide clients application name|
 `WEB_BASE_CUSTOM_URL`|Clients can use WEB_BASE_CUSTOM_URL env variable to provide their custom URL |
 `USER_ACCESS_PERMISSIONS`| JSON formatted permissions to enable / disable few access on user login.|| `{"accessAllowApplications":false,"accessAllowSubmissions":false}`
 |`FORMIO_JWT_SECRET`|forms-flow-forms jwt secret| |`--- change me now ---`

* NOTE - While configuring USER_ACCESS_PERMISSIONS the accessAllowApplications will hide / show application tab, the same way accessAllowSubmissions does for viewSubmission button. To enable this feature you need to add access-allow-applications, access-allow-submissions with the respective user group in keycloak.

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

### Code coverage
  * Test cases for the files are provided at forms-flow-web using [testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/) , [testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) , [msw](https://mswjs.io/) and [redux-mock-store](https://www.npmjs.com/package/redux-mock-store).
  * `cd {Your Directory}/forms-flow-ai/forms-flow-web`.
  * Test files are available at `forms-flow-ai\forms-flow-web\src\_tests_`
  * Run the command `npm run coverage` to get the total coverage and for individual files run `npm test --<test file name>`.
  * Total code coverage can obtain by opening `forms-flow-ai\forms-flow-web\coverage\lcov-report\index.html` with browser.

## forms-flow-web Events
 > This section elaborates events used in forms-flow-web.
 >  The Form.io renderer uses the [EventEmitter3](https://github.com/primus/eventemitter3) library to manage all of the event handling that occurs within the renderer.
 >  Custom events are triggered for button components and are fired when they are clicked. More details are [here](https://docs.form.io/developers/form-renderer#form-events)
## Events
| Name | Description  &nbsp;&nbsp;&nbsp;| Arguments &nbsp;&nbsp;&nbsp; | Example |
| --- | --- | --- |--- |
| `reloadTasks` | <li>Used in the task page</li><li>Triggered for button components</li><li>Refresh the Task List  and remove the selected  task from RHS.</li>  | <li> type:The configured event type </li> |form.emit('customEvent', {  type: "reloadTasks"}); |
| `reloadCurrentTask` | <li>Used in the task page</li><li>Triggered for button components</li> <li>Refreshes the current task selected</li> |<li>type:The configured event type</li>|form.emit('customEvent', { type: "reloadCurrentTask"}); |
| `customSubmitDone` | <li>Used in the create form page</li><li>Triggered for button components</li><li>Similar to submit button to implement custom logic</li> |<li>type:The configured event type</li>|form.emit('customEvent', {type: "customSubmitDone"}); |
| `actionComplete` | <li>Triggered for button components</li> |<li>type:The configured event type</li><li>component:The component json</li><li>actionType: Form submit action values</li> | form.emit('customEvent', { type: "actionComplete",    component: component, actionType: actionType }); |
| `cancelSubmission` | <li>Used in the create form page</li><li>Triggered for button components</li><li>Used for Canceling current submission and goin back to Form List Page</li> |<li>type:The configured event type</li>|form.emit('customEvent', {type: "cancelSubmission"}); |


