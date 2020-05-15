Change the tag name in the dc.yaml
create the config maps

oc process -f forms-flow-web-configuration.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -

oc process -f forms-flow-web-keycloak-config.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -

oc process -f forms-flow-bpm-secret.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -





oc process -f formio.web-dc.yaml --param-file=prod.env --ignore-unknown-parameters=true  | oc create -f -
oc process -f formio.web-dc.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -
oc tag forms-flow-web:dev forms-flow-web:test


oc process -f formio.core-dc.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -
