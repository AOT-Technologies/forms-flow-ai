

**CREATE IMAGE in the TOOLS NAMESPACE** 

_run the command in the parent folder_

 oc process -f k8s/patroni/build.yaml  -p GIT_URI=https://github.com/saravanpa-aot/forms-flow-ai  -p VERSION=v10-latest | oc apply -f - -n ebiqwr-tools

**Run the prereq file**

oc process -f deployment-prereq.yaml |oc create -f -


**Run the deployment file**

oc process -f deployment.yaml |oc create -f -


the secret from patroni app-db-password
