# Analytics Engine

![Redash](https://img.shields.io/badge/Redash-8.0.0%2Bb(latest)-blue)

**formsflow.ai** leverages [Redash](https://github.com/getredash/redash) to build interactive
dashboards and gain insights. To create meaningful visualization for
your use case with formsflow.ai checkout [Redash Knowledge base](https://redash.io/help/).

## Table of Content
1. [Prerequisites](#prerequisites)
2. [Solution Setup](#solution-setup)
   * [Step 1 : Keycloak Setup](#keycloak-setup)
   * [Step 2 : Installation](#installation)
   * [Step 3 : Running the application](#running-the-application)
   * [Step 4 : Health Check](#health-check)
   * [Step 5 : Configuration of Keycloak SAML Setup](#configuration-of-keycloak-saml-setup)
3. [Getting Redash API key](#getting-redash-api-key)

## Prerequisites

* For docker installations [docker-compose](https://docker.com) and [Docker](https://docker.com) need to be installed.
* Admin access to a [Keycloak](https://www.keycloak.org/) server. For local development / testing follow [Keycloak installation](../forms-flow-idm/keycloak).

## Solution Setup

### Keycloak Setup

* **NOTE: Skip this step if you are already having a setup ready.**

* Login to KeyCloak Realm with admin privileges  
* For client **forms-flow-analytics** creation, follow the instructions given on [link](../forms-flow-idm/keycloak/README.md#create-keycloak-setup-for-formsflow-analytics) 


### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-ai/forms-flow-analytics".
   * Modify the configuration values as needed in the redash.env file. Details below,
   * **NOTE : {your-ip-address} on the redash.env have to be changed as per your host system IP address, for the systems with multiple network cards the IP address configurations have to be handled accordingly**

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`REDASH_HOST` __*__| Base address of your Redash instance (the DNS name or IP) with the protocol | | http://{your-ip-address}:7000
`PYTHONUNBUFFERED`|Log buffering setup|1 or 0 | 1
`REDASH_LOG_LEVEL`|Logging level|`CRITICAL, ERROR, WARNING, INFO, DEBUG, NOTSET` | ERROR
`REDASH_REDIS_URL`|Redis URL|Used on installation to create the database.Choose your own.|`redis://redis:6379/0`
`REDASH_DATABASE_URL`|Postgres database URL|Used on installation to create the database.Choose your own.|`postgresql://postgres@postgres/postgres`
`POSTGRES_PASSWORD`|Postgres database Password|Used on installation to create the database.Choose your own.|`postgres`
`POSTGRES_HOST_AUTH_METHOD`|Postgres authentication method|Used on installation to create the database.Choose your own.|`trust`
`REDASH_COOKIE_SECRET`|Encryption for all configuration|Used on installation to create the database.Choose your own.|`redash-selfhosted`
`REDASH_SECRET_KEY`|Encryption for datasource configuration|Used on installation to create the database.Choose your own.|`redash-selfhosted`
  
  **Additionally, you may want to change these**  
   * The value of REDASH_COOKIE_SECRET (especially if this instance is not just for testing purposes)
 
### Running the application

* Analytics service uses port 7000, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-analytics`

* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml run --rm server create_db` to setup database and to create tables.
  * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml run --rm server create_db` to setup database and to create tables.
  * Run `docker-compose -f docker-compose-windows.yml up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml stop` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml stop` to stop.

### Health Check

   The application should be up and available for use at port defaulted to 7000 in  http://localhost:7000/
    and register with any valid credentials.
    
### Configuration of Keycloak SAML Setup
    
   * Post registration, login to the application with admin credentials.
   * Click the menu icon to the left of the username and navigate to **Edit Profile**.
   * Go to tab "Settings", and then navigate to section "Authentication".
        * Check the option "SAML".
        * Set the field "SAML Metadata URL" with value of Keycloak SAML descriptor URL. Example. `{Keycloak URL}/auth/realms/forms-flow-ai/protocol/saml/descriptor`.
        * Set the field "SAML Entity ID" value to be `forms-flow-analytics`.
        * Set the field "SAML NameID Format" value to be `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`.
   * Logout and login again using valid keycloak user credentials, Default user credentials are provided [here](../forms-flow-idm/keycloak/README.md#health-check).
 
 ## Getting Redash API Key
 
 * Login to redash hosted instance  (i.e. http://localhost:7000/) using the admin credentials passed for registration / SAML credentials
 * Go to Settings
      * Go to Account Section
      * Copy API Key to Clipboard
 
