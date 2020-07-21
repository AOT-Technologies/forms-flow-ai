# Keycloak Configuration
**FormsFlow.AI** framework can be hooked up with any OpenID Connect compliant Identity Management Server. A typical security model referenced in the current solution is illustrated below assuming *Keycloak* as the identity and access management server.

Use Case Considered
---------
A staff user with form designer role is able to create and publish form.io based forms. When an authenricated end user (client) submits a form, staff users with reviewer role can approve or reject the submission

Keycloak Setup
----------
- Create a realm with appropriate naming convention of choice, say `forms-flow-ai`

For manual setup, follow the instructions given on the [link](./keycloak-setup.md) 
