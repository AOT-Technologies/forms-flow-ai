oc process -f formio-mongodb-dc.yaml

 oc process -f formio-mongodb-dc.yaml |oc create -f -


 oc create sa gh-actions
 
 oc policy add-role-to-user edit system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools
 oc policy add-role-to-user system:image-builder system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools
  oc policy add-role-to-user system:image-puller system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools
  oc policy add-role-to-user system:image-pusher system:serviceaccount:vmvfjv-tools:gh-actions -n vmvfjv-tools


 oc describe sa gh-actions
 
 
