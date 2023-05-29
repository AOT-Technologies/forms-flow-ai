# Kafka Producer Listener 

**org.camunda.bpm.extension.hooks.listeners.execution.KafkaProducerListener**

This component can be used on any event of execution listener.  Upon configuration, it will send message to Kafka bootstrap server.

## Table of Content
* [Type](#type)
* [How it Works](#how-it-works)
* [How to Use](#how-to-use)

## Type

Execution Listener

### How it Works

This component reads the field injection properties and sends kafka message based on the property values.

This component relies on listed parameters. 

a. bootstrap_servers_config [Mandatory = Yes]  
b. messageKey [Mandatory = Yes]  
c. messageValue [Mandatory = Yes]  
c. topic_name [Mandatory = Yes]  

- bootstrap_servers_config (Field Injection of type expression or String): A list of host/port pairs to use for establishing the initial connection to the Kafka cluster..
- messageKey (Field Injection of type expression or String): Message key.  
- messageValue (Field Injection of type expression or String): Message value.   
- topic_name (Field Injection of type expression or String): Topic name where the message key-value pair will be sent.

### How to Use

Below snapshot shows how to configure the **KafkaProducerListener** to an execution. 

![Kafka Producer Listener - Snapshot](./images/kafkaproducer-snp1.jpg)

