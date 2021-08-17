# Dependencies Details
In the following document, we’ll describe the details of dependencies of various components in the formsflow.ai solution.

* 1. [forms-flow-analytics](./forms-flow-analytics)<br><br>
      *  **formsflow.ai** leverages [Redash](https://redash.io) to build interactive dashboards and gain insights.<br><br>
           * *Version* : ![Redash](https://img.shields.io/badge/Redash-v9(master)-blue) <br><br>
* 2. [forms-flow-api](./forms-flow-api)<br><br>
        * REST API to formsflow.ai integration components<br>
        * Built using using [Python](https://www.python.org/) <br><br>
           * *Versions* :
                * ![Python](https://img.shields.io/badge/python-3.8-blue)
                * ![Flask](https://img.shields.io/badge/Flask-1.1.4-blue)
                * ![postgres](https://img.shields.io/badge/postgres-11.0-blue)
*  3. [forms-flow-bpm](./forms-flow-bpm) <br><br>
        * **formsflow.ai** leverages [Camunda]( https://camunda.com/) for workflow and decision automation<br><br>
           * *Versions* :
                * ![Camunda](https://img.shields.io/badge/Camunda-7.13.0-blue)  
                * ![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.2.7.RELEASE-blue)  
                * ![postgres](https://img.shields.io/badge/postgres-latest-blue)  
*  4. [forms-flow-forms](./forms-flow-forms) <br><br>
       *  **formsflow.ai** leverages [form.io](https://www.form.io/opensource) to build "serverless" data management applications<br><br>
           *  *Version* :
                * ![Formio](https://img.shields.io/badge/formio-2.0.0--rc.34-blue)<br><br>
*  5. [forms-flow-idm](./forms-flow-idm)<br><br>
       * Identity Management
       * To date, we have only tested [Keycloak](https://www.keycloak.org/)<br><br>
*  6. [forms-flow-web](./forms-flow-web) <br><br>
       * **formsflow.ai** delivers progressive web application<br><br>
          *  *Versions* :
                * ![React](https://img.shields.io/badge/React-17.0.2-blue) and `create-react-app`
                * ![Formio](https://img.shields.io/badge/formio-2.0.0--rc.34-blue)

 
