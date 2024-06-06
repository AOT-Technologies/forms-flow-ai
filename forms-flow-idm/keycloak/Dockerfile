FROM formsflow/forms-flow-idm-theme

RUN mkdir -p /opt/keycloak/themes/formsflow
# Remove any existing theme files
RUN rm -rf /opt/keycloak/themes/formsflow/*
# Copy the new theme files
COPY themes/formsflow /opt/keycloak/themes/formsflow
# Copy the import files
COPY imports /opt/keycloak/data/import