# Download and Installation
In the following document, we’ll describe about the different project dependencies, and the installation options being supported.

## Table of Contents
* [Prerequisites](#prerequisites)
* [Project Dependencies](#project-dependencies)
* [Download the formsflow.ai](#download-the-formsflowai)
* [Installation](#installation)
* [Verifying the Installation Status](#verifying-the-installation-status)

 The framework installs the products mentioned above (except for Keycloak which must either be pre-existing or installed and configured in advance).

The products are installed with a default configuration so that the base system works "out-the-box", however, the advanced configuration and management of the products require the relevant product documentation. 

#### Prerequisites

* Admin access to a local or remote server (can be local PC or Mac provided it is 64-bit with at least 16GB RAM and 100GB HDD) where [docker-compose](https://docker.com) and [docker](https://docker.com) are installed and configured. 
* Admin access to a [Keycloak](https://www.keycloak.org/) server  (ability to create realms, users etc.)


## Project Dependencies
- [form.io](https://www.form.io/opensource) (included under ../.forms-flow-forms)
- [Camunda](https://camunda.com/) (included under ../.forms-flow-bpm)
- [Redash](https://redash.io) (included under ../.forms-flow-analytics)
- [Keycloak](https://www.keycloak.org/) (existing Keycloak server required)
- [Python](https://www.python.org/) (included under ../.forms-flow-api)
- *Optional*: [Nginx](https://www.nginx.com) (included under ./deployment/nginx) 

## Download the formsflow.ai

* Clone this github repo:  https://github.com/AOT-Technologies/forms-flow-ai
* If deploying to a remote server, you can use nginx as a reverse proxy and SSL engine. To help you, follow the instructions in the nginx [README](./nginx/README.md)

## Installation
This section describes how to install different components individually and full deployment of formsflow.ai

Docker
------------------
#### Choose from the following components listed below.
 * [forms-flow-analytics](../forms-flow-forms) Redash analytics components
 * [forms-flow-bpm](../forms-flow-bpm) Camunda Workflow deployment and integration
 * [forms-flow-api](../forms-flow-api) REST API of formsflow.ai
 * [forms-flow-web](../forms-flow-web) formsflow.ai integration web UI

 #### Full Deployment
 Follow the instructions on [docker installation guide](./docker)
 
## Verifying the Installation status
* The following applications will be started and can be accessed in your browser.
   * http://localhost:7000 - Redash analytics
   * http://localhost:8000/camunda - Camunda BPM
   * http://localhost:5000 - REST API of formsflow.ai
   * http://localhost:3000 - formsflow.ai UI (+ forms designer) 
                  
