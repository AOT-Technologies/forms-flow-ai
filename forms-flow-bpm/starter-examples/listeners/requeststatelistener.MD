# Request State Listener 

**org.camunda.bpm.extension.hooks.listeners.RequestStateListener**

This component can be used on any event of task or execution. Upon configuration, this send value from cam variables: "requestType", "requestStatus" and "formUrl" to formsflow.ai system for capturing audit.

NOTE: To be used, only when to create requests under a bundle.

## Table of Content
* [Type](#type)
* [How it Works](#how-it-works)
* [How to Use](#how-to-use)

## Type

Task/Execution Listener

### How it Works

This invokes the REST endpoint of application history **application/{id}/history**  with data from cam variables: "requestType", "requestStatus" and "formUrl".

The component is dependent on listed variables from camunda context,
1. requestType 
2. requestStatus
3. formUrl

### How to Use

Below snapshot shows how to configure the **RequestStateListener** to a task. 

![image](https://user-images.githubusercontent.com/85665463/230157498-7fdbda43-923a-4648-86fa-d825423bb6cc.png)


   
