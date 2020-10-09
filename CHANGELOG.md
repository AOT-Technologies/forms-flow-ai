# Changelog for formsflow.ai
Mark  items as `Added`, `Changed`, `Fixed`, `Removed`
## Unreleased
`Added`
* Openshift deployment

## Future Release
* Render the form workflow association in readonly and give option to edit
* Show  task navigation in workflow diagram
* Support to access formsflow.ai solution in mobile

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






