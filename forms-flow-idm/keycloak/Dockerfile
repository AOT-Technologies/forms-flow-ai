FROM formsflow/forms-flow-idm-theme:v7.0

RUN mkdir -p /opt/bitnami/keycloak/themes/formsflow
# Remove any existing theme files
RUN rm -rf /opt/bitnami/keycloak/themes/formsflow/*
# Copy the new theme files
COPY themes/formsflow /opt/bitnami/keycloak/themes/formsflow
# Copy the import files
COPY imports /opt/bitnami/keycloak/data/import