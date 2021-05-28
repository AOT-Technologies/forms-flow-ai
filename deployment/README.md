# Download and Installation
In the following document, we’ll describe about the different project dependencies, and the installation options being supported.

## Table of Contents
* [Prerequisites](#prerequisites)
* [Project Dependencies](#project-dependencies)
* [Download the formsflow.ai](#download-the-formsflowai)
* [Installation](#installation)
  * [Docker](#docker)
  * [Openshift](#openshift)
* [Verifying the Installation Status](#verifying-the-installation-status)


## Prerequisites

* Admin access to a local or remote server (can be local PC or Mac provided it is **64**-bit with at least **16GB** RAM and **100GB** HDD) 
* For docker installations [docker-compose](https://docker.com) and [Docker](https://docker.com) need to be installed.
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
#### Full Deployment

 Follow the instructions on [docker installation guide](./docker)
 
#### Individual Service Deployment

Choose from the following components listed below.
 * [Keycloak](../forms-flow-idm/keycloak) Identity keycloak components
 * [forms-flow-forms](../forms-flow-forms) formsflow.ai integration with form.io
 * [forms-flow-bpm](../forms-flow-bpm) Camunda Workflow deployment and integration
 * [forms-flow-api](../forms-flow-api) REST API of formsflow.ai
 * [forms-flow-web](../forms-flow-web) formsflow.ai integration web UI
 * [forms-flow-analytics](../forms-flow-analytics) Redash analytics components
 
### Openshift
------------------
#### Full Deployment
 Follow the instructions on [openshift installation guide](./openshift)
 
## Verifying the Installation status
* The following applications will be started and can be accessed in your browser.
   * http://your-ip-address:7000 - Redash analytics
   * http://your-ip-address:8000/camunda - Camunda BPM
   * http://your-ip-address:5000 - REST API of formsflow.ai
   * http://your-ip-address:3000 - formsflow.ai UI (+ forms designer) 
                  
