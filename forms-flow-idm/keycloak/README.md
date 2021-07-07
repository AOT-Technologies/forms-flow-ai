# Formsflow.ai Keycloak Setup

## Table of Content
1. [Local Keycloak setup](#local-keycloak-setup)
   - [Prerequisites](#prerequisites)
   - [Step 1 : Environment Configuration](#environment-configuration)
   - [Step 2 : Environment Variables](#environment-variables)
   - [Step 3 : Starting / Stopping Keycloak server](#starting-or-stopping-keycloak-server)
   - [Step 4 : Health Check](#health-check)
     - [formsflow-ai user credentials](#formsflow-ai-user-credentials)
2. [Server Keycloak setup](#server-keycloak-setup)
   - [Step 1 : Create Realm](#create-realm)
   - [Step 2 : Create Keycloak setup for formsflow web](#create-keycloak-setup-for-formsflow-web)
   - [Step 3 : Create Keycloak setup for formsflow analytics](#create-keycloak-setup-for-formsflow-analytics)
   - [Step 4 : Create Keycloak setup for formsflow bpm](#create-keycloak-setup-for-formsflow-bpm) 
   - [Step 5 : Create groups](#create-groups) 
   - [Step 6 : Test keycloak access in Postman](#test-keycloak-access-in-postman) 
3. [Get the Keycloak client secret](#get-the-keycloak-client-secret)

## Local keycloak setup

* This setup is preferred for local development only. A docker instance will be created as part of setup. If you have existing Keycloak instance  go to [Server Keycloak setup](#server-keycloak-setup).

### Prerequisites

* For docker based installation [Docker](https://docker.com) needs to be installed.

### Environment Configuration

   * Make sure you have a Docker machine up and running.
   * Make sure your current working directory is [forms-flow-ai/forms-flow-idm/keycloak]().
   >* *Optional*: Rename the file [sample.env](./sample.env) to **.env**. Skip this step if you want to use the default values as mentioned in the table below.
   >* *Optional*: Modify the environment variables in the newly created **.env** file if needed. Environment variables are given in the table below,

### Environment Variables
   
#### Keycloak Database Connection Details
-----------------------------------------

***Skip this for default setup***

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_JDBC_DB`|keycloak database name|Used on installation to create the database.Choose your own|`keycloak`
`KEYCLOAK_JDBC_USER`|keycloak database postgres user|Used on installation to create the database.Choose your own|`postgres`
`KEYCLOAK_JDBC_PASSWORD`|keycloak database postgres password|Used on installation to create the database.Choose your own|`changeit`

#### Keycloak Admin Details
-----------------------------------------

***Skip this for default setup***

Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_ADMIN_USER`|keycloak admin user name|Choose your own|`admin`
`KEYCLOAK_ADMIN_PASSWORD`|keycloak admin password|Choose your own|`changeme`

### Starting or Stopping Keycloak server

* Keycloak server uses port 8080, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-idm/keycloak`

#### To start the keycloak server
   
* Run `docker-compose up -d` to start.

*NOTE: Use --build command with the start command to reflect any future **.env** changes eg : `docker-compose -f docker-compose-windows.yml up --build -d`*

#### To stop the keycloak server

  * Run `docker-compose stop` to stop.
  
### Health Check

   The application should be up and available for use in http://localhost:8080
   ```
    Login Credentials
    -----------------
    User Name : admin
    Password  : changeme
   ```
   
#### formsflow-ai user credentials
-----------------------------------
  * Default User credentials are generated when keycloak started for the first time, you can modify the values on your keycloak service. 
   
   User Role | User Name | Password | User Group |
   --- | --- | --- | ---
   `Designer`|`formsflow-designer`|`changeme`|`formsflow-designer`
   `Client`|`formsflow-client`|`changeme`|`formsflow-client`
   `Reviewer`|`formsflow-reviewer`|`changeme`|`formsflow-reviewer`
   `Clerk`|`formsflow-clerk`|`changeme`|`formsflow-reviewer`
   `Approver`|`formsflow-approver`|`changeme`|`formsflow-reviewer`

---
**NOTE**

All the default configurations are imported to keycloak during the startup, so no manual changes are required at this stage.
Redirect uri's are configured as localhost in the default setup, you can configure the ip address (if required) as the redirect uri for the clients by logging into Keycloak.

---

> **Local keycloak set up is successfully completed now. You can skip the remaining sections in this page and continue with other installation steps.**

## Server keycloak setup

* Make sure you downloaded and installed [Keycloak](https://www.keycloak.org/downloads). 
* To setup a remote keycloak server either download and import the ***[formsflow-ai-realm.json](./imports/formsflow-ai-realm.json)*** to keycloak ( Applicable only for keycloak version 11.0.0 and above ) or follow the manual steps below.

### Create Realm

Create a realm **forms-flow-ai**

* Login to keycloak with admin privileges
* Click the button "Create Realm" to add new realm **forms-flow-ai**
* Click Create   
  
### Create Keycloak setup for formsflow web

#### Create a forms-flow-web Client.     

* Login to KeyCloak Realm with admin privileges  
* Configure > Clients > Create  
	* Client ID = forms-flow-web  
	* Client Protocol = openid-connect  
	* Click Save  
	* Settings Tab  
		* Name = forms-flow-web  
		* Description = React based FormIO web components  
		* Access Type = public  
		* Valid Redirect URIs  eg. http://localhost:3000/*
		* Valid Web Origins  = *
		* Click Save  
	* Roles Tab  
		* Click Add Role  
			* Role Name = formsflow-client  
			* Click Save  
		* Click Add Role  
			* Role Name = formsflow-reviewer  
			* Click Save  
		* Click Add Role  
			* Role Name = formsflow-designer  
			* Click Save  
* Configure > Clients Scope > Roles > Mappers > Create
    * Name = Role  
    * Mapper Type = User Client Role  
    * Client ID = forms-flow-web  
    * Token Claim Name = role  
    * Click Save  
* Configure > Clients 
* Select forms-flow-web Client
* Select Mappers tab
    * Click Create
        * Name = flowsflow-web-mapper
        * Mapper Type = Audience
       	* Included Client Audience = forms-flow-web
       	* Click Save

### Create Keycloak setup for formsflow analytics

#### Create a forms-flow-analytics Client.     

* Login to KeyCloak Realm with admin privileges  
* Configure > Clients > Create  
	* Client ID = forms-flow-analytics  
	* Client Protocol = saml  
	* Click Save  
	* Settings Tab  
		* Name = forms-flow-analytics  
		* Description = Redash-Analytics  
		* Sign Assertions = ON  
			* Signature Algorithm = RSA_SHA256  
			* SAML Signature Key Name = KEY_ID  
			* Canonicalization Method = EXCLUSIVE_WITH_COMMENTS  
		* Name ID Format = email 	  
		* Valid Redirect URIs  eg. http://localhost:7000/*  
		* Master SAML Processing URL = http://localhost:7000/saml/callback?org_slug=default   
		* Note: All other settings like Force POST BINDING, Client Signature Required, Front Channel Logout should be turned off and empty.
		* Click Save  
	* Mappers Tab  
		* Click Add Builtin  
			* Click the Add checkbox for X500 surname and X500 givenName  
			* Click Add selected  
		* Go Back to Mappers   
			* Click Edit on X500 surname  
			* Change Friendly Name to LastName   
			* Click Save  
		* Go Back to Mappers   
			* Click Edit on X500 givenName  
			* Change Friendly Name to FirstName   
			* Click Save  
 

### Create Keycloak setup for formsflow bpm

#### Create a forms-flow-bpm Client.     

* Login to KeyCloak Realm with admin privileges  
* Configure > Clients > Create  
	* Client ID = forms-flow-bpm  
	* Client Protocol = openid-connect  
	* Click Save  
	* Settings Tab  
		* Name = forms-flow-bpm  
		* Description = Camunda Process Engine Components  
		* Access Type = confidential   
		* Service Accounts Enabled = ON  
		* Valid Redirect URIs  eg. http://localhost:8000/camunda/*
		* Web Origins = *  
		* Click Save  
	* Mappers Tab  
		* Click Create, and provide in below properties  
				* Name = username  
				* Mapper Type =User Property  
				* Property = username  
				* Token Claim Name = preferred_username  
				* Claim JSON Type = String  
				* Click Save  
	* Service Accounts Tab  
		* Select Client roles as "realm-management"  
		* Map the listed "Available Roles" to "Assigned Roles"  
				a. query-groups  
				b. query-users  
				c. view-users  
* Configure > Client Scopes > Create
	* Name = camunda-rest-api
	* Click Save
	* Client Scopes > camunda-rest-api
		* Mappers Tab
			* Click Create
			* Name = camunda-rest-api
			* Mapper Type = Audience
			* Included Custom Audience = camunda-rest-api
			* Click Save
* Configure > Clients > forms-flow-bpm
	* Client Scopes Tab
		* Default Client Scopes
		* Select camunda-rest-api
		* Click Add selected 
* Configure > Clients 
* Select forms-flow-bpm Client
* Select Mappers tab
    * Click Create
        * Name = flowsflow-api-mapper
        * Mapper Type = Audience
       	* Included Custom Audience = forms-flow-web
       	* Click Save

### Create Groups   

Create groups to support operations  

* Create Main group by Clicking New  
	* Name = formsflow  
	* Click Save	  
* Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	* Name = formsflow-client  
	* Click Save  
* Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	* Name = formsflow-designer  
	* Click Save  
* Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	* Name = formsflow-reviewer  
	* Click Save   
* Create Main group by Clicking New  
	* Name = camunda-admin  
	* Click Save  
* Default Groups Tab (Assign Default Group to self-registering users)  
	* From available groups; map the group "formsflow-client" to "Default Groups".  

#### Map roles to group  

Mapping different roles to group/subgroups:  

* Login to KeyCloak Realm with admin privileges  
* Manage > Groups > select a subgroup say "formsflow-client" from the list of groups  
* Select tab Role Mappings  
    * Select forms-flow-web from the list of Client Roles selection  
    * Select formsflow-client role and click add selected  
    * The selected role will appear in assigned roles for that subgroup.  
* Repeat the step 2 and 3 for subgroups formsflow-designer, formsflow-reviewer and choose the respective roles for them according to the table :

Group|Roles|Description
---|---|---
camunda-admin||Able to administer Camunda directly and create new workflows
formsflow-designer|formsflow-client, formsflow-designer, formsflow-reviewer| Able to access all elements of the formsflow UI including forms design, task list and forms access
formsflow-reviewer|formsflow-reviewer| Able to access task list and forms access of formsflow UI
formsflow-client|formsflow-client| Able to access form fill-in only


## Test keycloak access in Postman

### Test forms-flow-web access in Postman  

* Open Postman  
* Create new Request  
	* Name = forms-flow-web-validation  
	* Authorization Tab  
		* Type = OAuth 2.0  
		* Get New Access Token  
			* Token Name = forms-flow-web-password-token  
			* Grant Type = Password Credentials  
			* Access Token URL (example) = {KEYCLOAK_URL}/auth/realms/{realm name}/protocol/openid-connect/token  
			* Username = ?  
			* Password = ?  
			* Client ID = forms-flow-web   
			* Scope = openid  
			* Client Authentication = Send as Basic Auth header  
			* Click Request Token  
			* Copy Access Token  
			* Paste in jwt.io, and examine token  
			* Should see resource_access[] > roles[] > list of Effective Roles  
 

### Test forms-flow-bpm access in Postman  

* Open Postman  
* Create new Request  
	* Name = forms-flow-bpm-validation  
	* Authorization Tab  
		* Type = OAuth 2.0  
		* Get New Access Token  
			* Token Name = forms-flow-bpm-admin-token  
			* Grant Type = Client Credentials  
			* Access Token URL (example) = {KEYCLOAK_URL}/auth/realms/{realm name}/protocol/openid-connect/token  
			* Client ID = forms-flow-bpm  
			* Client Secret = saved from Credentials Tab in Keycloak  
			* Scope = openid  
			* Client Authentication = Send as Basic Auth header  
			* Click Request Token  
			* Copy Access Token  
			* Paste in jwt.io, and examine token  
			* Should see resource_access[] > roles[] > list of Effective Roles  

> **Server keycloak set up is successfully completed now. You can skip the remaining sections in this page and continue with other installation steps.**			
			
## Get the Keycloak client secret

* Go to **http://localhost:8080** in the browser
* Login to KeyCloak Realm with admin privileges 
* Configure > Clients >   
	* Click on Client ID = forms-flow-bpm 
	* Got to Credentials Tab
	* Copy 	the secret value if present else click on Regenerate secret button and copy the value
