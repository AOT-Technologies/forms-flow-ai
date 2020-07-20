# Analytics Engine
**FormsFlow.AI** leverages Redash for getting insight and data visualization.

To know more about Redash, go to https://github.com/getredash/redash.

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

## Project Setup

### Keycloak Setup

1. Login to KeyCloak Realm with admin privileges  
2. Configure > Clients > Create  
	3. Client ID = forms-flow-analytics  
	4. Client Protocol = saml  
	5. Click Save  	
6. Settings Tab  
	7. Name = forms-flow-analytics  
	8. Description = Redash-Analytics  
	7. Enabled = ON  
	8. Include AuthStatement = ON  
	9. Sign Assertions = ON  
	10. Signature Algorithm = RSA_SHA256  
	11. SAML Signature Key Name = KEY_ID  
	12. Canonicalization Method = EXCLUSIVE_WITH_COMMENTS  
	13. Name ID Format = email    	
	14. Valid Redirect URIs = {ANALYTICS_URL}/*  
	15. Valid Master SAML Processing URL = {ANALYTICS_URL}/saml/callback?org_slug=default  
	16. Note: All other settings should be turned off and empty  
	17. Click Save  
18. Mappers Tab  
	19. Click Add Builtin  
		a. Click the Add checkbox for X500 surname and X500 givenName  
		b. Click Add selected  
	20. Go Back to Mappers   
		a. Click Edit on X500 surname  
		b. Change Friendly Name to LastName   
		c. Click Save  
	21. Go Back to Mappers    
		a. Click Edit on X500 givenName  
		b. Change Friendly Name to FirstName   
		c. Click Save  

### Environment Configuration

Environment variables are set in **redash.env** and read by Redash.

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


### Running the Application

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is "forms-flow-analytics".
   * Modify the configuration values as needed. For example, you may want to change these:
     
         
```  
          The Postgres volume location.          
          
          For windows, the path of volume to be changed as given below.
           volumes:
            - ./postgres/analytics:/data/postgres
```
         The value of REDASH_COOKIE_SECRET (especially if this instance is not just for testing purposes)
   * Run `docker-compose run --rm server create_db` to setup database andd to create tables.
   * Run `docker-compose up -d` to start.
   
### Verify the application status

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
