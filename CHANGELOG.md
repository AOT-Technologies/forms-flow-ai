# Changelog for formsflow.ai
Mark  items as `Added`, `Changed`, `Fixed`, `Removed`, `Untested Features`, `Upcoming Features`

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
* Consoles related to http://localhost:3001/current Api Failing. The console messages can be ignored. Please refer to [Issue-#106](https://github.com/AOT-Technologies/forms-flow-ai/issues/106) for more details.

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
* Consoles related to http://localhost:3001/current Api Failing. The console messages can be ignored. Please refer to [Issue-#106](https://github.com/AOT-Technologies/forms-flow-ai/issues/106) for more details.
   
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






