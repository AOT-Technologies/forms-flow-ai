# **forms-flow-web**

## Table of contents
* [Prerequisites](#prerequisites)
* [Project setup](#project-setup)
    * [Step 1 : Environment Configuration](#environment-configuration)
    * [Step 2 : Keycloak Configuration](#keycloak-configuration)
    * [Step 3 : Build and Deploy](#build-and-deploy)
    

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
  - Get token
    - request POST http://localhost:3001/user/login
    {
    "data": {
    "email": {{email}},
    "password": {{password}}
    }
    }
    - Use the token from x-jwt-token header in the result header for the following steps

  - Get authorization role IDS
    - request GET Form-IO-API-URL/role
        x-jwt-token:{{token}}
    - Update appropriate role env values: REACT_APP_CLIENT_ID(client role _id),REACT_APP_STAFF_REVIEWER_ID(reviewer role    _id),REACT_APP_STAFF_DESIGNER_ID(Administrator role _id)

- To get Form-IO User Form_ID for env variable REACT_APP_USER_RESOURCE_FORM_ID
  - Get User Form_ID
    - request GET Form-IO-API-URL/user
      use Form_ID = "_id" from the result


### Keycloak Configuration

- Update KeyCloak Info (public/config/kc/keycloak.json)

  - Login to keycloak
  - Select your realm -->Go to clients tab --> Click on your client Id --> Go to Installation tab --> Select Format option as Keycloak OIDC JSON
  - Copy the JSON data and update  public/config/kc/keycloak.json


## Build and Deploy

For docker
- docker-compose build
- docker-compose up

For direct 
- npm install
- npm start 
