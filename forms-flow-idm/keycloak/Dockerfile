FROM maven:3.8.7-openjdk-18-slim AS builder

WORKDIR /build

COPY idp-selector/pom.xml idp-selector/
COPY idp-selector/src idp-selector/src/
RUN mvn -f idp-selector/pom.xml clean package -q

COPY tenant-registration/pom.xml tenant-registration/
COPY tenant-registration/src tenant-registration/src/
RUN mvn -f tenant-registration/pom.xml clean package -q

FROM alpine:latest

WORKDIR /custom

# Artifacts copied to /custom so they are in the image; when volume is mounted at /custom, copy from /custom_artifacts (see docker-compose command)
RUN mkdir -p /custom/providers /custom/themes /custom/imports
COPY --from=builder /build/idp-selector/target/*.jar /custom/providers/
COPY --from=builder /build/tenant-registration/target/*.jar /custom/providers/
COPY ./themes /custom/themes
COPY ./imports /custom/imports
COPY ./start-keycloak.sh /custom/start-keycloak.sh
