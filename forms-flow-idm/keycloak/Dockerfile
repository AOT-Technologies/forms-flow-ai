# === Build Stage ===
FROM maven:3.8.7-openjdk-18-slim AS builder
WORKDIR /build

# Copy and build each module
COPY capture-tenant-info/pom.xml capture-tenant-info/
COPY capture-tenant-info/src capture-tenant-info/src/
COPY keycloak-event-listener/pom.xml keycloak-event-listener/
COPY keycloak-event-listener/src keycloak-event-listener/src/
COPY keycloak-registration-success-spi/pom.xml keycloak-registration-success-spi/
COPY keycloak-registration-success-spi/src keycloak-registration-success-spi/src/
COPY idp-selector/pom.xml idp-selector/
COPY idp-selector/src idp-selector/src/

RUN mvn -f capture-tenant-info/pom.xml clean package && \
  mvn -f keycloak-event-listener/pom.xml clean package && \
  mvn -f keycloak-registration-success-spi/pom.xml clean package && \
  mvn -f idp-selector/pom.xml clean package

# === Runtime Stage === 
FROM alpine:latest
RUN mkdir -p /custom/providers

# Copy compiled JARs
COPY --from=builder /build/*/target/*.jar /custom/providers/

# Copy themes + realm imports
COPY ./themes /custom/themes
COPY ./imports /custom/imports

# Copy startup script to shared location
COPY ./start-keycloak.sh /custom/start-keycloak.sh
RUN chmod +x /custom/start-keycloak.sh

CMD ["/bin/sh"]
