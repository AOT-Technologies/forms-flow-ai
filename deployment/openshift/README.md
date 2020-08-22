# OpenShift Deployment
## General Instructions

Run `oc process -f filename.yaml |oc create -f -` to process a template.

Be sure to modify the values of parameters in the templates first before processing them. Alternatively, you can create a separate env file to overwrite the values, and then run `oc process -f filename.yaml --param-file=.env |oc create -f -`.