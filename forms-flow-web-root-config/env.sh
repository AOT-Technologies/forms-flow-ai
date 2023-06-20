#!/bin/bash

# Recreate config file
rm -rf ./config.js
touch ./config.js

envsubst < ./config.template.js > ./config.js;
