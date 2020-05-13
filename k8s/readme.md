
oc process -f formio-mongodb-secret.yaml |oc create -f -
oc process -f formio-mongodb-dc.yaml

 oc process -f formio-mongodb-dc.yaml |oc create -f -


 oc create sa gh-actions
 
 oc policy add-role-to-user edit system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools
 oc policy add-role-to-user system:image-builder system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools
  oc policy add-role-to-user system:image-puller system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools
  oc policy add-role-to-user system:image-pusher system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools


 oc describe sa gh-actions
 
 git update-index --chmod=+x script.sh


oc tag formio-core-api:latest formio-core-api:dev

oc process -f formio.core-dc.yaml |oc create -f -


# login to the new namespace in tools project


##  Service Account setup

### create service account
Create a Service Account in the new namespace

 `oc create sa gh-actions`

you should see a message as serviceaccount/gh-actions created


### give roles to the service account
`oc policy add-role-to-user edit system:serviceaccount:ebiqwr-tools:gh-actions -n ebiqwr-tools`
you should see a message as role "edit" added: "system:serviceaccount:ebiqwr-tools:gh-actions"

Add mores to  the gh actions
```
  oc policy add-role-to-user system:image-builder system:serviceaccount:ebiqwr-tools:gh-actions -n ebiqwr-tools
  oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-tools:gh-actions -n ebiqwr-tools
  oc policy add-role-to-user system:image-pusher system:serviceaccount:ebiqwr-tools:gh-actions -n ebiqwr-tools
```  

##  GH Action Secrets in the REPO [to be done only for first time github repo setup]

oc_parameters
     login https://console.pathfinder.gov.bc.ca:8443 --token=<<insert service account token here>>

OPENSHIFT_REGISTRY
    docker-registry.pathfinder.gov.bc.ca


OPENSHIFT_REPOSITORY
    TOOLS NAMEPSACE NAME



OPENSHIFT_REPOSITORY_DEV
    DEV NAMEPSACE NAME


OPENSHIFT_REPOSITORY_TOOLS
    TOOLS NAMEPSACE NAME
    

OPENSHIFT_SA_NAME
    gh-actions

OPENSHIFT_TOKEN
    token of the ghactions account
    go to secrets in the tools namepace


GIVE SUFFICIENT PRIVILAGE

oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-dev:default -n ebiqwr-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-test:default -n ebiqwr-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-prod:default -n ebiqwr-tools


HOW TO BUILD THE FRONT END REACT PROJECT
    1) create the config maps   forms-flow-web-dev-configuration,forms-flow-web-dev-keycloak-config


oc process -f formio.web-dc.yaml |oc apply -f -


create the MONGO HA
