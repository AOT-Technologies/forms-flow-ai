This page details deploying application in openshift. All the applicaiton are deployed using openshift templates.

_The templates are tested , ran and customised for running in BCGOV pathfinder OCP3 and Openshift 4 silver cluster , there could be particular places where the templates are opinionated. Feel free to alter them and generalise them for any kubernetes/openshift deployments_
	
	
Every component has a build config [bc], Deployment config and might have a param file. The general syntax for running them is 

`oc process -f web_dc.yaml --param-file=web_param.yaml |oc apply -f - --ignoreunknownparams`		

an ideal topology will look like 

![](forms-flow-topology.png "Depoyment Topology")


Databases


## Databases

The application uses Postgres and Mongo DB for persistence.The below templates can be used as a reference to spin up new databases.Alternatively new databse schema can be created with in the existing database.

### how to deploy postgres
Postgres HA and Non-HA templates can be used.

A sample patroni templates can be found at [patroni-build.yaml](../openshift/Databases/patroni-build.yaml) , [patroni-build.yaml](../openshift/Databases/patroni-build.yaml) , [patroni-deployment.yaml](../openshift/Databases/patroni-deployment.yaml) , [patroni-deployment-prereq.yaml](../openshift/Databases/patroni-deployment-prereq.yaml) 

To avail the latest patroni templates ,Please refer to [BCDevOps/platform-services/patroni templates](https://github.com/BCDevOps/platform-services/tree/master/apps/pgsql/patroni)

A sample non-Ha template is checked in here at [postgres-non-ha template](../openshift/Databases/postgresql-deploy.json)

### how to deploy Mongo

Mongo HA and Non-HA templates can be used.

A sample Mongo HA template can be found at [mongo-ha.yaml](../openshift/Databases/mongo-ha.yaml)
A sample Mongo non-HA templates can be found at [mongodb-nonha.yaml](../openshift/Databases/mongodb-nonha.yaml)