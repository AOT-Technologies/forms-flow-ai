# Identity Management
The **formsflow.ai** framework could be hooked up with any OpenID Connect compliant Identity Management Server. To date, we have only tested [Keycloak](https://github.com/keycloak/keycloak)

## Table of Contents
* [Authentication](#authentication)
* [Authorization](#authorization)
  * [User Roles](#user-roles)
  * [User Groups](#user-groups)
* [Keycloak Setup](#keycloak-setup)

## Authentication
All the resources in the formsflow.ai solution require authentication i.e. users must be a member of a realm.
 
## Authorization
Roles and Groups together play a vital role in granting or restricting users with access of choice. 
### User Roles
The framework defines user roles which are standardized across all the products. During the installation process, component-specific variants of these roles are set up, these need to be added to the .env file to provide seamless integration:

- formsflow-designer  
  * Design and manage electronic forms
- formsflow-reviewer
  * Receive and process online submissions. 
  * View metrics to obtain quantitative information about online submissions and the states they are in.
  * View reports on analytics (slice 'n dice the data within the form).
- formsflow-client 
  * Fill in and submit the online form(s)
  
Roles are derived from claims extracted from the JWT's returned during the login process. A user may be assigned multiple roles. User, group, and role creation and management are performed in  Keycloak by the realm administrator. 

Here are some important notes about the interaction between users, groups, and roles

* Groups (and if needed, subgroups) are associated with roles
* Note that there is no client for form.io - there is no direct login capability on Keycloak for form.io. All form administration is performed from the formsflow UI
* In practice, users are assigned to groups and thereby inherit the roles
* Groups are also synced to Camunda so are available for task filtering, email notifications, etc.
* In the current implementation ONLY members of group camunda-admins can access the Camunda UI directly
* There is some "under-the-covers" authorization going on concerning access between the  formsflow UI, the formsflow API, and Camunda with the addition of audience mapping - basically allowing communication between components 

### User Groups
There are two groups
 * `camunda-admin`
 * `formsflow` under which exists 3 sub-groups.  
     
Group | Sub Group | Roles | Description |
--- | --- | --- | ---
`camunda-admin`| | |Able to administer Camunda directly and create new workflows
`formsflow`|`formsflow-designer` |formsflow-bpm|Able to design forms and publish for use.
`formsflow`|`formsflow-reviewer` |formsflow-bpm|Able to access applications, tasks, metrics and Insight of formsflow UI
`formsflow`|`formsflow-client` |formsflow-client|Able to access form fill-in only
     
* Please note, it is possible to assign a user to multiple groups say `formsflow-designer` and `formsflow-reviewer`, in order to provide access to both designer and staff behavior. 
* Also, based on the workflow process `user task` candidate groups; new groups (main or sub group of `formsflow-reviewer`) can be created in keycloak. 
  * In case of creating the candidate group as main group; ensure to add the role `formsflow-reviewer` role to it.

Keycloak Setup
----------
[Instructions for Keycloak setup](./keycloak/README.md)
