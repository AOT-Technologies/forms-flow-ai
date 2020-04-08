# maven build
FROM maven:3.6.1-jdk-11-slim AS MAVEN_TOOL_CHAIN
COPY /forms-flow-bpm/pom-docker.xml /tmp/pom.xml
COPY /forms-flow-bpm/src /tmp/src/
COPY /forms-flow-bpm/settings-docker.xml /usr/share/maven/ref/
RUN mkdir -p /tmp
WORKDIR /tmp/
RUN mvn -s /usr/share/maven/ref/settings-docker.xml clean package


# final custom slim java image (for apk command see jdk-11.0.3_7-alpine-slim)
FROM adoptopenjdk/openjdk11:jdk-11.0.3_7-alpine

ENV JAVA_VERSION jdk-11.0.3+7
ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/opt/java/openjdk/bin:$PATH"

EXPOSE 8080
# add spring boot application
RUN mkdir -p /app
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/camunda-bpm-identity-keycloak-examples-sso-kubernetes*.jar ./app
RUN chmod a+rwx -R /app
WORKDIR /app
VOLUME /tmp
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/camunda-bpm-identity-keycloak-examples-sso-kubernetes.jar"]