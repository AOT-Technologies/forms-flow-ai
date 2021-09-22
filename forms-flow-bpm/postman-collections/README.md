
# Postman Collection for forms-flow-bpm

Postman Collection for forms-flow-bpm API. By importing this collection you can explore our APIs.

## Prerequisites

* [Postman](https://www.getpostman.com/) need to be installed.
* *Client Secret* :  Set the secret for your Keycloak Client.

## Getting Started

To get started with the collections you will need to download the Postman tool from [getpostman.com/postman](https://www.getpostman.com/postman). Download the collection file and then import directly into Postman.

### Pre-request Script

The collection uses Postman's pre-request script feature. It makes a POST request to Keycloak Token Endpoint to get a valid token and automatically set the token for all requests in Postman collection.
* Open forms-flow-bpm API collection and move to the "Pre-request Script" tab in Postman. Remember you already copied the ClientSecret. Update the same in the "Pre-request Script" tab and SAVE.

  Variable name | Meaning | Possible values | Default value |
  --- | --- | --- | ---
  `client_secret` |The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`must be set to your Keycloak client secret` 

* In the "Authorization" tab set Type to "Bearer Token" and Token to "{{access_token}}". 
* **NOTE: For all API requests: In the "Authorization" tab select Type - Inherit auth from parent.**

The collection is arranged in folders according to the API endpoints.

1. [Filter](#filter)
2. [Process](#process)
   - [Deploy Process](#deploy-process)
   - [Process Instance](#process-instance)
3. [Permission](#permission)
4. [Task](#task)

### Filter

Forms-flow-bpm Filter API helps you to create lists of tasks, sorted by specified criteria. Also, it helps you to view the list of filters and delete the filter by id. Check Example for sample request and response.

### Process

Forms-flow-bpm Process API helps you to deploy and start a process Instance.

#### Deploy Process

 It helps you to post data for a new deployment. The deployment name and file path should be given in the request body.

#### Process Instance

It helps you to start the process. Process variables and business key may be supplied in the request body. Process definition ID can be obtained from deploy process response. Check Example for sample request and response.

### Permission

Forms-flow-bpm Permission API helps you to interact with a certain resource. This makes it possible to configure permission for authorization, filter, deployment. The basic permissions available in the engine are: None, All, Read, Update, Create, Delete, Access. Check Example for sample request and response.

### Task

Forms-flow-bpm Task API helps you to view the list of all tasks. Check Example for sample request and response.

### Collection Variables

A collection-scope variable `baseUrl` points to the port defaulted to 8000 in http://localhost:8000/camunda.

|Variable  |Default value               |Set in         |Example|
|----------|----------------------------|---------------|-----------------|
|`access_token` |           -               |Collection    |   -   |
|`baseUrl`|`http://localhost:8000/camunda` |Collection     |`http://localhost:8000/camunda`|









