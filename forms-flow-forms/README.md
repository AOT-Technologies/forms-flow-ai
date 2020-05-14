
# **forms-flow-io**

A combined form and API platform for Serverless applications
============================================================
Form.io is a revolutionary combined Form and API platform for Serverless applications. This repository serves as the core Form and API engine for https://form.io. This system allows you to build "serverless" data management applications using a simple drag-and-drop form builder interface. These forms can then easily be embedded within your Angular.js and React applications using the
```<formio>``` HTML element.

## Table of contents
* [Buid and Deploy](#Buid-and-Deploy)
    * [Export-Import JSON](#Export-Import-JSON)

## Buid and Deploy

NOTE: There are two methods for running this application. Using docker container or run locally           using npm       

Using docker
- docker-compose build
- docker-compose up

Using npm 
- npm install
- npm start 

### Export-Import JSON
 
 To get formio default resources  need to import sample.json from root path as follows

1. Get token

- request POST http://localhost:3001/user/login
{
    "data": {
        "email": {{email}},
        "password": {{password}}
    }
}

--Use the token in the result header for the following steps

2. Import
- request POST Form-IO-API-URL/import

"template":{{sample.json}}

NOTE: The JSON will have information about users with associated roles and forms. 

- To export newly created forms and resources  (not mandatory)

1. Get token

- request POST http://localhost:3001/user/login
{
    "data": {
        "email": {{email}},
        "password": {{password}}
    }
}
2. Export
-request GET http://localhost:3001/export
x-jwt-token:{{token}}

--Use the exported JSON for import


