#!/bin/bash

# Ensure the Keycloak folders exist
mkdir -p /opt/keycloak/themes
mkdir -p /opt/keycloak/data/import
mkdir -p /opt/keycloak/providers

# Copy custom themes and providers from volume
cp -rf /keycloak_custom_data/themes/* /opt/keycloak/themes/
cp -rf /keycloak_custom_data/imports/* /opt/keycloak/data/import/
cp -rf /keycloak_custom_data/providers/* /opt/keycloak/providers/

# Default values if the variables are not set
START_MODE=${KEYCLOAK_START_MODE:-"start"}
HTTP_PATH=${KEYCLOAK_HTTP_PATH:-"/auth"}
THEME_CACHE_ARGS=""
if [ "$START_MODE" = "start-dev" ]; then
  THEME_CACHE_ARGS="--spi-theme-static-max-age=-1"
fi

# Event listener SPI
CUSTOM_SPI_FLAGS="--spi-events-listener-keycloak-event-listener-enabled=true \
--spi-events-listener-keycloak-event-listener-provider=keycloak-event-listener"

# Construct and run Keycloak command
COMMAND="/opt/keycloak/bin/kc.sh $START_MODE --import-realm --http-relative-path $HTTP_PATH \
$THEME_CACHE_ARGS $CUSTOM_SPI_FLAGS"

echo "Executing Keycloak command: $COMMAND"
exec $COMMAND
