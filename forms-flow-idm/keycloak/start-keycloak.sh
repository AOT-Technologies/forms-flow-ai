#!/bin/bash

# Default values if the variables are not set
START_MODE=${KEYCLOAK_START_MODE:-"start"}
HTTP_PATH=${KEYCLOAK_HTTP_PATH:-"/auth"}

# Construct the command
COMMAND="/opt/keycloak/bin/kc.sh $START_MODE --import-realm --http-relative-path $HTTP_PATH"

# Execute the command
echo "Executing command: $COMMAND"
exec $COMMAND
