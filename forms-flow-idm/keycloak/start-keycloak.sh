#!/bin/bash
# Ensure the directories exist
mkdir -p /opt/keycloak/themes
mkdir -p /opt/keycloak/data/import

# Copy custom themes and imports

cp -rf /keycloak_custom_data/themes/* /opt/keycloak/themes/
cp -rf /keycloak_custom_data/imports/* /opt/keycloak/data/import/

# Default values if the variables are not set
START_MODE=${KEYCLOAK_START_MODE:-"start"}
HTTP_PATH=${KEYCLOAK_HTTP_PATH:-"/auth"}

# Construct the command
COMMAND="/opt/keycloak/bin/kc.sh $START_MODE --import-realm --http-relative-path $HTTP_PATH"

# Execute the command
echo "Executing command: $COMMAND"
exec $COMMAND
