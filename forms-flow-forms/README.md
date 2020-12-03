# Form Management Platform

![Formio](https://img.shields.io/badge/formio-2.0.0--rc.34-blue)

**formsflow.ai** leverages form.io to build "serverless" data management applications using a simple drag-and-drop form builder interface.

To know more about form.io, go to https://github.com/formio/formio.

## Table of Content

* [Prerequisites](#prerequisites)
* [Solution Setup](#solution-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Installation](#installation)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Health Check](#health-check)
  * [Step 5 : Import of predefined roles and Forms](#import-of-predefined-roles-and-forms)   
* [How-to export roles and Forms](#how-to-export-roles-and-forms)
* [Custom components](#custom-components)   

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Solution Setup

### Keycloak Setup

Not applicable.  
**Please note that the form.io server is accessed using root user account.**

### Installation

* Make sure you have a Docker machine up and running.
* Make sure your current working directory is "forms-flow-forms".
* Rename the file **sample.env** to **.env**.
* Modify the configuration values as needed. Details below,
 
|Variable name | Meaning | Possible values | Default value |
|--- | --- | --- | ---
|`FORMIO_MONGO_USERNAME`|Mongo Root Username. Used on installation to create the database.Choose your own||`admin`
|`FORMIO_MONGO_PASSWORD`|Mongo Root Password||`changeme`
|`FORMIO_MONGO_DATABASE`|Mongo Database  Name. Used on installation to create the database.Choose your own||`formio`
|`FORMIO_ROOT_EMAIL`|form.io admin login|eg. admin@example.com|`must be set to whatever email address you want form.io to have as admin user`
|`FORMIO_ROOT_PASSWORD`|form.io admin password|eg.CHANGEME|`must be set to whatever password you want for your form.io admin user`

**Additionally, you may want to change these**
* The value of Mongo database details (especially if this instance is not just for testing purposes)
* The value of ROOT user account details (especially if this instance is not just for testing purposes)
  
### Running the application

* For Linux,
   * Run `docker-compose -f docker-compose-linux.yml build` to build.
   * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
   * Run `docker-compose -f docker-compose-windows.yml build` to build.
   * Run `docker-compose -f docker-compose-windows.yml up -d` to start.
   
#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml down` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml down` to stop.

### Health Check

   The application should be up and available for use at port defaulted to 3001 in docker-compose.yml (i.e. http://localhost:3001/)
    and login using valid root credentials setup in .env
    
    FORMIO_ROOT_EMAIL: admin@example.com
    FORMIO_ROOT_PASSWORD: CHANGEME
    
### Import of Predefined Roles and Forms
    
   * Get the jwt token using resource **/user/login**
```
POST http://localhost:3001/user/login
{
    "data": {
        "email": {{email}},
        "password": {{password}}
    }
}
```   
   * Import roles and forms using resource **/import** with the content provided in file sample.json.
``` 
POST http://localhost:3001/import

"template":{{sample.json}}

Headers:
Content-Type : application/json
x-jwt-token: {x-jwt-token}
``` 


### How to Export Roles and Forms

   * Get the jwt token using resource **/user/login**
```
POST http://localhost:3001/user/login
{
    "data": {
        "email": {{email}},
        "password": {{password}}
    }
}
```   
   * Export roles and forms using resource **/export**.
``` 
GET http://localhost:3001/export

Headers:
Content-Type : application/json
x-jwt-token: {x-jwt-token}
``` 

## Custom Components

**formsflow.ai** has custom components supported which are created by extending the
base components within Form.io and then registering them within the core renderer.

Custom componets available in **formsflow.ai** are:

|Component Name | About | How to use |
|--- | --- | --- |
|**Text Area with Analytics** | To enable Text fields for sentiment analysis processing | [link](./custom-components/text-area-with-analytics/README.md)|


If you are interested in adding custom components for your use case in **formsflow.ai** we highly
recommend you to take a look at [Custom Component Docs](https://formio.github.io/formio.js/app/examples/customcomponent.html)
to understand how  Form.io renderer allows for the creation of Custom components.
You can also take a look at [formio.contrib](https://github.com/formio/contrib)
to look for examples and even contribute the custom components you create.

## LICENSE

We have build formsflow.ai form management platform leveraging [formio](https://github.com/formio/formio).
We use the OSL-v3 license similar to formio to ensure appropriate attribution is
provided to form.io. Please read the [license](./LICENSE.txt) for more information.
