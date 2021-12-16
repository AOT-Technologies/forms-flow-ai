#!/bin/bash
cd ..
git clone https://github.com/formio/formio
mv forms-flow-forms/custom-components .
mv forms-flow-forms/mongo_entrypoint .
mv forms-flow-forms/script .
rm -rf /tmp/forms/
mkdir /tmp/forms

cd forms-flow-forms/
cp README.md Dockerfile package.json install.js sample.env sample.json docker-compose-linux.yml docker-compose-windows.yml openshift_custom_Dockerfile /tmp/forms
cp .gitignore .dockerignore formsflow-template.json /tmp/forms
cd config/
cp formsflow-forms-postman-collection.json /tmp/forms
cd ..
cd src/actions
cp ResetPassword.js /tmp/forms
cd ..
cd authentication/
cp index.js /tmp/forms
cd ..
cd middleware/
cp tokenHandler.js /tmp/forms
cd ..
cd models/
cp Submission.js /tmp/forms
cd ../../

mv custom-components formio/
mv mongo_entrypoint formio/
mv script formio/

cp /tmp/forms/README.md formio/
cp /tmp/forms/Dockerfile formio/
cp /tmp/forms/package.json formio/
cp /tmp/forms/install.js formio/
cp /tmp/forms/sample.env formio/
cp /tmp/forms/sample.json formio/
cp /tmp/forms/docker-compose-linux.yml formio/
cp /tmp/forms/docker-compose-windows.yml formio/
cp /tmp/forms/.gitignore formio/
cp /tmp/forms/openshift_custom_Dockerfile formio/
cp /tmp/forms/formsflow-template.json  formio/
cp /tmp/forms/.dockerignore formio/
cp /tmp/forms/formsflow-forms-postman-collection.json formio/config
cp /tmp/forms/ResetPassword.js formio/src/actions
cp /tmp/forms/index.js formio/src/authentication
cp /tmp/forms/tokenHandler.js formio/src/middleware
cp /tmp/forms/Submission.js formio/src/models

rm formio/docker-compose.yml
rm -rf formio/.git

rm -rf forms-flow-forms/
chmod 700 formio
mv formio forms-flow-forms/
