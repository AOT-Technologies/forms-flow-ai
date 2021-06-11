# Form Access Token Cache Listener 

**org.camunda.bpm.extension.hooks.listeners.execution.FormAccessTokenCacheListener**

This component intended to run **ONLY** with the dedicated token cache process **formio-access-token.bpmn**.
It generates and stores the formio token as variable in global scope.

## Table of Content
* [Type](#type)
* [How it Works](#how-it-works)
* [How to Use](#how-to-use)

## Type

Execution Listener

### How it Works

This **formio-access-token.bpmn** is designed to run every day at 10pm. It generates and stores the formio token as variable in global scope.
The stored token will be used by all running instances. 

### How to Use

Below snapshot shows how **FormAccessTokenCacheListener** is used in process **formio-access-token.bpmn**

![Form_Access_Token_Cache listener - Snapshot](./images/formaccesstokencache-listener-snp1.jpg)

