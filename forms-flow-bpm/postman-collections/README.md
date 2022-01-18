
# Postman Collection for forms-flow-bpm

Postman Collection for forms-flow-bpm API. By importing this collection you can explore our APIs.

## Table of Content
1. [Prerequisites](#prerequisites)
2. [Usage](#usage) 
3. [Folders](#folders)
   - [Filter](#filter)
   - [Process](#process)
   - [Permission](#permission)
   - [Task](#task)
4. [Collection Variables](#collection-variables)

## Prerequisites

* [Postman](https://www.getpostman.com/) need to be installed.
* *Client Secret* :  Set the secret for your Keycloak Client.

## Usage

To get started with the collections you will need to download the Postman tool from [getpostman.com/postman](https://www.getpostman.com/postman). Download the collection file and then import directly into Postman.

The collection uses Postman's pre-request script feature. It makes a POST request to Keycloak Token Endpoint to get a valid token and automatically set the token for all requests in Postman collection.
* Open forms-flow-bpm API collection and move to the `Pre-request Script tab ` in Postman. Update the `client_secret` and Save.
  Variable name | Meaning | Possible values | Default value |
  --- | --- | --- | ---
  `client_secret` |The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`must be set to your Keycloak client secret` 
 
* **NOTE: For all API requests: In the `Authorization tab` select Type - `Inherit auth from parent`.**

## Folders

The collection is arranged in folders according to the API endpoints.

### Filter
Forms-flow-bpm Filter API helps you to create lists of tasks, sorted by specified criteria. Also, it helps you to view the list of filters and delete the filter by id. Check Example for sample request and response.

### Process

Forms-flow-bpm Process API helps you to deploy and start a process Instance. Check Example for sample request and response.
* For deployment - ` name ` and `file path` should be given in the request body.
* For start process - `process variables` and `business key` may be supplied in the request body..

### Permission

Forms-flow-bpm Permission API helps you to interact with a certain resource. This makes it possible to configure permission for `authorization`  `filter`  `deployment`. The basic permissions available in the engine are: `None` `All` `Read` `Update`  `Create`  `Delete`  `Access`. Check Example for sample request and response.

### Task

Forms-flow-bpm Task API helps you to  `create`  `list`  `claim`  `unclaim` the tasks. Check Example for sample request and response.

## Collection Variables

A collection-scope variable `baseUrl` points to the port defaulted to 8000 in http://localhost:8000/camunda.

|Variable  |Default value               |Set in         |Example|
|----------|----------------------------|---------------|-----------------|
|`access_token` |           -               |Collection    |   -   |
|`baseUrl`|`http://localhost:8000/camunda` |Collection     |`http://localhost:8000/camunda`|









