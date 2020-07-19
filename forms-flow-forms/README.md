# Form Management Platform
**FormsFlow.AI** leverages FORMIO to build "serverless" data management applications using a simple drag-and-drop form builder interface.

To know more about FORMIO, go to https://github.com/formio/formio.

## Table of contents
* [Prerequisites](#prerequisites)
* [Project Setup](#project-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : Running the Application](#running-the-application)
       * Using Docker
       * Using npm
  * [Step 4 : Verify the application status](#verify-the-application-status)
  * [Step 5 : Import of predefined roles and Forms](#import-of-predefined-roles-and-forms)   
* [How-to export roles and Forms](#how-to-export-roles-and-forms)   

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 

## Project Setup

### Keycloak Setup

Not applicable.  
**Please note that the FORMIO server is accessed using root user account.**

### Environment Configuration

Environment variables are set in **.env** and read by FORMIO.

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMIO_MONGO_USERNAME`|Mongo Root Username. Used on installation to create the database.Choose your own|Can be blank|`redis://redis:6379/0`
`FORMIO_MONGO_PASSWORD`|Mongo Root Password|ditto|`postgresql://postgres@postgres/postgres`
`FORMIO_MONGO_DATABASE`|Mongo Database  Name. Used on installation to create the database.Choose your own||`formio`
`FORMIO_ROOT_EMAIL`|formio admin login|eg. admin@example.com|`must be set to whatever email address you want formio to have as admin user`
`FORMIO_ROOT_PASSWORD`|formio admin password|eg.CHANGEME|`must be set to whatever password you want for your formio admin user`


### Running the Application

#### Using Docker
   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-forms".
   * Rename the file **sample.env** to **.env**.
   * Modify the configuration values as needed. For example, you may want to change these:
     
         The value of ROOT user account details (especially if this instance is not just for testing purposes)
   * Run `docker-compose build` to build.
   * Run `docker-compose up -d` to start.
  
#### Using npm
   * Run `npm install` to install dependencies and build
   * Run `npm start` to start.
### Verify the application status

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

