# Changelog for formsflow.ai

Mark  items as `Added`, `Changed`, `Fixed`, `Modified`, `Removed`, `Untested Features`, `Upcoming Features`, `Known Issues`

## 5.3.1 - 2024-02-14

`Fixed`

**forms-flow-web**

* Fixed task page infinity loading issue
* Fixed task list filter API breaking on initial time
* Fixed tenant based all tasks not showing issue

**forms-flow-documents**

* Fixed security vulnerabilities

**forms-flow-data-analysis-api**

* Fixed security vulnerabilities

`Modified`

**forms-flow-api**

* Changes have been made to the Roles and Groups endpoint to accommodate modifications related to subgroups in Keycloak 23.

## 5.3.0 - 2023-11-24

`Added`

**forms-flow-web**

* Added new UI for forms, submissions, tasks, processes, dashboards, navbar
* Added RBAC support in form listing for reviewer
* Added RBAC support in submission(application) listing for client and reviewer
* Added form description to form
* Added a description input field for the form.
* Added create custom filter for task in task page
* Added environment variable `DATE_FORMAT` to change the date format
* Added environment variable `TIME_FORMAT` to change the time format
* Added environment variable `CUSTOM_THEME_URL` to override the theme
* Added environment variable `CUSTOM_RESOURCE_BUNDLE_URL` to customize resource bundle for internationalization 

**forms-flow-api**

