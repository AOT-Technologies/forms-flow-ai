# formsflow.ai Web Application

![React](https://img.shields.io/badge/React-17.0.2-blue)
![webpack](https://img.shields.io/badge/webpack-5.76.0-blue)


**formsflow.ai** delivers progressive web application with React version `17.0.2` and webpack version `5.76.0`. Also currently uses  [form.io](https://github.com/formio/formio) version `2.4.1`.

A React library for rendering out forms based on the form.io platform.

The formsflow.ai micro-front ends are built with [create-single-spa](https://single-spa.js.org/docs/create-single-spa), 
which can be used to create new front-end modules and migrate existing projects. All front-end modules require a root config to work. 
The root config is responsible for orchestrating the modules, routing, and distributing the configurations.


## Table of Content
- [formsflow.ai Web Application](#formsflowai-web-application)
  - [Table of Content](#table-of-content)
  - [Prerequisites](#prerequisites)
  - [Solution Setup](#solution-setup)
    - [Keycloak Setup](#keycloak-setup)
    - [Installation](#installation)
    - [Running the application](#running-the-application)
      - [To stop the application](#to-stop-the-application)
    - [Health Check](#health-check)
    - [How to Create Your First Form](#how-to-create-your-first-form)
    - [Logo change](#logo-change)
- [Integrate micro front-end modules into host applications](#integrate-micro-front-end-modules-into-host-applications)
    - [Integrate new modules into formsflow.ai](#integrate-new-modules-into-formsflowai)
    - [Additional reference](#additional-reference)

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
   * Make sure your current working directory is "forms-flow-ai/forms-flow-web-root-config".
   * *Skip this if forms-flow-analytics setup is completed* - Start the **analytics server** by following the instructions given on  [readme](../forms-flow-analytics/README.md)
   * Rename the file [sample.env](./sample.env) to **.env**.
   * Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,
   * **NOTE : {your-ip-address} given inside the .env file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file

 Variable name | Meaning | Possible values | Default value |
 --- | --- |----------| ---
 `MF_FORMSFLOW_WEB_URL`:triangular_flag_on_post:| For running locally/ if have custom changes | `//forms-flow-microfrontends.aot-technologies.com/forms-flow-web@v5.3.1/forms-flow-web.gz.js` <br> <br> For custom changes: `http://{your-ip-address}:3004/forms-flow-web.js` |  `//forms-flow-microfrontends.aot-technologies.com/forms-flow-web@v5.3.1/forms-flow-nav.gz.js`
 `MF_FORMSFLOW_NAV_UR`:triangular_flag_on_post:|For custom implementation of Navbar component, refer [here](https://github.com/AOT-Technologies/forms-flow-ai-micro-front-ends/tree/main/forms-flow-nav)|          |`//forms-flow-microfrontends.aot-technologies.com/forms-flow-nav@v5.3.1/forms-flow-nav.gz.js`
 `MF_FORMSFLOW_SERVICE_URL`:triangular_flag_on_post:|For custom implementation of Service component, refer [here](https://github.com/AOT-Technologies/forms-flow-ai-micro-front-ends/tree/main/forms-flow-service)|          |`//forms-flow-microfrontends.aot-technologies.com/forms-flow-nav@v5.3.1/forms-flow-service.gz.js`
 `MF_FORMSFLOW_ADMIN_URL`:triangular_flag_on_post:|For custom implementation of Admin component, refer [here](https://github.com/AOT-Technologies/forms-flow-ai-micro-front-ends/tree/main/forms-flow-admin)|          |`//forms-flow-microfrontends.aot-technologies.com/forms-flow-nav@v5.3.1/forms-flow-admin.gz.js`
 `MF_FORMSFLOW_THEME_URL`:triangular_flag_on_post:| For custom implementation of Theme component, refer [here](https://github.com/AOT-Technologies/forms-flow-ai-micro-front-ends/tree/main/forms-flow-theme) |          | `//forms-flow-microfrontends.aot-technologies.com/forms-flow-nav@v5.3.1/forms-flow-theme.gz.js`
 `NODE_ENV`| Define project level configuration | `development, test, production` | `production`
 `FORMIO_DEFAULT_PROJECT_URL`:triangular_flag_on_post:|The URL of the form.io server|          |`http://{your-ip-address}:3001`
 `KEYCLOAK_WEB_CLIENTID`|Your Keycloak Client ID within the realm| eg. forms-flow-web | `forms-flow-web`
 `KEYCLOAK_URL_REALM`|	The Keycloak realm to use| eg. forms-flow-ai | `forms-flow-ai`
 `KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server |          | `http://{your-ip-address}:8080`
 `FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow Rest API URL|          |`http://{your-ip-address}:5000/api`
 `BPM_API_URL`:triangular_flag_on_post:|Camunda Rest API URL|          |`http://{your-ip-address}:8000/camunda`
 `WEBSOCKET_ENCRYPT_KEY`|Camunda task event streaming. AES encryption of token|          | `giert989jkwrgb@DR55`
 `APPLICATION_NAME`|Application name is used to provide clients application name|
 `DOCUMENT_SERVICE_URL`|Formsflow document service api url|          |`http://{your-ip-address}:5006`
 `EXPORT_PDF_ENABLED`|Manage export to pdf feature| true/false
 `PUBLIC_WORKFLOW_ENABLED`|Enable creating workflow for all tenants
 `DRAFT_POLLING_RATE`|Control draft timing|          |1500
 `DRAFT_ENABLED`|Enable draft feature| true/false
 `DRAFT_POLLING_RATE`|Control draft timing|          |15000
 `DRAFT_ENABLED`|Enable draft feature| true/false
 `CUSTOM_SUBMISSION_ENABLED`|Custom Submission Enable for support form adapter|     | false
 `CUSTOM_SUBMISSION_URL`|Custom Submission Enable for support form adapter| URL of custom submission    | 
 `ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK`|To Enable Role level permission check for enabling Application|  true/false   | false
  `CUSTOM_THEME_URL`|For providing theming configuration in a url|  URL of custom theme that returns json format   
  `MULTI_TENANCY_ENABLED`|Multi tenancy enabled flag for the environment| true/false | false   |
  `KEYCLOAK_ENABLE_CLIENT_AUTH`|Client auth mechanism|          |`false`
  `MT_ADMIN_BASE_URL`|Multitenancy admin url|          |`http://{your-ip-address}:5010/api`
  `MT_ADMIN_BASE_URL_VERSION`|Version of multitenancy admin| v1
 `ENABLE_FORMS_MODULE`|To enable/disable forms module in forms-flow-web| true/false | true
  `ENABLE_TASKS_MODULE`|To enable/disable tasks module in forms-flow-web| true/false | true
  `ENABLE_DASHBOARDS_MODULE`|To enable/disable dashboards module in forms-flow-web| true/false | true
  `ENABLE_PROCESSES_MODULE`|To enable/disable processes module in forms-flow-web| true/false | true
  `ENABLE_APPLICATIONS_MODULE`|To enable/disable applications module in forms-flow-web| true/false | true

 







* NOTE - While configuring ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK the accessAllowApplications will hide / show application tab. To enable this feature you need to add access-allow-applications with the user group in keycloak.



### Running the application

   * forms-flow-webapi service uses port 5000, make sure the port is available.
   * `cd {Your Directory}/forms-flow-ai/forms-flow-web-root-config`
   * Run `docker-compose up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose up --build -d`*

#### To stop the application
   * Run `docker-compose stop` to stop.

### Health Check

   * The application should be up and available for use at port defaulted to 3004 in  http://localhost:3000/
   * Default user credentials are provided [here](../forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).

### How to Create Your First Form
  * Users can create their own form, check [here](https://aot-technologies.github.io/forms-flow-ai-doc/#examples) for more details.

### Logo change
  * Default Logo can be changed to the users logo by replacing the logo.svg in public folder of forms-flow-web-root-config.
     The default width and height of the logo is 50 and 55 also the image format is svg
  * The icon can also be replaced to the users icon by replacing the favicon in the public folder of forms-flow-web

# Integrate micro front-end modules into host applications

Please follow the appropriate case for the integration.

Case 1: Creating a brand new application where formsflow.ai modules are to be integrated.

We recommend using the micro-front-end architecture for such projects since formsflow.ai modules can be registered easily. 
We recommend using single-spa and System.js import maps for the new projects. Single-spa manages micro-front-end routing and lifecycle methods such as mount and unmount. 
Import maps are used for the runtime loading of different modules.

Steps:

   1. Setup root config for the project
   Create-single-spa CLI can be used to quickly setup the root config, and also find the root config implementation for the [formsflow.ai](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web-root-config)
   
   ![image](https://user-images.githubusercontent.com/93634377/230896120-8a6ba74d-32ea-4c35-9d11-2d2add4435af.png)
   
   2. Root config should not contain any business logic, so create a new module using create-single-spa this time select the single-spa application.

   ![image](https://user-images.githubusercontent.com/93634377/230896293-40d29125-af06-49ed-b927-dcfe6792da5a.png)

  Select the appropriate options in the following prompts where it is flexible to select the framework of choice and language preferences etc.  

  This single-spa application is the same as a typical SPA and this can be an entire web app or part of the application, 
  this application would be managed by the root configuration.
  
  3. Register the newly created application into the root config.
  If you are using the single spa layout engine it is as simple as adding a new path to the layout template after updating the import map.
  
  ![image](https://user-images.githubusercontent.com/93634377/230896459-1422cf83-15b5-4975-aad0-4d9c68c37014.png)
  
  ![image](https://user-images.githubusercontent.com/93634377/230896598-a600ae60-7c77-4133-8b11-8c9581e3669d.png)

  4. Add the required formsflow.ai module in the same way, the following modules are available from formsflow.ai 
      - formsflow-admin
      - formsflow-web
      - formsflow-nav
      - formsflow-service
      - formsflow-theme
   
  5. Please make sure to include the service module when including any of the modules.


Case 2: Integration with the existing host application.

Steps:

  1. Follow the steps in creating the root config.
  2. Migrate the existing application into a micro-front-end application.
  create-single-spa CLI can be used to create the boilerplate application and the business logic can be migrated to the new structure.
  For applications built with build tools like create-react-app, the recommended approach would be to use tools like the [CRACO](https://github.com/AOT-Technologies/craco-plugin-single-spa-application) plugin 
  to apply configuration overrides. Find the [link](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web) to the reference.

  3. Continue Step 4 from Case 1. 
  
  Summary:
  
  Integrating formsflow.ai front-end modules into a host application requires the host application to have a micro front-end architecture and we already have hosted S3 artifacts to support easy integration. In order to make use of our hosted modules the host application must support the System.register module format (Already taken care of if following the above-mentioned steps).
  The development experience would be similar to that of a SPA only difference would be the root config. The root config should be running locally and the module that is under development and all other modules can be hosted instances.

  The root config will be managing all environment variables so any new variables should be added to the root config, make sure to update the config.template.js file in the public folder since the template will be used to set the variables to the window so that all modules can access the config values.

  Note: Do not expose any secrets or variables that impact security to the root config.
  
  Conceptual Diagram:
  
  ![image](https://user-images.githubusercontent.com/93634377/230897362-3ef331d4-cf89-42b2-9634-cf2fc293c9a5.png)
  
  Notes:
  
   - If someone wants the modules to be active when the path to be matched comes after a base path, make use of 
      the [base](https://single-spa.js.org/docs/layout-definition#single-spa-router) attribute.
   - If anyone intends to use our hosted modules rather than building their own please make sure the `orgName` should be 
     same across all applications. So for using hosted instances make sure `formsflow` should be the `orgName` when creating root config and modules. [Ref](https://single-spa.js.org/docs/getting-started-overview/#create-a-root-config)
   - For production, we recommend pushing the host module artifacts to object storage and serving the root config with any web server, 
     we already containerized the root config implementation of formsflow.ai. [Ref](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-web-root-config)


### Integrate new modules into formsflow.ai 

Integrating new module into formsflow is straight forward but the module should have the following prerequisites.

   - The module should be of `System.register` format.
   - The module should implement single-spa lifecycle methods. (Not applicable if built with `create-single-spa`) [Ref](https://single-spa.js.org/docs/building-applications/)
   - If the module is built with frameworks other than React then the import maps should be updated with System.register versions of the libraries.
   [Ref](https://github.com/esm-bundle)
   - Update the import maps with the new module.
   - Update the layout and specify the path to activate the module (Not applicable for utility modules).
   - We recommend using single-spa CLI to create new module. 

### Additional reference

For more details of customisation and features provided in web application, refer [here](../forms-flow-web/README.md)



