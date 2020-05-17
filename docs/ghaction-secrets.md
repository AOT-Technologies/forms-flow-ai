# login to the new namespace in tools project


##  Service Account setup

### create service account
Create a Service Account in the new namespace

 `oc create sa gh-actions`

you should see a message as serviceaccount/gh-actions created


#### give roles to the service account
`oc policy add-role-to-user edit system:serviceaccount:ebiqwr-tools:gh-actions -n ebiqwr-tools`

you should see a message as role "edit" added: "system:serviceaccount:ebiqwr-tools:gh-actions"

#### Add mores to  the gh actions
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
