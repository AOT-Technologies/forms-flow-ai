# Download and Installation
In the following document, we’ll describe about the different project dependencies, and the installation options being supported.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Dependencies](#project-dependencies)
3. [Download the formsflow.ai](#download-the-formsflowai)
4. [Installation](#installation)
  4.1. [Docker](#docker)
  4.2. [Openshift](#openshift)
5. [Verifying the Installation Status](#verifying-the-installation-status)


## 1. Prerequisites

* Admin access to a local or remote server (can be local PC or Mac provided it is 64-bit with at least 16GB RAM and 100GB HDD) where [docker-compose](https://docker.com) and [docker](https://docker.com) are installed and configured. 
* Admin access to a [Keycloak](https://www.keycloak.org/) server. For local development / testing follow [Keycloak installtion](../forms-flow-idm/keycloak).


## 2. Project Dependencies

- [Keycloak](https://www.keycloak.org/) (included under ../.forms-flow-idm/keycloak)
- [form.io](https://www.form.io/opensource) (included under ../.forms-flow-forms)
- [Camunda](https://camunda.com/) (included under ../.forms-flow-bpm)
- [Redash](https://redash.io) (included under ../.forms-flow-analytics)
- [Python](https://www.python.org/) (included under ../.forms-flow-api)
- *Optional*: [Nginx](https://www.nginx.com) (included under ./deployment/nginx) 

## 3. Download the formsflow.ai

* Clone this github repo:  https://github.com/AOT-Technologies/forms-flow-ai
* If deploying to a remote server, you can use nginx as a reverse proxy and SSL engine. To help you, follow the instructions in the nginx [README](./nginx/README.md)

## 4. Installation

This section describes how to install different components individually and full deployment of formsflow.ai

### 4.1 Docker
------------------
#### Full Deployment

 Follow the instructions on [docker installation guide](./docker)
 
#### Individual Service Deployment

Choose from the following components listed below.
 * [Keycloak](../forms-flow-idm/keycloak) Identity keycloak components
 * [forms-flow-analytics](../forms-flow-forms) Redash analytics components
 * [forms-flow-bpm](../forms-flow-bpm) Camunda Workflow deployment and integration
 * [forms-flow-api](../forms-flow-api) REST API of formsflow.ai
 * [forms-flow-web](../forms-flow-web) formsflow.ai integration web UI
 
### 4.2 Openshift
------------------
#### Full Deployment
 Follow the instructions on [openshift installation guide](./openshift)
 
## 5. Verifying the Installation status
* The following applications will be started and can be accessed in your browser.
   * http://localhost:7000 - Redash analytics
   * http://localhost:8000/camunda - Camunda BPM
   * http://localhost:5000 - REST API of formsflow.ai
   * http://localhost:3000 - formsflow.ai UI (+ forms designer) 
                  
