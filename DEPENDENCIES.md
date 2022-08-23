# Dependencies Details

In the following document, we’ll describe the details of dependencies of various components in the **formsflow.ai** solution.

## 1. forms-flow-analytics

   To  build interactive dashboards and gain insights.

  | Component | Version|  
  | ---       | -----   |
  |  Redash   | 10.1.0 |

<br>

## 2. forms-flow-api

   REST API to formsflow.ai integration components

   | Component | Version |  
   | ---       | -----   |
   |  Python   |  3.9    |
   | Flask     |  1.1.4  |
   |  Postgres |  11.0   |

  <br>
  
## 3. forms-flow-bpm

   For workflow and decision automation<br>

   | Component | Version|  
   | ---       | -----  |
   |  Camunda  |  7.17|
   |  SpringBoot  | 2.6.4 |
   | Postgres    | Latest |
  <br>
  
## 4. forms-flow-forms

   To  build data management applications<br>

   | Component | Version|  
   | ---       | -----   |
   |   Formio | 2.4.1 |
   |   Mongo | 5.0 |
   <br>

## 5. forms-flow-idm

   Identity Management<br>

   | Component | Version|  
   | ---       | -----   |
   | Keycloak   | 7.0  and above   |
   <br>

#### NOTE

* If you are using keycloak version **11.0 and above**, you can use the keycloak import script  [mentioned here](https://github.com/AOT-Technologies/forms-flow-ai/blob/master/forms-flow-idm/keycloak/imports/formsflow-ai-realm.json) .
* If you are in keycloak version **7.0 and above**, refer our [guide](https://github.com/AOT-Technologies/forms-flow-ai/blob/master/forms-flow-idm/keycloak/README.md#create-realm) on how to manually setup keycloak roles/users .
   <br>

## 6. forms-flow-web

   Delivers progressive web application<br>

   | Component | Version |
   |  --- | --- |
   | React  | 17.0.2 |
   |  Formio | 2.4.1 |
   <br>
