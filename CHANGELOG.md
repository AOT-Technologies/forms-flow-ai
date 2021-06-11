# Changelog for formsflow.ai
Mark  items as `Added`, `Changed`, `Fixed`, `Removed`, `Untested Features`, `Upcoming Features`

## 4.0.0 - 2021-06-11

`Added`
* Added support for http calls.
* User can claim/view tasklist in realtime.
* Automated installation steps for keycloak setup.
* Automated manual steps for resource id generation, included batch / shell scripts to simplify the process. 
* New UI for formsflow.ai based on Vue.js for easy integration of formsflow.ai to existing projects. 
* New API for health check point (component : forms-flow-api)
* Added toast message in Form Save,Submission Save and Form-Workflow Association.
* Users can click on External shared link like in email to get redirected to a particular task/submission/form if the user has right permissions.(component: forms-flow-web)
* Claiming of tasks are restricted to users belonging to reviewer group(formsflow/formsflow-reviewer) of keycloak.(component: forms-flow-web)
* Application/Submission view for client role users are restricted to own submission view.(component: forms-flow-bpm, forms-flow-web)
* Added Semantic UI css for forms design (component: forms-flow-web)
   
`Modified`
* Task dashboard has been revamped with new look and feel- which would allow more control on data and stream updates.
* React library upgraded to latest version-17.0.2 and fixed security vulnerabilities (Component : forms-flow-web)
* Spring boot upgraded to latest version-2.4.2 (Component : forms-flow-bpm)
* Redash upgraded to latest version:v9 (component : forms-flow-analytics)
* Fixed Python security vulnerabilities and updated flask to 1.1.4 version (component : forms-flow-api)
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

`Known Issues`
* Consoles related to http://localhost:3001/current Api Failing. Please refer to [Issue-#106](https://github.com/AOT-Technologies/forms-flow-ai/issues/106) for more details
   
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






