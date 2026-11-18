FROM maven:3.9.11-eclipse-temurin-17 AS builder

WORKDIR /build

COPY idp-selector/pom.xml idp-selector/
COPY idp-selector/src idp-selector/src/

RUN mvn -f idp-selector/pom.xml clean package

FROM alpine:3.24

WORKDIR /custom

COPY --from=builder /build/idp-selector/target/*.jar /custom/providers/
COPY ./themes /custom/themes
COPY ./imports /custom/imports
COPY ./start-keycloak.sh /custom/start-keycloak.sh
