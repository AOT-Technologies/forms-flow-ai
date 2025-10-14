# [**formsflow.ai**](https://formsflow.ai/) Full Deployment

## Overview

[**formsflow.ai**](https://formsflow.ai/) is an open-source, low-code business process automation platform that integrates forms, workflows, and analytics. This guide provides step-by-step instructions to deploy formsflow.ai as individual components.

## Prerequisites

Ensure the following prerequisites are met before proceeding with the deployment:

- Docker installed
- Docker Compose installed

## ❌ Unsupported Docker Versions

The following Docker versions are **not supported** in this installation process due to compatibility or known issues:

- Docker 19.1.x
- Docker versions below 20.10.23

> **Note:** Please ensure you're using a stable Docker version tested with this installation.

## Clone the Repository

```bash
git clone https://github.com/AOT-Technologies/forms-flow-ai.git
cd forms-flow-ai/deployment/docker
```

### OR

## Download ZIP file:
Alternatively, you can download the ZIP file from the following link:
[Download ZIP](https://github.com/AOT-Technologies/forms-flow-ai/archive/refs/heads/master.zip)
Extract the ZIP file and navigate into the project directory:

```bash
unzip forms-flow-ai-master.zip
cd forms-flow-ai-master/deployment/docker
```

## Deploy all Components

Ensure Docker is running and execute the following commands to deploy the required components:

### Forms-flow-idm

The [**formsflow.ai**](https://formsflow.ai/) framework could be hooked up with any OpenID Connect compliant Identity Management Server. To date, we have only tested [Keycloak](https://github.com/keycloak/keycloak).

```bash
cd ../../forms-flow-idm/keycloak
docker-compose up -d
```

Wait until the service is up and running, then access it at http://localhost:8080/auth

Default username = ``admin``
Default password = ``changeme``

<img src="../../.images/image-1.png" />

### Forms-flow-analytics
[**formsflow.ai**](https://formsflow.ai/) leverages [Redash](https://github.com/getredash/redash) to build interactive
dashboards and gain insights. To create meaningful visualization for
your use case with formsflow.ai checkout [Redash Knowledge base](https://redash.io/help/).

NOTE: ``Rename sample.env to .env and  replace {your-ip-address} with your local IP address.``

```bash
cd ../../forms-flow-analytics
docker-compose run --rm server create_db
docker-compose up --build -d
```

Wait until it's up and running, then access it at http://localhost:7000

<img src="../../.images/image-7.png" />

The user is responsible for creating a new account in Redash and generating the necessary credentials for login.

### Full Deployment

Using the full deployment method, you can launch the entire formsflow.ai platform with a single command. This is ideal for testing, development, or quick evaluations. For production-grade deployments, individual component customization is recommended.

NOTE: ``Rename sample.env to .env and  replace {your-ip-address} with your local IP address.``

```bash
docker-compose up --build -d
```
This command will spin up all required services including:

forms-flow-api <br>
forms-flow-bpm <br>
forms-flow-forms (Form.io) <br>
forms-flow-documents<br>
forms-flow-redis <br>
forms-flow-web-root-config <br>

## Accessing the Application

Once all services are up, you can access the system using the following URLs:

| Component                     | URL                                |
|------------------------------|-------------------------------------|
| Keycloak (IDM)               | [http://localhost:8080/auth](http://localhost:8080/auth)       |
| Web UI                       | [http://localhost:3000](http://localhost:3000)                 |
| API                          | [http://localhost:5000](http://localhost:5000)                 |
| Forms (Form.io)              | [http://localhost:3001](http://localhost:3001)                 |
| Documents API                | [http://localhost:5006](http://localhost:5006)                 |
| Analytics (Redash)           | [http://localhost:7000](http://localhost:7000)                 |
| BPM (Camunda)                | [http://localhost:8000/camunda](http://localhost:8000/camunda) |               |

> ⚠️ **Note:** Wait a few minutes for all services to become healthy before accessing them.


## Conclusion

By following these steps, you will have successfully deployed the [**formsflow.ai**](https://formsflow.ai/) components using Docker. Ensure each service is up and running before proceeding to the next to avoid dependency issues.