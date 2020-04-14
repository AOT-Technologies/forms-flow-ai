# **forms-flow-web**

## Table of contents
* [Prerequisites](#prerequisites)
    * [Environment Configuration](#environment-configuration)
    * [Keycloak Configuration](#keycloak-configuration)
* [Project setup](#project-setup)

# **forms-flow-io**

## Table of contents
* [Prerequisites](#pre-requisites)
* [Project setup](#project-setups)

## Prerequisites

- based on React version >= 16.3 and `create-react-app`

### Environment Configuration

```
- Create a .env file in root folder with sample.env data (skip this step for docker)
- Change .env data with your values (for npm)/ modify docker-compose.yml (for docker)
- To get Form-IO Role IDs

1. Login

-request POST Form-IO-API-URL/user/login
{
"data": {
"email": {{email}},
"password": {{password}}
}
}

--Use the token in the result header for the following steps

2.  Role
    -request GET Form-IO-API-URL/role
    x-jwt-token:{{token}}

- To get Form-IO Form_ID

1. FORM
   --request GET Form-IO-API-URL/form
   Form_ID = "_id" from the result
```

### Keycloak Configuration

```
-Update KeyCloak Info (public/keycloak.json)

1. Login to keycloak
2. Select your realm --> clients tab --> client Id --> Installation --> Formatoption(Keycloak OIDC JSON)
3. Copy above JSON and update  public/keycloak.json
```

## Project setup

```
npm install / docker-compose build
```

### Compiles and hot-reloads for development

```
npm start / docker-compose up
```

# **To run formio server (forms-flow-io)**

## Pre-requisites

### Export-Import JSON:

```
1. Login

-request POST Form-IO-API-URL/user/login
{
    "data": {
        "email": {{email}},
        "password": {{password}}
    }
}

--Use the token in the result header for the following steps

2. Export
-request GET Form-IO-API-URL/export
x-jwt-token:{{token}}

--Use the exported JSON for import

3. Import
-request POST Form-IO-API-URL/import

"template":{{exported JSON}}
```

## Project setups
```
npm install
```

### Compiles and hot-reloads for development

```
npm start
```


