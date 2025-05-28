# Formsflow.ai Keycloak Setup

### Starting or Stopping Keycloak server

* Keycloak server uses port 8080, make sure the port is available.
* `cd {Your Directory}/forms-flow-ai/forms-flow-idm/keycloak`

#### To start the keycloak server

* Run `docker-compose up -d` to start.

*NOTE: Use --build command with the start command to reflect any future changes eg : `docker-compose up --build -d`*

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

### Add custom login theme

* Log in to http://localhost:8080
* Select Realm settings>Themes>Login Theme>formsflow>Save.
* Run `docker-compose up --build -d` to verify the changes.


**NOTE**

All the default configurations are imported to keycloak during the startup, so no manual changes are required at this stage.
Redirect uri's are configured as localhost in the default setup, you can configure the ip address (if required) as the redirect uri for the clients by logging into Keycloak.

---

> **Local keycloak set up is successfully completed now. You can skip the remaining sections in this page and continue with other installation steps.**

## Server keycloak setup

* Make sure you downloaded and installed [Keycloak](https://www.keycloak.org/downloads). 
* To setup a remote keycloak server either download and import the ***[formsflow-ai-realm.json](./imports/formsflow-ai-realm.json)*** to keycloak ( Applicable only for keycloak version 11.0.0 and above )

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


### Additional reference

Check out the [installation documentation](https://aot-technologies.github.io/forms-flow-installation-doc/) for installation instructions and [features documentation](https://aot-technologies.github.io/forms-flow-ai-doc) to explore features and capabilities in detail.