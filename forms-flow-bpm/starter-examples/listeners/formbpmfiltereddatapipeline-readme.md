# Form BPM Filtered Data Pipeline Listener 

**org.camunda.bpm.extension.hooks.listeners.FormBPMFilteredDataPipelineListener**

This component can be used on any event of task/execution listener.  Upon configuration, it copies specific data from form (formio) to camunda variables.

## Table of Content
* [Type](#type)
* [How it Works](#how-it-works)
* [How to Use](#how-to-use)

## Type

Task/Execution Listener

### How it Works

This component identifies the variables from the webapi configuration and copy only those variables from form (formio) to camunda variables.

### How to Use

Below snapshot shows how to configure the **FormBPMFilteredDataPipelineListener** to an execution. 

![Form DataFilteredPipeline listener - Snapshot](./images/formbpmfiltereddatapipeline-listener-snp1.png)