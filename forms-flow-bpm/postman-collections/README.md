# Pre-request script for authentication with Keycloak

This is a javascript-Script for use with [Postman](https://www.getpostman.com/)'s pre-request script feature.
It makes POST request to [Keycloak Token Endpoint](http://localhost:8080/auth/realms/forms-flow-ai/protocol/openid-connect/token) to
get a valid token and automatically set the token for all requests in Postman collection.

## Instructions

* Now head on to Postman. Open forms-flow-bpm API collection and move to "Pre-request Script" tab in Postman. Remember you already copied the ClientSecret. Update the same in "Pre-request Script" tab.

  Variable name | Meaning | Possible values | Default value |
  --- | --- | --- | ---
  `client_id `|Your Keycloak Client ID within the realm| eg. forms-flow-bpm | `forms-flow-bpm`
  `client_secret` |The secret for your Keycloak Client Id|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|`must be set to your Keycloak client secret` go to [link](../forms-flow-idm/keycloak/README.md#get-the-keycloak-client-secret)

* In the "Authorization" tab set the Type to Bearer Token and Token to {{access_token}}. This is the token that get send back from Keycloak via the pre-request script.

* **NOTE: For all API requests: In the "Authorization" tab select Type - Inherit auth from parent.**
