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
 `FormBPMDataPipelineListener`| Task/Execution Listener |This component can be used on any event of task/execution listener. It is used for populating formio data into CAM Variables | Refer [link](./formdatapipeline-readme.md )
 `BPMFormDataPipelineListener`| Task/Execution Listener |This component can be used on any event of task/execution listener. This calculates and set DUE DATE in business days. | Refer [link](./taskdurationattributes-readme.md )
        