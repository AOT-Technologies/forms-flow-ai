Change the tag name in the dc.yaml
create the config maps


oc process -f formio.web-dc.yaml --param-file=test.env | oc create -f -
oc tag forms-flow-web:dev forms-flow-web:test


oc process -f formio.core-dc.yaml --param-file=test.env |oc create -f -
