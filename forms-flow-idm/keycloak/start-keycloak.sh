#!/bin/bash
# Ensure the directories exist
mkdir -p /opt/keycloak/themes
mkdir -p /opt/keycloak/data/import
mkdir -p /opt/keycloak/providers

# Copy providers, custom themes, and realm imports
cp -rf /keycloak_custom_data/providers/* /opt/keycloak/providers/
cp -rf /keycloak_custom_data/themes/* /opt/keycloak/themes/
cp -rf /keycloak_custom_data/imports/* /opt/keycloak/data/import/

# Default values if the variables are not set
START_MODE=${KEYCLOAK_START_MODE:-"start"}
HTTP_PATH=${KEYCLOAK_HTTP_PATH:-"/auth"}

THEME_CACHE_ARGS=""
if [ "$START_MODE" = "start-dev" ]; then
  THEME_CACHE_ARGS="--spi-theme-static-max-age=-1"
fi

# Custom SPI event listener flags
CUSTOM_SPI_FLAGS="--spi-events-listener-custom-registration-listener-enabled=true \
--spi-events-listener-custom-registration-listener-provider=custom-registration-listener"

# Construct Keycloak command
COMMAND="/opt/keycloak/bin/kc.sh $START_MODE --import-realm \
--http-relative-path $HTTP_PATH \
$THEME_CACHE_ARGS $CUSTOM_SPI_FLAGS"

echo "Executing command: $COMMAND"
exec $COMMAND
