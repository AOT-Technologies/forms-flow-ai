# === Build Stage ===
FROM maven:3.8.7-openjdk-18-slim AS builder

WORKDIR /build

# Build all Maven modules
COPY capture-tenant-info/pom.xml capture-tenant-info/
COPY capture-tenant-info/src capture-tenant-info/src/
COPY keycloak-event-listener/pom.xml keycloak-event-listener/
COPY keycloak-event-listener/src keycloak-event-listener/src/
COPY idp-selector/pom.xml idp-selector/
COPY idp-selector/src idp-selector/src/

# Build all jars
RUN mvn -f capture-tenant-info/pom.xml clean package && \
  mvn -f keycloak-event-listener/pom.xml clean package && \
  mvn -f idp-selector/pom.xml clean package


# === Runtime Stage ===
FROM eclipse-temurin:17-jre-alpine

WORKDIR /custom

COPY --from=builder /build/capture-tenant-info/target/*.jar /custom/providers/
COPY --from=builder /build/keycloak-event-listener/target/*.jar /custom/providers/
COPY --from=builder /build/idp-selector/target/*.jar /custom/providers/

COPY ./themes /custom/themes
COPY ./imports /custom/imports
COPY ./start-keycloak.sh /custom/start-keycloak.sh

# Add non-root user and set permissions
RUN addgroup -g 1001 keycloak && \
  adduser -D -u 1001 -G keycloak keycloakuser && \
  chown -R keycloakuser:keycloak /custom && \
  chmod +x /custom/start-keycloak.sh

# Switch to the non-root user
USER keycloakuser

# Set entrypoint
ENTRYPOINT ["/custom/start-keycloak.sh"]