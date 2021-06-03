# Download and Installation
In the following document, we’ll describe about the different project dependencies, and the installation options being supported.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Dependencies](#project-dependencies)
3. [Download the formsflow.ai](#download-the-formsflowai)
4. [Installation](#installation)
   * [Docker](#docker)
   * [Openshift](#openshift)
5. [Verifying the Installation Status](#verifying-the-installation-status)


## Prerequisites

* Admin access to a local or remote server (can be local PC or Mac provided it is **64**-bit with at least **16GB** RAM and **100GB** HDD) 
* For docker installation [docker-compose](https://docker.com) and [Docker](https://docker.com) need to be installed.
* Admin access to a [Keycloak](https://www.keycloak.org/) server. For local development / testing follow [Keycloak installation](../forms-flow-idm/keycloak).


## Project Dependencies

- [Keycloak](https://www.keycloak.org/) (included under ../.forms-flow-idm/keycloak)
- [form.io](https://www.form.io/opensource) (included under ../.forms-flow-forms)
- [Camunda](https://camunda.com/) (included under ../.forms-flow-bpm)
- [Redash](https://redash.io) (included under ../.forms-flow-analytics)
- [Python](https://www.python.org/) (included under ../.forms-flow-api)
- *Optional*: [Nginx](https://www.nginx.com) (included under ./deployment/nginx) 

## Download the formsflow.ai

* Clone this github repo:  https://github.com/AOT-Technologies/forms-flow-ai
* If deploying to a remote server, you can use nginx as a reverse proxy and SSL engine. To help you, follow the instructions in the nginx [README](./nginx/README.md)

## Installation

This section describes how to install different components individually and full deployment of formsflow.ai

### Docker
------------------
 * Choose any one of the deployment option.
 
#### Full Deployment:

Follow the instructions on [docker installation guide](./docker)
 
#### Individual Service Deployment:

Install the components in the listed order. *(NOTE: Keycloak, form.io and redash dependencies are used on other components)*
 * [Keycloak](../forms-flow-idm/keycloak) Identity keycloak components
 * [forms-flow-forms](../forms-flow-forms) formsflow.ai integration with form.io
 * [forms-flow-analytics](../forms-flow-analytics) Redash analytics components
 * [forms-flow-bpm](../forms-flow-bpm) Camunda Workflow deployment and integration
 * [forms-flow-api](../forms-flow-api) REST API of formsflow.ai
 * [forms-flow-web](../forms-flow-web) formsflow.ai integration web UI
 
### Openshift
------------------
#### Full Deployment
 Follow the instructions on [openshift installation guide](./openshift)
 
## Verifying the Installation status

> The following applications will be started and can be accessed in your browser.

 Srl No | Service Name | Usage | Access | Default credentials (userName / Password)|
--- | --- | --- | --- | --- 
1|`Keycloak`|Authentication|`http://localhost:8080`| `admin/changeme`
2|`forms-flow-forms`|form.io form building. This must be started earlier for resource role id's creation|`http://localhost:3001`|`admin@example.com/changeme`
3|`forms-flow-analytics`|Redash analytics server, This must be started earlier for redash key creation|`http://localhost:7000`|Use the credentials used for registration / [Default user credentials](../forms-flow-idm/keycloak/README.md#health-check)
4|`forms-flow-web`|formsflow Landing web app|`http://localhost:3000`|[Default user credentials](../forms-flow-idm/keycloak/README.md#health-check)
5|`forms-flow-api`|API services|`http://localhost:5000`|`NA`
6|`forms-flow-bpm`|Camunda integration|`http://localhost:8000/camunda`| `demo/demo` 
