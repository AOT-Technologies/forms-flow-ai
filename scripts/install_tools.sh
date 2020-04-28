#!/bin/bash

sudo curl -sLo /tmp/oc.tar.gz https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
sudo tar xzvf /tmp/oc.tar.gz -C /tmp/
sudo mv /tmp/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/oc /usr/local/bin/
sudo rm -rf /tmp/oc.tar.gz /tmp/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit
sudo chmod +x /usr/local/bin/oc

