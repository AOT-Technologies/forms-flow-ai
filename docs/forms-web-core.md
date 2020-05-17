## Form Web [react] App configuration
The image is built using github action.  [find it here](/.github/workflows/form-web.yml)

###Deployment Configurations

_Login to DEV namespace_

#####Create the config maps here

```
oc process -f forms-flow-web-configuration.yaml --param-file=<<env>>.env --ignore-unknown-parameters=true |oc create -f -

oc process -f forms-flow-web-keycloak-config.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -

```
#####Create the config maps here

oc process -f forms-flow-bpm-secret.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -

#####Create the Deployment configurations

```oc process -f formio.web-dc.yaml --param-file=<<env>>.env --ignore-unknown-parameters=true  | oc create -f -
```

#####Trigger the Deployment [do this till Jenkins in built]
_Login to tools namespace_

oc tag forms-flow-web:latest forms-flow-web:test


## Form IO [node] App configuration
The image is built using github action.  [find it here](/.github/workflows/form-core-deploy-dev.yml)

Value for the admin email should be present in the param file
``FORM_IO_ADMIN_EMAIL=admin@bcgov.com``

#####Create the Deployment configurations

```
oc process -f formio.core-dc.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -
```

#####Trigger the Deployment [do this till Jenkins in built]
_Login to tools namespace_

oc tag formio-core-api:latest formio-core-api:test
