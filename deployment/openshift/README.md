# OpenShift Deployment
## General Instructions

Run `oc process -f filename.yaml |oc create -f -` to process a template.

Be sure to modify the values of parameters in the templates first before processing them. Alternatively, you can create a separate env file to overwrite the values, and then run `oc process -f filename.yaml --param-file=.env |oc create -f -`.

Note: A ConfigMap was added to modify forms-flow-web to work with Redash v9. If the this change is reflected in the source code in the future, please delete the related OpenShift changes from commit https://github.com/AOT-Technologies/forms-flow-ai-dev/commit/ea17688b8c23aa7ed9f77303d017bafc60954486. 