* Added RBAC support in form listing for reviewer
* Added RBAC support in submission(application) listing for client and reviewer
* Added migration script to move existing task filters from forms-flow-bpm to forms-flow-api, checkout [here]( ./forms-flow-api/README.md#migration-script-for-existing-users)
* Added environment variable `API_LOG_ROTATION_WHEN` for specifying the frequency of log file rotation
* Added environment variable `API_LOG_ROTATION_INTERVAL` for setting the time interval for log file rotation
* Added environment variable `API_LOG_BACKUP_COUNT` for determining the number of backup log files to keep

**forms-flow-bpm**

* Added task filter custom implementation
* Added multi-modules

**forms-flow-documents**

* Added environment variable `API_LOG_ROTATION_WHEN` for specifying the frequency of log file rotation
* Added environment variable `API_LOG_ROTATION_INTERVAL` for setting the time interval for log file rotation
* Added environment variable `API_LOG_BACKUP_COUNT` for determining the number of backup log files to keep

`Modified`

**forms-flow-web**

* Modified Tasks page with List view and Card view of tasklist
* Modified Applications to Submissions in UI
* Modified accessibility enhancement
* Modified Name, Type, Path as advanced options while form create 
  
`Removed`

**forms-flow-web**

* Removed filter by form type from form listing table
 

`Generic Changes`

* Move task filters from forms-flow-bpm to forms-flow-web
* Support Resubmit/ Edit Submission dynamically in the application flow with respect to isResubmit Key

`Solution Component Upgrades`

**forms-flow-api**

* Flask upgraded to 2.3.3 and fixed security vulnerabilities
  
**forms-flow-web**

* Fixed security vulnerabilities

**forms-flow-bpm**

* Camunda upgraded to 7.20.0, SpringBoot upgraded to 3.1.5 and fixed security vulnerabilities

**forms-flow-documents**

* Flask upgraded to 2.3.3 and fixed security vulnerabilities


## 5.2.1 - 2023-09-01

`Fixed`

**forms-flow-web**

* Fixed bpmn property panel css issue.

**forms-flow-documents**

* Fixed the problem of conflicting versions between Chrome and Chrome Driver when downloading forms.


## 5.2.0 - 2023-06-30

`Added`

**forms-flow-web**

* Added `Form bundling` premium feature, refer [here](https://aot-technologies.github.io/forms-flow-ai-doc/#formBundling) for more details.
* Added RBAC(Role Based Access Control) support in form listing for designer and client, for more details checkout [here](https://aot-technologies.github.io/forms-flow-ai-doc/#rbac).
* Added admin module for adding keycloak roles and user assignment.
* Added formsflow-admin group for RBAC support.


**forms-flow-web-root-config**

* Added micro-frontend integration using single-spa, for more details checkout [here](./forms-flow-web-root-config/README.md#integrate-micro-front-end-modules-into-host-applications).
* Added environment variables `MF_FORMSFLOW_WEB_URL`, `MF_FORMSFLOW_NAV_URL`, `MF_FORMSFLOW_SERVICE_URL`, `MF_FORMSFLOW_ADMIN_URL`, `MF_FORMSFLOW_THEME_URL` to get MicroFrontend Components Created.
* Added environment variables `ENABLE_FORMS_MODULE`, `ENABLE_TASKS_MODULE`, `ENABLE_DASHBOARDS_MODULE`, `ENABLE_PROCESSES_MODULE`, `ENABLE_APPLICATIONS_MODULE` to disable a particular module in forms-flow-web.
* Added environment variable `CUSTOM_THEME_URL` for providing theming configuration.


**forms-flow-bpm**

* Added migration to support new Role Based Access(RBAC) with existing camunda authorizations.

**forms-flow-api**

* Added RBAC(Role Based Access Control) support in form listing for designer and client, click [here](https://aot-technologies.github.io/forms-flow-ai-doc/#rbac) for more details.
* Added migration script for existing users to get all forms listed, checkout [here]( ./forms-flow-api/README.md#migration-script-for-existing-users).
* Added admin module for adding keycloak roles and user assignment.
* Added formsflow-admin group for RBAC support.


`Modified`

**forms-flow-web**

* Application history is modified to Application status and Request status.
* Environment variable `USER_ACCESS_PERMISSIONS` is replaced with `ENABLE_APPLICATION_ACCESS_PERMISSION_CHECK` to enable Role level permission.

**forms-flow-analytics**

* Redash upgraded from version 10.1.4 to 10.1.5.

`forms-flow-api`

*Upgrade notes:*

* Flask upgraded from version 2.1.3 to 2.3.2.


`Fixed`

**forms-flow-web**

* Fixed resubmit issue in form adapter for custom submission.

**forms-flow-bpm**

* Task list variables not updated on re-submission by client issue fixed.

`Generic Changes`

* forms-flow-web is replaced by forms-flow-web-root-config as the deafult web application, for the setup refer [here](./forms-flow-web-root-config)
* Added Micro-frontend feature to enable component level customisation  which includes
     * forms-flow-admin (includes functionalities available for the user with admin privilages)
     * forms-flow-navbar (trigger the routing, internationalization, and login/logout functionalities for all users)
     * forms-flow-service (contains all the common functionalties used by micro front-ends like authentication service, storage APIs etc.)
     * forms-flow-theme (contains the common style sheet shared by all micro-front-ends)<br>
        Refer the [forms-flow-ai-micro-front-ends](https://github.com/AOT-Technologies/forms-flow-ai-micro-front-end) repository for further details.
* Dashboard authorization is moved from designer role to admin user.


## 5.1.1 - 2023-05-18

`Added`

**forms-flow-bpm**

* `External Task` APIs are exposed in bpm abstraction layer.

`Modified`

**forms-flow-bpm**

*Upgrade notes:*

* camunda upgraded from version 7.17.0 to 7.18.0.
* camunda-keycloak upgraded from version 2.2.3 to 7.18.0.
* camundaConnect upgraded from 1.5.0 to 1.5.4.
* camundaMail upgraded from 1.3.0 to 1.5.0.
* camunda-template-engines upgraded from 1.0.0 to 2.1.0
* spring boot upgraded from version 2.6.6 to  2.7.11.
* spring security Oauth2 upgraded from version 2.6.6 to 2.6.7.
* camunda-bpm-assert upgraded from 12.0 to 13.0.
* groovy upgraded from 3.0.13 to 3.0.17.
* graalVm upgraded from 22.1.0.1 to 22.3.2.
* jackson upgraded from version 2.14.0 to 2.15.0.


## 5.1.0 - 2022-01-18

`Added`

**forms-flow-web**

* Added form versoning.
* Added discard option for draft feature.
* Added form embedding.
* Added support for resources

**forms-flow-forms**

* Added environment variable `FORMIO_CLIENT_UI`.
* Added health check API-end point `/checkpoint`

**forms-flow-api**

* Added DB changes to accomodate form type, parent form id. 
* Added migration scripts in the alembic file to resolve schema conflicts while db upgrade and downgrade, check out [here](./forms-flow-api/migrations/versions/1a55b7674144_form_history.py).
* Added new table for form history
* Added new api to get form history by form id.
* Added new api to delete draft.
* Added new api to get the list of users for a role/group from keycloak.

**forms-flow-bpm**

* Added environment variables `REDIS_ENABLED`,`REDIS_HOST`,`REDIS_PORT`,`REDIS_PASSCODE` and `SESSION_COOKIE_SECURE`.

**forms-flow-documents**

* Added support for PDF templating.


`Modified`

**forms-flow-api**

* Updated certifi to 2022.12.7, protobuf to 3.20.2 and  joblib to 1.2.0.
* Modified swagger documentation.



**forms-flow-bpm**

*Upgrade notes:*

* spring boot upgraded from version 2.6.4. to  2.6.6.
* spring websocket upgraded from version 5.3.4 to 5.3.20.
* spring messaging upgraded from version 5.3.4 to 5.3.20.
* spring security Oauth2 upgraded from version 2.6.4. to 2.6.6.
* postgresql upgraded from version 42.4.1 to 42.4.3.
* jackson upgraded from version 2.13.3 to 2.14.0.


`Fixed`

**forms-flow-api**

* Fixed Python security vulnerabilities.

`Generic Changes`
* In Quick Installation:
<br> &nbsp;&nbsp;&nbsp;&nbsp;Fixed versions for databases.<br> &nbsp;&nbsp;&nbsp;&nbsp;Reduced script size.<br> &nbsp;&nbsp;&nbsp;&nbsp;Added IP confirmation to avoid IP issues.

* Moved form list of designer to forms-flow-api.

`Known Issues`

**forms-flow-bpm**
* Camunda Integration shows Invalid Credentials with formsflow.ai docker deployment, for more details refer [here](https://github.com/AOT-Technologies/forms-flow-ai/issues/978).
       
Note: Temporary fix added. Setting the value of environment variable `SESSION_COOKIE_SECURE` to `false` makes the camunda login works with ip.
For a production setup value should be true, which will work with Kubernetes and docker deployments with nginx.


## 5.0.2 - 2022-12-07

**forms-flow-web**

`Fixed`

* Frozen UI during form design.

## 5.0.1 - 2022-10-10

**forms-flow-web**

`Added`

* Added websocket support for multitenancy.

`Modified`

* Modified task page UI.
* Modified alignment of wizard.

`Removed`

* Removed environment variable `REACT_APP_FORMIO_JWT_SECRET` form [config.sample.js](./forms-flow-web/public/config/config.sample.js).

**forms-flow-api**

`Added`

* Return the role name as path for authorization.
* Added formsflow API support to start application with data.

**forms-flow-bpm**

`Added`

* Added new endpoints for process instance variables.
* Added web socket support files to build.



## 5.0.0 - 2022-09-02

`Added`

**forms-flow-web**

* Added pagination, search and sort for metrics page.
* Added default workflow for designer.
* Added Internationalization.
* Added multi-tenancy support.
* Added modal for submission details on metrics page.
* Added support for wizard forms.
* Added Export to PDF feature.
* Added application status `draft` for unfinished applications.
* Added Processes page for camunda web modeller.
* Added Form Adapter to support form submission data to other data stores than Mongo with custom data URLs.
* Added environment variable `MULTI_TENANCY_ENABLED`, `MT_ADMIN_BASE_URL`, `MT_ADMIN_BASE_URL_VERSION` to support multitenancy.
* Added environment variable `CUSTOM_SUBMISSION_URL`, `CUSTOM_SUBMISSION_ENABLED` for support form adapter.
* Added environment variables `DRAFT_ENABLED`, `DRAFT_POLLING_RATE` to manage draft feature. 
* Added environment variable `EXPORT_PDF_ENABLED`for pdf service.
* Added environment variable `PUBLIC_WORKFLOW_ENABLED` for enabling public workflow creation for multitenancy users.
* Added environment variable `DOCUMENT_SERVICE_URL`for document service.



**forms-flow-forms**

* Added new Repository , for more details checkout [here](https://github.com/AOT-Technologies/formio).
* Added environment variable `MULTI_TENANCY_ENABLED` to support mulitenancy.


**forms-flow-api**

* Added multi-tenancy support.
* Added support for default workflow with form.
* Added API support for `draft` feature.
* Added API support for `Form Adapter`.
* Added environment variable `MULTI_TENANCY_ENABLED`, `KEYCLOAK_ENABLE_CLIENT_AUTH` to support mulitenancy.
* Added new environment variable `FORMIO_JWT_SECRET`.

**forms-flow-bpm**

* Added default workflow.
* Added `Form Adapter` to support form submission data to other data stores than Mongo with custom data URLs.
* Added bpm gateway with jersey implementation.
* Added environment variable `MULTI_TENANCY_ENABLED`, `KEYCLOAK_ENABLE_CLIENT_AUTH`, `KEYCLOAK_WEB_CLIENTID`, `FORMSFLOW_ADMIN_URL` for multitenancy support.
* Added environment variable `CUSTOM_SUBMISSION_URL`, `CUSTOM_SUBMISSION_ENABLED` for support form adapter.



**forms-flow-documents**

* Added document API  to provide generate pdf with form submission data.
* Added environment variable `MULTI_TENANCY_ENABLED`, `KEYCLOAK_ENABLE_CLIENT_AUTH` to support mulitenancy .

**forms-flow-analytics**

* Added environment variable `REDASH_MULTI_ORG` to support multitenancy.



`Modified`

**forms-flow-web**

* Metrics page UI modified.
* Form page UI modified.
* Accessibility enhancement.
* service-worker updated.
* React build size optimized.

*Upgrade notes:*

* Environment variables modified `CAMUNDA_API_URL` to `BPM_API_URL`.
* Environment variables modified `REACT_APP_CAMUNDA_API_URI` to `REACT_APP_BPM_URL` in [config.sample.js](./forms-flow-web/public/config/config.sample.js)



**forms-flow-forms**

* Modified Docker-compose to point to create image from the [new Repository](https://github.com/AOT-Technologies/formio).

**forms-flow-api**

* Dependencies like utils, formio, JWT authentication moved to `forms-flow-api-utils`.
 
*Upgrade notes:*

* Environment variables modified ` BPM_API_BASE` to `BPM_API_URL`.


**forms-flow-bpm**

*Upgrade notes:*

* Camunda upgraded from 7.15 to 7.17.
* Java upgraded from  11 to 17.
* springboot upgraded from 2.4.8 to 2.6.4.
* camundaKeycloak upgraded from 2.2.1 to 2.2.3.
* camundaConnect upgraded from 7.15.0 to 1.5.0.
* camundaMail upgraded from 1.2.0 to 1.3.0.
* Environment variables modified `BPM_BASE_URL` to `BPM_API_URL`.
* formUrl parameter is changed to webFormUrl in DMN template.



`Removed`

**forms-flow-web**

* Removed View submissions button from reviewer form list and view submissions route.
* Removed the environment variables `CLIENT_ROLE_ID`, `DESIGNER_ROLE_ID`, `REVIEWER_ROLE_ID`,`ANONYMOUS_ID`, `USER_RESOURCE_ID`.
* Removed the environment variable `FORMIO_JWT_SECRET`.


`Generic Changes`

* Docker-compose files changed to single one.
* Added CI/CD pipeline.
* Environment variables updated with dynamic role-id fetching.
* Added new detailed documentation, checkout [here](https://aot-technologies.github.io/forms-flow-ai-doc).
## 4.0.6 - 2022-07-19

`Fixed`

**forms-flow-web**
* Fixed public form authentication check.

`Modified`

**forms-flow-data-analysis-api**

* Modified DataAnalysis API and Sentiment-analysis Jobs.

## 4.0.5 - 2022-04-19

`Added`

**forms-flow-web**

* Added `anonymous user` feature .
* Added count for Filter Tasks .
* Added form list page search and sort.
* Added new UI for task variable.
* Added form name as part of filename when downloaded.
* Added the status of the earlier version as inactive when a new version of the form is created/deleted.
* Added submitter name in the application history table.
* Added Cancel button for form edit.
* Added task variable in tasklist page at LHS.
* Added CD pipeline.

**forms-flow-api**

* Added public application create api for anonymous forms.
* Added migration scripts in the alembic file to resolve schema conflicts while db upgrade and downgrade, check out [here](./forms-flow-api/migrations/versions/80b8d5e95e9b_set_modification_date_on_create.py).
* Added new api for updating user locale attribute in Keycloak with the help of Keycloak admin API.
* Added form list page search and sort.
* Added CD pipeline.
* Added DB changes to accomodate task variable. 

**forms-flow-data-analysis-api**

* Added DataAnalysis API and Sentiment-analysis Jobs.

**forms-flow-idm**

* Added `manage-users` group to assigned client roles in realm-management.Check out the details at Service Accounts Tab from [here](./forms-flow-idm/keycloak/README.md#create-a-forms-flow-bpm-client).
* Added project specific custom login theme , check out the steps [here](./forms-flow-idm/keycloak/README.md#add-custom-login-theme).


**forms-flow-bpm**

* New (Task / Execution) Listener FormBpmFilteredDataPipelineListener Included for the effective form to bpm data copy.
* Added CD pipeline.

`Fixed`

**forms-flow-web**

* Uploaded forms cannot submit by client issue fixed .
* Application not getting in iOS issue fixed.
* Fixed process variable's data type in task filter.


**forms-flow-api**

* Postgres schema upgraded to enable updating the workflow after publising the form 
* Disabled internal workflows for  process API.

**forms-flow-bpm**

* Security context/authorization was not propogated to web-client while enabling asynchronous continutaion/intermediate timer events.
* Many minor performance optimizations and fixes are done.


`Modified`

**forms-flow-web**

* Modified application name search with lowercase and by intermediate search.
* Front-end support for the form process mapper versioning and database normalization.
* User is not be able to change the workflow of published form.
* Form Url support both pathname and formid to fetch the form.

**forms-flow-api**

* API support for application name search with lowercase and by intermediate search.
* Postgres database normalization and provided support for form process mapper versioning.

*Upgrade notes:*

`KEYCLOAK_BPM_CLIENT_SECRET` is not mandatory.
 Due to the architectural changes to the Postgres database, it is recommended to back up the data before the upgrade.

**forms-flow-bpm**

*Upgrade notes:*

`KEYCLOAK_BPM_CLIENT_SECRET` is not mandatory.


`Removed`

**forms-flow-web**

* Removed 'PDF' from display as option while creating form as designer.

**forms-flow-api**

*Upgrade notes:*

Environment variables `KEYCLOAK_ADMIN_USERNAME` and `KEYCLOAK_ADMIN_PASSWORD` are  removed since now the 
   admin APIs are accessed using the service account.
   
**forms-flow-bpm**

* FormAccessTokenCacheListener is deprecated ,will be removed from the codebase in the upcoming releases.
* formio-access-token.bpmn workflow is permanently removed from the codebase.

*Upgrade notes:*

* For the upgrading user's formio-access-token.bpmn workflow should be manually stopped and deleted using these instructions [from here](https://docs.camunda.org/manual/7.8/reference/rest/process-definition/delete-process-definition/).


`Generic Changes`

* Added docker based automated installation. For installation guide, check out [here](./deployment/docker/bundle).
* Existing users should build forms-flow-bpm,forms-flow-webapi and forms-flow-web together.

## 4.0.4 - 2021-12-27

`Added`

**forms-flow-bpm**

* Added test cases and code coverage.

*Upgrade notes:*

New environment variables `DATA_BUFFER_SIZE`, `IDENTITY_PROVIDER_MAX_RESULT_SIZE`.

**forms-flow-web**

* Admin page to map insights dashboards to keycloak groups.
* Added test cases and code coverage, check out the [details here](./forms-flow-web/README.md#code-coverage).

*Upgrade notes:*

New environment variables `FORMIO_JWT_SECRET`. It's highly recommended to change this environment variable for existing installations.

**forms-flow-api**

* Added `pagination`, `sorting` and `filtering` for Application Page.
* Added new APIs which acts as a gateway for calling forms-flow-analytics APIs.
* Added new API for modifying group details in Keycloak with the help of Keycloak admin APIs.
* Add application status list API.
* Added unit test cases and new script for CI operations.

*Upgrade notes:*

New environment variables `KEYCLOAK_ADMIN_USERNAME`, `KEYCLOAK_ADMIN_PASSWORD`, `INSIGHT_API_URL`, `INSIGHT_API_KEY`.


**forms-flow-analytics**

* Added Dashboard authorisation at Redash dashboard level.

**forms-flow-forms**

* Added indexes in Submission collection for applicationId, process_pid.
* Added authentication for publicly exposed urls.

*Upgrade notes:*

New environment variables `FORMIO_JWT_SECRET`. It's highly recommended to change this environment variable for existing installations.

**forms-flow-idm**

* Added new groups and mapper for Dashboard authorisation at Redash dashboard level.

*Upgrade notes:*

* To enable dashboards, and provide authorization the following changes are required in existing installations:

1. Create a new main group called `formsflow-analytics`, and create as many subgroups as you want to associate various dashboards from Admin UI(in Designer)
2. Create a new mapper under forms-flow-web client in Keycloak, by following below steps:

```
* Name = dashboard-mapper
* Mapper Type = User Attribute
* User Attribute = dashboards
* Token Claim Name = dashboards
* Add to ID Token = ON
* Add to access token = ON
* Add to userinfo = ON
* Multivalued = ON
* Aggregate attribute values = ON
* Click Save
```

3. Corresponding to each user, add the dashboard-groups you want to enable for dashboard authorization.
This will give users permission to as many dashboards which the group have been enabled with from Admin.

`Fixed`

**forms-flow-api**

* Fixed application metrics showing incorrect results by changing date to filtered based on timezone.

**forms-flow-bpm**

* Improved token creation logic using Oauth2RestTemplate.
* Code cleanup and optimization.

**forms-flow-web**

* Fixed total task count shown on the task LHS side and updated only after refreshing the page.
* Tasklist API updated.

`Modified`

**forms-flow-web**

*Upgrade notes:*

Removed environment variables `INSIGHT_API_URL`, `INSIGHT_API_KEY`

`Solution Component Upgrades`

**forms-flow-bpm**

* Camunda upgrade from `7.13.0` to `7.15.0`. 
* Upgraded springboot from `2.4.2` to `2.4.8`
* Upgraded spring-security-oauth2 from `2.4.2` to `2.4.8`

*Upgrade notes:*

After v4.0.4 version upgrade, Run the migrations with [upgrade file](./forms-flow-bpm/upgrade/process-engine_7.13_to_7.15.sql).

**forms-flow-analytics**

* Upgraded redash library to version from `9.0.0-beta` to `10.1.0`

*Upgrade notes:*

After v4.0.4 version upgrade, run the following command first to run the necessary migrations with the command:

```
docker-compose -f docker-compose-linux.yml run --rm server manage db upgrade
docker-compose -f docker-compose-linux.yml up --force-recreate --build
```
In case you want to downgrade to the v9.0-beta of forms-flow-analytics component after formsflow.ai version upgrade.
To update the migrations and rebuild formsflow.ai. Use [the below commands which was used in setup](./forms-flow-analytics/README.md/#running-the-application). 
Also note that we are not supporting downgrade to any version below Redash v9.0(which has be used from formsflow.ai v4.0 onwards).

**forms-flow-forms**

* Formio upgrade from `2.0.0-rc.34` to `2.3.0`.

`Known Issues`

* In case you are facing mongodb connection refused error for forms-flow-forms, downgrade to the next lowest mongo stable [version](https://docs.mongodb.com/manual/release-notes/)
* Consoles related to <http://localhost:3001/current> Api Failing. The console messages can be ignored. Please refer to [Issue-#106](https://github.com/AOT-Technologies/forms-flow-ai/issues/106) for more details.

## 4.0.3 - 2021-10-22

`Added`

**forms-flow-bpm**

* Added new postman collections for camunda API.
* Runtime logger level updation

**forms-flow-web**

* Added upload/download forms feature.
* Added a feature to search submissions in metrics based on created or modified date range.

**forms-flow-api**

* Better logging for Python API including coloured logs and API time details.
* Add pessimistic Database disconnection handling mechanism.

`Fixed`

**forms-flow-bpm**

* Fixed the issue of Oauth2 RestTemplate was recreating each time, so the session was getting created so many times.
* Exception handling & Retry for External form submission listener in ExternalFormSubmissionListener
* Usage issue fixed with ApplicationAuditListener.

**forms-flow-analytics**

* Resolve analytics component breaking due to [SIGSEV Memory issue](https://github.com/AOT-Technologies/forms-flow-ai/issues/149).

**forms-flow-web**

* Fixed server side pagination for `Task` page.
* Fixed Items per page dropdown in the form page for designer.

`Modified`

**forms-flow-bpm**

* Upgraded Camunda BPM Identity Keycloak to 2.2.1

**forms-flow-api**

* Add orderBy field to `metrics` API to display API based on created date and modified date.
* Changed default timezone to UTC time instead of being set as users local time.

**forms-flow-web**

* Footer was modified to display formsflow.ai with the version number.
* Optimized task list page by limiting the number of backend calls.

## 4.0.2 - 2021-07-23

`Added`

**forms-flow-bpm**

* Added task listener events as configurable one's in application property. New property added is websocket.messageEvents .

`Fixed`

**forms-flow-analytics**

* Fixed the issue of new datasource failing on creating.

**forms-flow-bpm**

* Approver action dropdown appearing on the clerk's task section once the approver returns the form is fixed for the `New Business License Application form`.

**forms-flow-idm**

* Removed additional parameters from the default configuration, which was causing keycloak import to fail in v11.0.

**forms-flow-web**

* Fixed in the `Tasks` section on completing a particular task, the task list is not being removed from LHS.
* Solution vulnerability fixes.
* Resolved the issue of form data is not being updated from cache on claiming the form.
* Identified & removed redundant calls on updating the task details.

`Modified`

**forms-flow-api**

* Rename Application Audit to Application History(without affecting database table).
* Removed Sentiment Analysis component and database, which will be separate micro-service in upcoming release.

**forms-flow-bpm**

* Refined the keycloak group query to improve API performance.
* Formio Access Token Cache (Internal) workflow is modified to start after deployment and added scripts for cleanup.

**forms-flow-web**

* Application status component created as a hidden element by default during form design.

`Generic Changes`

* Added gitter community

## 4.0.1 - 2021-07-13

`Added`

**forms-flow-api**

* Support for allowing CORS with multiple comma-separated origins.
* Added authorization on the application details page based on user roles.

**forms-flow-bpm**

* Added new workflows - `One-Step Approval Process` and `Two-Step Approval Process`.

**forms-flow-forms**

* Added new forms- `Create New Business License Application` and `Freedom of Information and Protection of Privacy`.

**forms-flow-web**

* Show/hide Application Menu based on keycloak group.
* Show/hide View Submissions button in form webpage based on keycloak group.
* Add 404 page.
* Add 403 page.

`Fixed`

**forms-flow-analytics**

* Fixed the failing installation of the analytics component.

**forms-flow-api**

* Fix application details API not displaying values to client users.
* Fixed the issue of not creating applications when called from the BPM side with process-instance-id.

**forms-flow-bpm**

* Fix done for authentication issue with Keycloak in the Keycloak configuration.
* Fix done for single result query fetching multiple record's during formio REST call.

**forms-flow-web**

* Resolve Last Modified column on the client Application page is not working.
* Fix Application search icons breaking.
* Resolve Mime type issue in the webpage.

`Modified`

**forms-flow-bpm**

* formio token generation cycle reduced from 24 hours to 3.50 Hours.
* Modified checked exception's on Listener services to Runtime exception.
* Modified application logging package to Camunda base package level.

**forms-flow-web**

* Modify WebSocket implementation to support reconnection in Task Menu.
* Footer was modified to display formsflow.ai with the version number.

`Generic Changes`

* Improved the README to document supported version for Keycloak.
* Updated [usage docs](./USAGE.md) with the latest form and workflow.
* v1.0.7 release for `camunda-formio-tasklist-vue`,a Vue.js-based package for easy integration of formsflow.ai to existing projects. To know more details checkout [formsflow-ai-extension repository](https://github.com/AOT-Technologies/forms-flow-ai-extensions/tree/master/camunda-formio-tasklist-vue)

`Known Issues`

* Consoles related to <http://localhost:3001/current> Api Failing. The console messages can be ignored. Please refer to [Issue-#106](https://github.com/AOT-Technologies/forms-flow-ai/issues/106) for more details.

## 4.0.0 - 2021-06-11

`Added`

* Added support for http calls which introduces the ability to make http calls across components for quicker and easier setup. Earlier versions required SSL support which required a lot of time and effort to setup, with a need for Keycloak server with SSL support.
* User can *claim/view* the Tasklist in realtime. It provides live updates to tasks, allowing teams to collaborate on a single task list in real time. Used websockets support under the hood to make real time communication(component: forms-flow-web, forms-flow-bpm)
* Automated installation steps for keycloak setup. It provides a bundled, pre-configured keycloak package for a local setup to simplify the installation process
* Automated manual steps for resource id generation, included batch and shell scripts to simplify the process.
* New UI for formsflow.ai based on Vue.js for easy integration of formsflow.ai to existing projects. To know more details checkout [formsflow-ai-extension repository](https://github.com/AOT-Technologies/forms-flow-ai-extensions/tree/master/camunda-formio-tasklist-vue) and to install our [NPM package go here](https://www.npmjs.com/package/camunda-formio-tasklist-vue).(component: forms-flow-ai-extensions)
* New API for health check has been included. (component : forms-flow-api)
* Added confirmation messages to notify the users on save actions. (component: forms-flow-web)
* Users can click on External shared links (eg. from email) to get redirected to a particular task/submission/form if the user has right permissions. (component: forms-flow-web)
* Claiming of tasks are restricted to users belonging to reviewer group(formsflow/formsflow-reviewer) of keycloak.(component: forms-flow-web)
* Application/Submission view for client role users are restricted to own submission view.(component: forms-flow-bpm, forms-flow-web)
* Added Semantic UI css for forms design (component: forms-flow-web)
* Listeners are well-documented with information on purpose, how-it-works and how-to-use (component : forms-flow-bpm) [Link](./forms-flow-bpm/starter-examples/listeners/listeners-readme.md)
* Support to associate an unique form at every manual task in workflow process (Component: forms-flow-bpm)

`Modified`

* Task dashboard has been revamped with new look and feel- which would allow more control on data and stream updates.
* Enhanced Form Process Mapper API and Application API endpoints (component : forms-flow-api)
* Improved exception handling of python to provide meaningful error messages (component : forms-flow-api)
* Improved README for better readability and easy installation.
* The Task menu has been moved to Header section. In Task Section, filters are available in the main menu and a new Dashboard section has been added which includes metrics and Insights. (component: forms-flow-web)
* Dynamic property to set Application Name and logo in the header. (component: forms-flow-web)
* Default route for user having reviewer role is pointed to tasks page and that of client/designer is to forms page.(component: forms-flow-web)
* Removed *edit/delete* submission buttons from submission list view of reviewers.

`Fixed`

* Cosmetic changes to show success message after loading is completed.
* Custom component (Text Area with analytics) not retaining the value after submission. (component: forms-flow-forms)
* UI layout fixes (component: forms-flow-web)

`Solution Component Upgrades`

* React library upgraded to latest version-17.0.2 and fixed security vulnerabilities (Component : forms-flow-web)
* Spring boot upgraded to latest version-2.4.2 (Component : forms-flow-bpm)
* Redash upgraded to latest version:v9 (component : forms-flow-analytics)
* Fixed Python security vulnerabilities and updated flask to 1.1.4 version (component : forms-flow-api)
* Fixed Form.io security vulnerabilities. (component : forms-flow-forms)

`Known Issues`

* Consoles related to <http://localhost:3001/current> Api Failing. The console messages can be ignored. Please refer to [Issue-#106](https://github.com/AOT-Technologies/forms-flow-ai/issues/106) for more details.

## 3.1.0 - 2020-12-17

`Modified`

* Formio upgraded to latest version-2.0.0.rc34 (Component : forms-flow-forms)
* In application & task dashboard, the process diagram navigation is highlighted on the diagram (Component : forms-flow-web)
* Made cosmetic changes to menu icons (Component: forms-flow-web)
* Update on swagger documentation (Component: forms-flow-api)
* For the designer's edit scenario, by default the workflow selection & association is rendered as read-only with an option to toggle and edit(Component: forms-flow-web)

`Untested Features`

* Support to associate an unique form at every manual task in workflow process (Component: forms-flow-bpm)

`Fixed`

* Support to access forms-flow-ai solution in mobile(Component: forms-flow-web)
* Forms flow Edit/submission Routing Fix for User with Multiple Role (Component: forms-flow-web)

`Upcoming Features`

* Refactoring python api to use module *flask-resk-jsonapi* (Component: forms-flow-api)
* Enhanced sorting, searching and pagination  (Component: forms-flow-web)

`Known Issues`

* Custom component (Text Area with analytics) not retaining the value after submission
* Cosmetic changes to show success message after loading is completed

## 3.0.1 - 2020-10-08

`Modified`

* In application dashboard, the "Application Status" column search component has been enhanced to show all possible values in dropdown (Component : forms-flow-web)
* In application dashboard, the button label has been modified to show as "Acknowledge" for status "Awaiting Acknowledgement" (Component : forms-flow-web)

## 3.0.0 - 2020-10-07

`Added`

* Logo & UI Styling
* Introduced Applications menu
* Versioning of form submissions
* Task menu - Process Diagram, Application History
* UI for configuration of forms with workflow (Designer)
* Custom component `Text Area with analytics` (with configurable topics)
* Sentiment analysis API using nltk and spacy

`Known Issues`

* Custom component (Text Area with analytics) not retaining the value after submission
* Cosmetic changes to show success message after loading is completed

## 2.0.1 - 2020-07-27

`Added`

* This file (CHANGELOG.md)
* CONTRIBUTING.md

## 2.0.0 - 2020-07-24

`Added`

* ReDash implementation under forms-flow-analytics
* Deployment folder with docker and nginx
* formsflow.ai UI task dashboard
* formsflow.ai UI metrics dashboard
* Single component installations with docker and docker-compose
* Native windows intallation docker-compose-windows.yml  
* Native Linux installation docker-compose-linux.yml

`Removed`

* forms-flow-db folder

`Changed`

* All README.md files cleaned up throughout project
* Environment variables rationalised and renamed to be globally generic

## 1.0.0 - 2020-04-15

`Added`

* Initial release
