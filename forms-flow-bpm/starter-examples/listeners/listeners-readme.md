# forms-flow-bpm Listeners

This page elaborates on customization and listeners created for use.
 
## Table of Content
* [Listeners](#listeners)


## Listeners

   Name | Type | How it Works | How to Use |
 --- | --- | --- | ---
 `FormConnectorListener`| Task Listener |This component can be used on **CREATE** event of task listener. This serves to associate a form with task.  | Refer [link](./formconnector-readme.md )
 `NotifyListener`| Task Listener |This component can be used on **CREATE** event of task listener; and sends email upon task creation. | Refer [link](./notify-readme.md )
 `TaskDurationAttributesListener`| Task/Execution Listener |This component can be used on any event of task/execution listener. This calculates and set DUE DATE in business days. | Refer [link](./taskdurationattributes-readme.md ) 
 `ApplicationAuditListener`| Task/Execution Listener |This component to be used on any event of task or execution. Upon configuration, this send value from cam variables: "applicationStatus" and "formUrl" to formsflow.ai system for capturing audit. | Refer [link](./applicationaudit-readme.md )
 `ApplicationStateListener`| Task/Execution Listener |This component can be used on any event of task/execution listener.  Upon configuration it takes care of <br/>1. Syncing formsflow.ai system' with the active status from camunda.   <br/>2. Send value from cam variables: "applicationStatus" and "formUrl" to formsflow.ai system for capturing audit. | Refer [link](./applicationstate-readme.md )
 `FormBPMDataPipelineListener`| Task/Execution Listener |This component can be used on any event of task/execution listener. It is used for populating formio data into CAM Variables. | Refer [link](./formbpmdatapipeline-readme.md )
 `BPMFormDataPipelineListener`| Task/Execution Listener |This component can be used on any event of task/execution listener. It is used for populating CAM Variables into formio data.  | Refer [link](./bpmformdatapipeline-readme.md )
 `ExternalSubmissionListener`| Execution Listener |This component allows direct integration from any external system and does offline sync-up within formsflow.ai i.e creates submission in formio.| Refer [link](./externalsubmission-readme.md )
 `FormAccessTokenCacheListener`| Execution Listener |This component intended to run **ONLY** with the dedicated token cache process **formio-access-token.bpmn**.It generates and stores the formio token as variable in global scope. | Refer [link](./formaccesstokencache-readme.md )
 `EmailAttributesListener`| Execution Listener |This component intended to run **ONLY** with the process **notification_email.bpmn** & "email-template.dmn" or any similar notification processes.It replaces all reserved identifier **@{variable}** with values in email body. | Refer [link](./emailattributes-readme.md )
 `TimeoutNotifyListener`| Task Listener |This component sends an email reminder a day before task due date, and escalation email on the day after due date.| Refer [link](./timeoutnotification-readme.md )
          