#!/bin/bash
cd ..
git clone https://github.com/formio/formio
mv forms-flow-forms/custom-components .
mv forms-flow-forms/mongo_entrypoint .

cd forms-flow-forms/
cp README.md Dockerfile package.json install.js sample.env sample.json docker-compose-linux.yml docker-compose-windows.yml /tmp/forms
cp .gitignore /tmp/forms
cd ..

mv custom-components formio/
mv mongo_entrypoint formio/

cp  /tmp/forms/README.md formio/
cp  /tmp/forms/Dockerfile formio/
cp  /tmp/forms/package.json formio/
cp  /tmp/forms/install.js formio/
cp /tmp/forms/sample.env formio/
cp /tmp/forms/sample.json formio/
cp /tmp/forms/docker-compose-linux.yml formio/
cp /tmp/forms/docker-compose-windows.yml formio/
cp /tmp/forms/.gitignore formio/
rm formio/docker-compose.yml
rm -rf formio/.git

rm -rf forms-flow-forms/
chmod 700 formio
mv formio forms-flow-forms/
