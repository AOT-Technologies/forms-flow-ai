# **forms-flow-web**

## Table of contents
* [Prerequisites](#prerequisites)
* [Project setup](#project-setup)
    * [Step 1 : Environment Configuration](#environment-configuration)
    * [Step 2 : Keycloak Configuration](#keycloak-configuration)
    * [Step 3 : Buid and Deploy](#Buid-and-Deploy)
    

## Prerequisites

- based on React version >= 16.3 and `create-react-app`
## Project setup

### Environment Configuration


NOTE: There are two methods for running this application. Using docker container or run locally using npm 

    Using docker
-   Modify docker-compose.yml in the root folder with relevant data

    Using npm
-   Create a .env file in root folder with sample.env data
-   Change .env data with relevant data

- To get Form-IO authorization IDs use the follwing steps 

1. Get token
- request POST http://localhost:3001/user/login
{
"data": {
"email": {{email}},
"password": {{password}}
}
}

--Use the token in the result header for the following steps

2. Get authorization roles
- request GET Form-IO-API-URL/role
    x-jwt-token:{{token}}

- To get Form-IO User Form_ID

1. Get User Form_ID
- request GET Form-IO-API-URL/user
   use Form_ID = "_id" from the result


### Keycloak Configuration


- Update KeyCloak Info (public/keycloak.json)

1. Login to keycloak
2. Select your realm -->Go to clients tab --> Click on your client Id --> Go to Installation tab --> Select Format option as Keycloak OIDC JSON
3. Copy the JSON data and update  public/keycloak.json


## Buid and Deploy


For docker
- docker-compose build
- docker-compose up

For direct 
- npm install
- npm start 





