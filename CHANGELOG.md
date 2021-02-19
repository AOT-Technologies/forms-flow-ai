# Changelog for formsflow.ai
Mark  items as `Added`, `Changed`, `Fixed`, `Removed`, `Untested Features`, `Upcoming Features`

## 4.0.0-alpha - 2021-02-19
`Ongoing`
* Task dashboard has been revamped with new look and feel; which would allow more control on data and stream updates.

`Added`
* forms-flow-bpm has been enhanced with listed features,  
   1. JDBC session management.
   2. Support to capture the form data as audit in any relational database of interest.
   3. Health check API
   4. Upgrade of sprint boot version
   
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






