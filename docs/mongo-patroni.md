 
 ## Mongo Set up

### create a param file like below 

```
MEMORY_REQUEST=512Mi
MEMORY_LIMIT=3Gi
CPU_REQUEST=500m
CPU_LIMIT=1
VOLUME_CAPACITY=10Gi
SC_MONGO=netapp-block-standard
```

### Run the deployment configs

```
oc process -f mongodb-replicaset.yaml --param-file=prod.env |oc create -f -
```



## Patroni setup



**CREATE IMAGE in the TOOLS NAMESPACE** 

_run the command in the parent folder_

 oc process -f k8s/patroni/build.yaml  -p GIT_URI=https://github.com/bcgov/forms-flow-ai  -p VERSION=v10-latest | oc apply -f - -n ebiqwr-tools

**Run the prereq file**

oc process -f deployment-prereq.yaml |oc create -f -


**Run the deployment file**

oc process -f deployment.yaml |oc create -f -

