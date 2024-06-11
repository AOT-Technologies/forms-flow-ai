# FROM maven:3.8.6-jdk-11 AS builder

# WORKDIR /build

# COPY idp-selector/pom.xml idp-selector/
# COPY idp-selector/src idp-selector/src/

# RUN mvn -f idp-selector/pom.xml clean package

FROM alpine:latest

WORKDIR /custom

# COPY --from=builder /build/idp-selector/target/*.jar /custom/providers/
COPY ./themes /custom/themes
COPY ./imports /custom/imports
COPY ./start-keycloak.sh /custom/start-keycloak.sh
