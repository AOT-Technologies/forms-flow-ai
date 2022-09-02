# Changelog for formsflow.ai

Mark  items as `Added`, `Changed`, `Fixed`, `Removed`, `Untested Features`, `Upcoming Features`, `Known Issues`
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
