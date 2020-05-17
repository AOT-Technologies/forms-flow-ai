


 oc describe sa gh-actions
 
 git update-index --chmod=+x script.sh





GIVE SUFFICIENT PRIVILAGE

oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-dev:default -n ebiqwr-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-test:default -n ebiqwr-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:ebiqwr-prod:default -n ebiqwr-tools

