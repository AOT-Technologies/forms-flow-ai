# Modified by Yichun Zhao and Walter Moar

# Maven build
FROM maven:3.8.1-openjdk-17-slim AS MAVEN_TOOL_CHAIN
COPY pom.xml /tmp/pom.xml
COPY settings-docker.xml /usr/share/maven/ref/
WORKDIR /tmp/
# This allows Docker to cache most of the maven dependencies
RUN mvn -s /usr/share/maven/ref/settings-docker.xml dependency:resolve-plugins dependency:resolve dependency:go-offline -B
COPY src /tmp/src/
RUN mvn -s /usr/share/maven/ref/settings-docker.xml package

# Final custom slim java image (for apk command see 17-jdk-alpine-slim)
FROM openjdk:17-jdk-alpine

ENV JAVA_VERSION=17-ea+14
ENV JAVA_HOME=/opt/java/openjdk-17\
    PATH="/opt/java/openjdk-17/bin:$PATH"

EXPOSE 8080
# OpenShift has /app in the image, but it's missing when doing local development - Create it when missing
RUN test ! -d /app && mkdir /app || :
# Add spring boot application
RUN mkdir -p /app
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/forms-flow-bpm.jar ./app
RUN chmod a+rwx -R /app
WORKDIR /app
VOLUME /tmp
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom", "-Dpolyglot.js.nashorn-compat=true", "-Dpolyglot.engine.WarnInterpreterOnly=false", "-jar","/app/forms-flow-bpm.jar"]
