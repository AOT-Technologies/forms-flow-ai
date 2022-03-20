
# Postman Collection for forms-flow-webapi

Postman Collection for forms-flow-webapi API. By importing this collection you can explore our APIs.

## Table of Content
1. [Prerequisites](#prerequisites)
2. [Usage](#usage) 
4. [Collection Variables](#collection-variables)

## Prerequisites

* [Postman](https://www.getpostman.com/) need to be installed.
* *Client Secret* :  Set the secret for your Keycloak Client.

## Usage

To get started with the collections you will need to download the Postman tool from [getpostman.com/postman](https://www.getpostman.com/postman). Download the collection file and then import directly into Postman.

The collection uses Postman's pre-request script feature. It makes a POST request to Keycloak Token Endpoint to get a valid token and automatically set the token for all requests in Postman collection.
* Open formsflow.ai API collection and move to the `Pre-request Script tab ` in Postman. Update the `client_secret` and Save.
  Variable name | Meaning | Possible values | Default value |
  --- | --- | --- | ---
  `client_secret` |The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`must be set to your Keycloak client secret` 
 
* **NOTE: For all API requests: In the `Authorization tab` select Type - `Inherit auth from parent`.**

## Collection Variables

A collection-scope variable `baseUrl` points to the port defaulted to 8000 in http://localhost:5000.

|Variable  |Default value               |Set in         |Example|
|----------|----------------------------|---------------|-----------------|
|`access_token` |           -               |Collection    |   -   |
|`baseUrl`|`http://localhost:5000` |Collection     |`http://localhost:5000`|









