# DEPLOYMENT
In the following document, we’ll describe about the various steps involved in deployment.

## Table of Contents
1. [Summary](#summary)
2. [Project Dependencies](#project-dependencies)
3. [Application Setup](#application-setup)
4. [Deployment For New Users](#deployment-for-new-users)
    * [Download the formsflow.ai](#download-the-formsflowai)
5. [Deployment For Existing Users](#deployment-for-existing-users)


## Summary

Deployment includes all of the steps, processes, and activities that are required to make a software system or update available to its intended users.

## Project Dependencies

- [Keycloak](https://www.keycloak.org/) (included under ../.forms-flow-idm/keycloak)
- [form.io](https://www.form.io/opensource) (included under ../.forms-flow-forms)
- [Camunda](https://camunda.com/) (included under ../.forms-flow-bpm)
- [Redash](https://redash.io) (included under ../.forms-flow-analytics)
- [Python](https://www.python.org/) (included under ../.forms-flow-api)
- *Optional*: [Nginx](https://www.nginx.com) (included under ./deployment/nginx) 

## Application Setup

* The application will be installed in the following order.
* Some of the services have dependencies, mentioned below.

 Srl No | Service Name | Usage | Access | Dependency | Details |
--- | --- | --- | --- | --- | ---
1|`Keycloak`|Authentication|`http://localhost:8080`||[Keycloak](../../../forms-flow-idm/keycloak/README.md)
2|`forms-flow-forms`|form.io form building. This must be started earlier for resource role id's creation|`http:/localhost:3001`||[forms-flow-forms](../../../forms-flow-forms/README.md)
3|`forms-flow-analytics`|Redash analytics server, This must be started earlier for redash key creation|`http://localhost:7000`|`Keycloak`|[forms-flow-analytics](../../../forms-flow-analytics/README.md)
4|`forms-flow-web`|formsflow Landing web app|`http://localhost:3000`|`Keycloak`, `forms-flow-forms`, `forms-flow-analytics`|[forms-flow-web](../../../forms-flow-web/README.md)
5|`forms-flow-api`|API services|`http://localhost:5000`|`Keycloak`|[forms-flow-api](../../../forms-flow-api/README.md)
6|`forms-flow-bpm`|Camunda integration|`http://localhost:8000/camunda`|`Keycloak`|[forms-flow-bpm](../../../forms-flow-bpm/README.md)

## Deployment For New Users

### Download the formsflow.ai

* Clone this github repo:  https://github.com/AOT-Technologies/forms-flow-ai
* If deploying to a remote server, you can use nginx as a reverse proxy and SSL engine. To help you, follow the instructions in the nginx [README](../nginx/README.md)

* (One time ) Update the ssl keystore name and password in forms-flow-bpm/src/main/resources/application.yaml.
  
 ```camunda.bpm:
  history-level: audit
  authorization:
  enabled: true
  filter:
  create: All tasks
  webapp:
  application-path: /
  server:
  port: 8443
  ssl:
    key-store: file:/certs/keystore.ks
    key-store-password: password
    key-store-type: pkcs12
    key-alias: tomcat
    key-password: password
  servlet.context-path: /camunda
```

#####  Login to the server using ip.
```
ssh {your ip address}
```
#####  Navigate to forms-flow-ai directory.
```
homedir/ forms-flow-ai-/deployment/docker/
```
##### Clone the git with the url


### Installation Steps

These are the steps required to complete the installation and setup of formsflow.ai solution
- [ ] Keycloak setup
- [ ] forms-flow-analytics setup
- [ ] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup

> Make sure you have a Docker machine up and running.

#### Keycloak Setup
--------------------
```
- [x] Keycloak setup
- [ ] forms-flow-analytics setup
- [ ] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup
```
Follow the instructions given [here](../../../forms-flow-idm/keycloak/README.md)

#### forms-flow-analytics Setup
------------------------------
```
- [x] Keycloak setup
- [x] forms-flow-analytics setup
- [ ] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup
``` 
Start the **analytics server** by following the instructions given [here](../../../forms-flow-analytics/README.md)
   
#### forms-flow-forms Setup       
---------------------------
```
- [x] Keycloak setup
- [x] forms-flow-analytics setup
- [x] forms-flow-forms setup
- [ ] forms-flow-web, forms-flow-bpm, forms-flow-api setup
```

#### **NOTE:** Application .yml file can have updations fequently. So it should be upto date for efficient working.

> :information_source: Variables with trailing :triangular_flag_on_post: in below table should be updated in the .env file

 Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`FORMIO_DB_USERNAME`|Mongo Root Username. Used on installation, Choose your own||`admin`
`FORMIO_DB_PASSWORD`|Mongo Root Password. Used on installation, Choose your own||`changeme`
`FORMIO_DB_NAME`|Mongo Database  Name. Used on installation to create the database. Choose your own||`formio`
`FORMIO_DEFAULT_PROJECT_URL`:triangular_flag_on_post:|The URL of the forms-flow-forms server||`http://{your-ip-address}:3001`
`FORMIO_ROOT_EMAIL`|forms-flow-forms admin login|eg. admin@example.com|`admin@example.com`
`FORMIO_ROOT_PASSWORD`|forms-flow-forms admin password|eg.changeme|`changeme`
`FORMIO_JWT_SECRET`|forms-flow-forms jwt secret| |`--- change me now ---`
 


*  Follow the below steps for mapping the role IDs.   
   - Start the forms-flow-forms service.
       - Run `docker-compose up -d forms-flow-forms` to start.    
                   
*NOTE: Use --build command with the start command to reflect any future **.env** / code changes eg : `docker-compose up --build -d`*

For new Users go to the corresponding folder **/deployment/docker** and open **Sample.env** file.

Steps to Remember before changing the variables:
* Make sure your current working directory is "/forms-flow-ai/deployment/docker".
* Modify the environment variables in the newly created **sample.env** file if needed. 
* **NOTE** : {your-ip-address} given inside the **sample.env** file should be changed to your host system IP address.

##### formsflow.ai keycloak variable settings
   
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`KEYCLOAK_URL`:triangular_flag_on_post:| URL to your Keycloak server || `http://{your-ip-address}:8080`
`KEYCLOAK_URL_REALM`|The Keycloak realm to use|eg. forms-flow-ai | `forms-flow-ai`
`KEYCLOAK_ADMIN_USERNAME` :triangular_flag_on_post: | The admin username for Keycloak. This is used for using Keycloak internal APIs  | | |
`KEYCLOAK_ADMIN_PASSWORD` :triangular_flag_on_post: | The admin password for Keycloak. | | |
`KEYCLOAK_BPM_CLIENT_ID`|Client ID for Camunda to register with Keycloak|eg. forms-flow-bpm|`forms-flow-bpm`
`KEYCLOAK_BPM_CLIENT_SECRET`:triangular_flag_on_post:|Client Secret of Camunda client in realm|eg. 22ce6557-6b86-4cf4-ac3b-42338c7b1ac12|must be set to your Keycloak client secret. Follow the 'Get the keycloak client secret' steps from [Here](../../../forms-flow-idm/keycloak/README.md#get-the-keycloak-client-secret)
`KEYCLOAK_WEB_CLIENT_ID`|Client ID for formsflow.ai to register with Keycloak|eg. forms-flow-web|`forms-flow-web`

##### formsflow.ai analytics variable settings
  
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`INSIGHT_API_URL`:triangular_flag_on_post:|Insight Api base end-point||`http://{your-ip-address}:7000`
`INSIGHT_API_KEY`:triangular_flag_on_post:|API_KEY from REDASH|eg. G6ozrFn15l5YJkpHcMZaKOlAhYZxFPhJl5Xr7vQw| `Get the api key from forms-flow-analytics (REDASH) by following the 'Get the Redash API Key' steps from `[here](../../../forms-flow-analytics/README.md#get-the-redash-api-key)

##### formsflow.ai camunda variable settings
    
 Variable name | Meaning | Possible values | Default value |
 --- | --- | --- | ---
 `APP_SECURITY_ORIGIN`|CORS setup, for multiple origins you can separate host address using a comma |eg:`host1, host2`| `*` 
 `CAMUNDA_APP_ROOT_LOG_FLAG`|Log level setting||`error` 
 `DATA_BUFFER_SIZE`|Configure a limit on the number of bytes that can be buffered for webclient||`2 (in MB)`
 `IDENTITY_PROVIDER_MAX_RESULT_SIZE`|Maximum result size for Keycloak user queries||`250`

##### formsflow.ai forms variable settings
  
  **Steps to Remember:**
  * Getting ROLE_ID and RESOURCE_ID are mandatory for role based access. To generate ID go to To generate ID go to ["Formsflow-forms user/role API"](../../../forms-flow-forms/README.md#formsflow-forms-userrole-api) and follow the steps.
*  Modify the environment variables.
  
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`CLIENT_ROLE`|	The role name used for client users|| `formsflow-client`
`CLIENT_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms client role Id|eg. 10121d8f7fadb18402a4c|`must get the **formsflow Client** role Id value from step #1 above.`
`REVIEWER_ROLE`|The role name used for reviewer users||`formsflow-reviewer`
`REVIEWER_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms reviewer role Id|eg. 5ee10121d8f7fa03b3402a4d|`must get the **formsflow Reviewer** role Id value from step #1 above.`
`DESIGNER_ROLE`|The role name used for designer users||`formsflow-designer`
`DESIGNER_ROLE_ID`:triangular_flag_on_post:|forms-flow-forms administrator role Id|eg. 5ee090afee045f1597609cae|`must get the **Administrator** role Id value from step #1 above.`
`ANONYMOUS_ID`|forms-flow-forms anonymous role Id|eg. 5ee090b0ee045f28ad609cb0|`must get the **Anonymous** role Id value from step #1 above.`
`USER_RESOURCE_ID`:triangular_flag_on_post:|User forms form-Id|eg. 5ee090b0ee045f51c5609cb1|`must get the **user resource** id value from the step #1 above.`

##### formsflow.ai Integration variable settings
 
Variable name | Meaning | Possible values | Default value |
--- | --- | --- | ---
`NODE_ENV`| Define project level configuration | `development, test, production` | `development`
`APPLICATION_NAME`| Application_Name | eg: formsflow.ai| `formsflow.ai`
`WEB_BASE_CUSTOM_URL`| Custom_URL | eg: https://formsflow.ai| `custom url`
`FORMSFLOW_API_CORS_ORIGINS`| formsflow.ai Rest API allowed origins, for allowing multiple origins you can separate host address using a comma seperated string or use * to allow all origins |eg:`host1, host2, host3`| `*`
`CAMUNDA_API_URL` :triangular_flag_on_post: |Camunda Rest API URL||`http://{your-ip-address}:8000/camunda`
`FORMSFLOW_API_URL`:triangular_flag_on_post:|formsflow.ai Rest API URL||`http://{your-ip-address}:5000`
`USER_ACCESS_PERMISSIONS`| JSON formatted permissions to enable / disable few access on user login.|| `{"accessAllowApplications":false,"accessAllowSubmissions":false}`

* NOTE - While configuring USER_ACCESS_PERMISSIONS the accessAllowApplications will hide / show application tab, the same way accessAllowSubmissions does for viewSubmission button. To enable this feature you need to add access-allow-applications, access-allow-submissions with the respective user group in keycloak.

    
##### Running the application
```
 Run `docker-compose up -d` to start.
```

##### To build the application
```
 Run `docker-compose up --build -d`
 ```

##### To stop the application
```
   Run `docker-compose stop` to stop.
```

* To make sure the working is going properly you can navigate to https://github.com/AOT-Technologies/forms-flow-ai-dev



#### This is how we perform a deployment for the very first time. All the componants mentioned in the dependencies should be properly installed and follow the installation steps. Following these guides, makes it easy for new users to make a deployment. 


## Deployment For Existing Users


#### Deployment for the already exsisting users doesn't require any further installation. Take a pull and do the deployment steps mentioned below.

##### 1.	Login to the server using ip.
```
ssh {your ip address}
```

##### 2.	Navigate to forms-flow-ai directory.
```
apps/ forms-flow-ai-dev/deployment/docker/
```
    
##### 3.	Check the status of the git.
```
git status
```
##### 4. Stop all containers running in the docker.
```
docker-compose stop
```

##### 5.	Pull the master files.
```
git pull origin master
```

##### 6.	Check the stash list and find the temporary storage area.
```
git stash list
```

##### 7.  Revert the stash changes back.
```
git stash apply
```

##### 8.	Check the docker containers running inside the docker.
```
docker ps
```

##### 9. To restart all docker images that are currently available on docker.
```
docker-compose up –build -d
```

* To make sure the working is going properly you can navigate to https://github.com/AOT-Technologies/forms-flow-ai-dev




