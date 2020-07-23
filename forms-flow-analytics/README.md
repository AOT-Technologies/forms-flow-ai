# Analytics Engine
**FormsFlow.AI** leverages Redash for getting insight and data visualization.

To know more about Redash, go to https://github.com/getredash/redash.

## Table of Content
* [Prerequisites](#prerequisites)
* [Solution Setup](#solution-setup)
  * [Step 1 : Keycloak Setup](#keycloak-setup)
  * [Step 2 : Installation](#installation)
  * [Step 3 : Running the application](#running-the-application)
  * [Step 4 : Health Check](#health-check)
  * [Step 5 : Configuration of Keycloak SAML Setup](#configuration-of-keycloak-saml-setup)   

## Prerequisites

The system is deployed and run using [docker-compose](https://docker.com) and [Docker](https://docker.com). These need to be available. 
There needs to be a [Keycloak](https://www.keycloak.org/) server available and you need admin privileges (to create realms, users etc. in Keycloak).

## Solution Setup

### Keycloak Setup

* Login to KeyCloak Realm with admin privileges  
* For client **forms-flow-analytics** creation, follow the instructions given on [link](../forms-flow-idm/keycloak-setup.md) 


### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-analytics".
   * Modify the configuration values as needed. Details below,

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`REDASH_HOST`| Base address of your Redash instance (the DNS name or IP) with the protocol | | http://localhost/redash
`PYTHONUNBUFFERED`|Log buffering setup|1 or 0 | 1
`REDASH_LOG_LEVEL`|Logging level|`CRITICAL, ERROR, WARNING, INFO, DEBUG, NOTSET` | ERROR
`REDASH_REDIS_URL`|Redis URL|Used on installation to create the database.Choose your own.|`redis://redis:6379/0`
`REDASH_DATABASE_URL`|Postgres database URL|ditto|`postgresql://postgres@postgres/postgres`
`POSTGRES_PASSWORD`|Postgres database Password|ditto|`postgres`
`POSTGRES_HOST_AUTH_METHOD`|Postgres authentication method|ditto|`trust`
`REDASH_COOKIE_SECRET`|Encryption for all configuration|ditto|`redash-selfhosted`
`REDASH_SECRET_KEY`|Encryption for datasource configuration|ditto|`redash-selfhosted`
  
  **Additionally, you may want to change these**  
   * The value of REDASH_COOKIE_SECRET (especially if this instance is not just for testing purposes)
 
### Running the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml run --rm server create_db` to setup database and to create tables.
  * Run `docker-compose -f docker-compose-linux.yml up -d` to start.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml run --rm server create_db` to setup database and to create tables.
  * Run `docker-compose -f docker-compose-windows.yml up -d` to start.

#### To stop the application
* For Linux,
  * Run `docker-compose -f docker-compose-linux.yml down` to stop.
* For Windows,
  * Run `docker-compose -f docker-compose-windows.yml down` to stop.

### Health Check

   The application should be up and available for use at port defaulted to 7000 in docker-compose.yml (i.e. http://localhost:7000/)
    and register with any valid credentials.
    
### Configuration of Keycloak SAML Setup
    
   * Post registration, login to the application with admin credentials.
   * Click the menu icon to the left of the username and navigate to **Edit Profile**.
   * Go to tab "Settings", and then navigate to section "Authentication".
        * Check the option "SAML".
        * Set the field "SAML Metadata URL" with value of Keycloak SAML descriptor URL. Example. `{Keycloak URL}/auth/realms/forms-flow-ai/protocol/saml/descriptor`.
        * Set the field "SAML Entity ID" value to be `forms-flow-analytics`.
        * Set the field "SAML NameID Format" value to be `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`.
   * Logout and try to login using valid realm user credentials.
