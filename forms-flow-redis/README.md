# formsflow.ai Redis

This repository contains a Docker Compose configuration to set up a lightweight Redis service using the official Redis Alpine image.


## Table of Content

1. [Prerequisites](#prerequisites)
2. [Running the Application](#running-the-application)

## Prerequisites

* For docker based installation [Docker](https://docker.com) need to be installed.

### Running the Application

* forms-flow-redis service uses port 6379, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-redis`

* Run `docker-compose up -d` to start.

#### To Stop the Application

* Run `docker-compose stop` to stop.

### Important Note

The forms-flow-redis service must be up and running before installing and starting the following services:

- forms-flow-api
- forms-flow-documents-api

Ensure that Redis is functional and accessible on port 6379 before proceeding with the installation of these dependent services. Failure to start forms-flow-redis first may result in errors during the initialization or runtime of the dependent applications.