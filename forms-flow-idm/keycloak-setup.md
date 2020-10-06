## formsflow.ai Keycloak Setup

Create a realm **forms-flow-ai**

* Login to keycloak with admin privileges
* Click the button "Create Realm" to add new realm **forms-flow-ai**
* Click Create   
  
## Create forms-flow-web Client  

Create a forms-flow-web Client.     

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
        * Name = flowsflow-api-mapper
        * Mapper Type = Audience
       	* Included Custom Audience = forms-flow-web
       	* Click Save
## Create forms-flow-analytics Client  

Create a forms-flow-analytics Client.     

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
 

## Create forms-flow-bpm Client  

Create a forms-flow-bpm Client.     

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

## Create Groups   

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
* Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	* Name = formsflow-analyst  
	* Click Save  
* Create Main group by Clicking New  
	* Name = camunda-admin  
	* Click Save  
* Default Groups Tab (Assign Default Group to self-registering users)  
	* From available groups; map the group "formsflow-client" to "Default Groups".  

### Map roles to group  

Mapping different roles to group/subgroups:  

* Login to KeyCloak Realm with admin privileges  
* Manage > Groups > select a subgroup say "formsflow-client" from the list of groups  
* Select tab Role Mappings  
    * Select forms-flow-web from the list of Client Roles selection  
    * Select formsflow-client role and click add selected  
    * The selected role will appear in assigned roles for that subgroup.  
* Repeat the step 2 and 3 for subgroups formsflow-designer, formsflow-reviewer and formsflow-analyst and choose the respective roles for them according to the table :

Group|Roles|Description
---|---|---
camunda-admin||Able to administer Camunda directly and create new workflows
formsflow-analyst|formsflow-analyst, formsflow-client|Able to access the Redash dashboard and FormsFlow UI
formsflow-designer|formsflow-client, formsflow-designer, formsflow-reviewer| Able to access all elements of the FormsFlow UI including forms design, task list and forms access
formsflow-reviewer|formsflow-reviewer| Able to access task list and forms access of FormsFlow UI
formsflow-client|formsflow-client| Able to access form fill-in only



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
