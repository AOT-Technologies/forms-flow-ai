# Analytics Engine

![Redash](https://img.shields.io/badge/Redash-v9(master)-blue)

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
3. [Get the Redash API key](#get-the-redash-api-key)

## Prerequisites

* For docker based installation [Docker](https://docker.com) need to be installed.
* Admin access to [Keycloak](../forms-flow-idm/keycloak) server.

## Solution Setup

### Keycloak Setup

> NOTE: Skip below steps and go to Installation if you are already configured Keycloak.

* If you have a Keycloak Instance and yet to configure it then login to KeyCloak with admin credentials.
* Follow the instructions given [here](../forms-flow-idm/keycloak/README.md#create-keycloak-setup-for-formsflow-analytics) to configure **forms-flow-analytics** client.

### Installation

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-ai/forms-flow-analytics".
   * Rename the file [sample.env](./sample.env) to **.env**.
   * Modify the environment variables inside [.env](./sample.env) file if needed. Environment variables are given in the table below
   * **NOTE : `{your-ip-address}` given inside the [redash.env](./redash.env) file should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards**

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the `redash.env` file

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`REDASH_HOST`:triangular_flag_on_post:| Base address of your Redash instance (the DNS name or IP) with the protocol | | http://{your-ip-address}:7000/redash
`PYTHONUNBUFFERED`|Log buffering setup|1 or 0 | 1
`REDASH_LOG_LEVEL`|Logging level|`CRITICAL, ERROR, WARNING, INFO, DEBUG, NOTSET` | ERROR
`REDASH_REDIS_URL`|Redis URL|Used on installation to create the database.Choose your own.|`redis://redis:6379/0`
`REDASH_DATABASE_URL`|Postgres database URL|Used on installation to create the database.Choose your own.|`postgresql://postgres@postgres/postgres`
`POSTGRES_PASSWORD`|Postgres database Password|Used on installation to create the database.Choose your own.|`postgres`
`POSTGRES_HOST_AUTH_METHOD`|Postgres authentication method|Used on installation to create the database.Choose your own.|`trust`
`REDASH_COOKIE_SECRET`|Encryption for all configuration|Used on installation to create the database.Choose your own.|`redash-selfhosted`
`REDASH_SECRET_KEY`|Encryption for datasource configuration|Used on installation to create the database.Choose your own.|`redash-selfhosted`
`REDASH_CORS_ACCESS_CONTROL_ALLOW_ORIGIN`| To set allow origins to access Redash | `your-domain.com` | `*`
`REDASH_REFERRER_POLICY`| To control how much referrer information should be included with Redash API requests | Choose your own. | `no-referrer-when-downgrade`
`REDASH_CORS_ACCESS_CONTROL_ALLOW_HEADERS` | To control allowed headers to access Reash | Choose on your own | `Content-Type, Authorization`
  
### Running the application

* Analytics service uses port 7000, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-analytics`

> The forked version of redash is being used to overcome the limited cors support in redash. The forked repo fixes the cors issues. But if the environment is setup in such a way that redash resides in the same url origin as forms web application , redash can be built from any redash images.


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
        * Set the field "SAML Metadata URL" with value of Keycloak SAML descriptor URL. Example. http://{your-ip-address}:8080/auth/realms/forms-flow-ai/protocol/saml/descriptor. {your-ip-address} should be changed to your host system IP address. Please take special care to identify the correct IP address if your system has multiple network cards
        * Set the field "SAML Entity ID" value to be `forms-flow-analytics`.
        * Set the field "SAML NameID Format" value to be `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`.
   * Logout and login again using valid formsflow.ai keycloak user credentials. Default user credentials are provided [here](../forms-flow-idm/keycloak/README.md#formsflow-ai-user-credentials).
 
> forms-flow-analytic (REDASH) setup is successfully completed now. You can skip remaining sections in this page and continue with other installation steps.
 
## Get the Redash API Key
 
 * Login to redash hosted instance  (i.e. http://localhost:7000/) using the admin credentials passed for registration / SAML credentials
 * Go to User Icon -> Profile -> Settings
      * Go to Account Section
      * Copy API Key to Clipboard
 
### Redash how to use guide 

Check our guide on [how to configure Redash and come up with awesome visualization using redash](./docs/README.md). Also [sample queries for default forms](./docs/sample_queries.md).
