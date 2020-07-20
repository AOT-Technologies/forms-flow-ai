# **forms-flow-web**

**FormsFlow.AI** delivers progressive web application with React version >= 16.3 and `create-react-app`

A React library for rendering out forms based on the Form.io platform.

## Table of contents
* [Prerequisites](#prerequisites)
* [Project Setup](#project-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Environment Configuration](#environment-configuration)
  * [Step 3 : Running the Application](#running-the-application)
  * [Step 4 : Verify the application status](#verify-the-application-status)
  * [Step 5 : Configuration of Keycloak SAML Setup](#configuration-of-keycloak-saml-setup)

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available.
There needs to be a [Keycloak](https://www.keycloak.org/) server available and you need admin privileges (to create realms, users etc. in Keycloak).

## Project setup

### Keycloak Setup

TO DO

### Environment Configuration

Environment variables are set in **.env** and read by system.

 Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `NODE_ENV`| Define project level configuration | `development, test, production` | `development`
 `CLIENT_ROLE`|	The role name used for client users|| formsflow-client
 `CLIENT_ROLE_ID`|form.io client role Id|eg. 10121d8f7fadb18402a4c|must get the value from form.io resource **/roles**
 `REVIEWER_ROLE`|The role name used for staff/reviewer users||`formsflow-reviewer`
 `REVIEWER_ROLE_ID`|form.io reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|must get the value from form.io resource **/roles**
 `DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
 `DESIGNER_ROLE_ID`|form.io administrator role Id|eg. 5ee090afee045f1597609cae|must get the value from form.io resource **/roles**
 `ANONYMOUS_ID`|form.io anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|must get the value from form.io resource **/roles**
 `USER_RESOURCE_ID`|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|must get the value from form.io resource **/user**
 `FORMIO_DEFAULT_PROJECT_URL`|The URL of the form.io server||`http://localhost:3001`
 `REACT_APP_INSIGHT_API_BASE`|Insight Api base end-point||`http://localhost:7000`
 `REACT_APP_INSIGHTS_API_KEY`|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| must be set to your ReDash API key
 `REACT_APP_WEB_BASE_URL`|FormsFlow Rest API URI||`http://localhost:5000/api`
 `EMAIL_NOTIFICATION_GROUP`|Group to to which to send Email notifications|Must match keycloak group|`formsflow-reviewer`

#### Keycloak Configuration

- Update KeyCloak Info (public/config/kc/keycloak.json)

  - Login to keycloak
  - Select your realm -->Go to clients tab --> Click on your client Id --> Go to Installation tab --> Select Format option as Keycloak OIDC JSON
  - Copy the JSON data and update  public/config/kc/keycloak.json
