## Create KeyCloak Realm Admin Client.    
This client will be used  to create new clients in realm.    
  
## Create forms-flow-web Client  

Create a forms-flow-web Client.     

1. Login to KeyCloak Realm with admin privileges  
2. Configure > Clients > Create  
	3. Client ID = forms-flow-web  
	4. Client Protocol = openid-connect  
	5. Click Save  
	6. Settings Tab  
		7. Name = forms-flow-web  
		8. Description = React based FormIO web components  
		7. Access Type = public  
		8. Standard Flow Enabled = ON  
		9. Direct Access Grants Enabled = ON  
		10. Valid Redirect URIs  eg. http://localhost:3000/*
		11. Valid Web Origins  = *
		12. Click Save  
	16. Roles Tab  
		17. Click Add Role  
			a. Role Name = formsflow-client  
			b. Click Save  
		18. Click Add Role  
			a. Role Name = formsflow-reviewer  
			b. Click Save  
		19. Click Add Role  
			a. Role Name = formsflow-designer  
			b. Click Save  

## Update Role information Mapping to Keycloak userinfo data  

This is for making role information to be available in the userinfo object for various use cases like updating a form based on role:  
 
1. Login to KeyCloak Realm with admin privileges  
2. Configure > Clients Scope > Roles > Mappers > Create Update the form as  
    3. Name- Role  
    4. Mapper Type - User Client Role  
    5. Client ID - forms-flow-web  
    6. Token Claim role - role  
    7. Add to ID token -yes  
    8. Add to access token - yes  
    9. Add to userinfo - yes  
    10. Click Save  

## Create forms-flow-analytics Client  

Create a forms-flow-analytics Client.     

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

## Enable SAML login in REDASH  

1. Login to Redash using the admin credentials  
2. Click on your profileName(top right side corner) and Click EditProfile  
3. Goto Settings tab    
4. Click SAML Enabled checkbox and update the below details  
	5. SAML Metadata URL = {KEYCLOAK_URL}/auth/realms/{REALM_NAME}/protocol/saml/descriptor  
	6. SAML Entity ID = forms-flow-analytics  
	7. SAML NameID Format = urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress  
	8. Click Save  
9. After logging out, SAML Login will be enabled and log in through it can be done for your users.  

## Create forms-flow-bpm Client  

Create a forms-flow-bpm Client.     

1. Login to KeyCloak Realm with admin privileges  
2. Configure > Clients > Create  
	3. Client ID = forms-flow-bpm  
	4. Client Protocol = openid-connect  
	5. Click Save  
	6. Settings Tab  
		7. Name = forms-flow-bpm  
		8. Description = Camunda Process Engine Components  
		7. Access Type = confidential  
		8. Standard Flow Enabled = ON  
		9. Direct Access Grants Enabled = ON  
		10. Service Accounts Enabled = ON  
		11. Valid Redirect URIs  
		12. Web Origins = *  
		13. Click Save  
	14. Mappers Tab  
		15. Click Create, and provide in below properties  
				a. Name = username  
				b. Mapper Type =User Property  
				c. Property = username  
				d. Token Claim Name = preferred_username  
				e. Claim JSON Type = String  
				f. Add to ID Token = ON  
				g. Add to access Token = ON  
				h. Add to userinfo = ON  
				g. Click Save  
	16. Service Accounts Tab  
		17. Select Client roles as "realm-management"  
		18. Map the listed "Available Roles" to "Assigned Roles"  
				a. query-groups  
				b. query-users  
				c. view-users  
19. Configure > Client Scopes > Create
	20. Name = camunda-rest-api
	21. Click Save
	22. Client Scopes > camunda-rest-api
		23. Mappers Tab
			24. Click Create
			25. Name = camunda-rest-api
			26. Mapper Type = Audience
			27. Included Custom Audience = camunda-rest-api
			28. Click Save
29. Configure > Clients > forms-flow-bpm
	30. Client Scopes Tab
		31. Default Client Scopes
		32. Select camunda-rest-api
		33. Click Add selected >>


## Create Groups   

Create groups to support operations  

1. Create Main group by Clicking New  
	a. Name = formsflow  
	b. Click Save	  
2. Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	a. Name = formsflow-client  
	b. Click Save  
3. Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	a. Name = formsflow-designer  
	b. Click Save  
4. Create Sub group by Clicking on Main group created on step-1 i.e. formsflow, and then click New  
	a. Name = formsflow-reviewer  
	b. Click Save  
5. Create Main group by Clicking New  
	a. Name = camunda-admin  
	b. Click Save  
6. Default Groups Tab (Assign Default Group to self-registering users)  
	7. From available groups; map the group "formsflow-client" to "Default Groups".  

### Map roles to group  

Mapping different roles to group/subgroups:  

1. Login to KeyCloak Realm with admin privileges  
2. Manage > Groups > select a subgroup say "formsflow-client" from the list of groups  
3. Select tab Role Mappings  
    4. Select forms-flow-web from the list of Client Roles selection  
    5. Select formsflow-client role and click add selected  
    6. The selected role will come in assigned roles for that subgroup.  
4. Repeat the step 2 and 3 for subgroups formsflow-designer and formsflow-reviewer and choose the respective roles for them.   

### Test forms-flow-web access in Postman  

1. Open Postman  
2. Create new Request  
	3. Name = forms-flow-web-validation  
	4. Authorization Tab  
		5. Type = OAuth 2.0  
		6. Get New Access Token  
			7. Token Name = forms-flow-web-password-token  
			8. Grant Type = Password Credentials  
			9. Access Token URL (example) = {KEYCLOAK_URL}/auth/realms/_realm/protocol/openid-connect/token  
			10. Username = ?  
			11. Password = ?  
			12. Client ID = forms-flow-web   
			13. Scope = openid  
			14. Client Authentication = Send as Basic Auth header  
			15. Click Request Token  
			16. Copy Access Token  
			17. Paste in jwt.io, and examine token  
			18. Should see resource_access[] > roles[] > list of Effective Roles  
 

### Test forms-flow-bpm access in Postman  

1. Open Postman  
2. Create new Request  
	3. Name = forms-flow-bpm-validation  
	4. Authorization Tab  
		5. Type = OAuth 2.0  
		6. Get New Access Token  
			7. Token Name = forms-flow-bpm-admin-token  
			8. Grant Type = Client Credentials  
			9. Access Token URL (example) = {KEYCLOAK_URL}/auth/realms/_realm/protocol/openid-connect/token  
			10. Client ID = forms-flow-bpm  
			11. Client Secret = saved from Credentials Tab in Keycloak  
			12. Scope = openid  
			13. Client Authentication = Send as Basic Auth header  
			14. Click Request Token  
			15. Copy Access Token  
			16. Paste in jwt.io, and examine token  
			17. Should see resource_access[] > roles[] > list of Effective Roles  
