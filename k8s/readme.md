
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

sample configmap values are as below

forms-flow-web-dev-configuration:
    config.js   
// runtime-config.js vars
window['_env_'] =  {
  "NODE_ENV": "development",
  "REACT_APP_CLIENT_ROLE": "rpas-client",
  "REACT_APP_STAFF_DESIGNER_ROLE": "rpas-designer",
  "REACT_APP_STAFF_REVIEWER_ROLE": "rpas-reviewer",
  "REACT_APP_CLIENT_ID": "5ea9c9b56ca0f7438337c2bd",
  "REACT_APP_STAFF_REVIEWER_ID": "5ea9c9b56ca0f74ac337c2be",
  "REACT_APP_STAFF_DESIGNER_ID": "5ea98bd37e79ba1d5fea9b04",
  "REACT_APP_USER_RESOURCE_FORM_ID": "5ea98bd37e79babfbaea9b07",
  "REACT_APP_API_SERVER_URL": "https://formio-core-api-dev.pathfinder.gov.bc.ca"   ,
  "REACT_APP_API_PROJECT_URL": "https://formio-core-api-dev.pathfinder.gov.bc.ca"   ,
  "REACT_APP_KEYCLOAK_CLIENT": "forms-flow-web",
  "REACT_APP_BPM_API_BASE": "https://forms-flow-bpm-vmvfjv-dev.pathfinder.gov.bc.ca"   ,
  "REACT_APP_BPM_TOKEN_API": "https://sso-dev.pathfinder.gov.bc.ca/auth/realms/p8jhnzlo/protocol/openid-connect/token"   ,
  "REACT_APP_BPM_CLIENT_ID": "9ea3b59e-f99f-4427-bbd4-458d931005a1",
  "REACT_APP_KEYCLOAK_BPM_CLIENT": "forms-flow-bpm",
  "REACT_APP_ANONYMOUS_ID":"5ea98bd37e79ba3c16ea9b06",
  "REACT_APP_EMAIL_SUBMISSION_GROUP":"rpas/rpas-reviewer"
}


forms-flow-web-dev-keycloak-config
    keycloak.json

    {
  "realm": "p8jhnzlo",
  "auth-server-url": "https://sso-dev.pathfinder.gov.bc.ca/auth" ,
  "ssl-required": "external",
  "resource": "forms-flow-web",
  "public-client": true,
  "verify-token-audience": true,
  "use-resource-role-mappings": true,
  "confidential-port": 0
  
}



oc process -f formio.web-dc.yaml |oc apply -f -





create the MONGO HA

put necessary values in dev.env
oc process -f mongodb-replicaset.yaml --param-file=dev.env |oc create -f -




