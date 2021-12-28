# Modified by Yichun Zhao and Walter Moar

# Maven build
FROM maven:3.6.1-jdk-11-slim AS MAVEN_TOOL_CHAIN
COPY pom-docker.xml /tmp/pom.xml
COPY settings-docker.xml /usr/share/maven/ref/
WORKDIR /tmp/
# This allows Docker to cache most of the maven dependencies
RUN mvn -s /usr/share/maven/ref/settings-docker.xml dependency:resolve-plugins dependency:resolve dependency:go-offline -B
COPY src /tmp/src/
RUN mvn -s /usr/share/maven/ref/settings-docker.xml package

# Final custom slim java image (for apk command see jdk-11.0.3_7-alpine-slim)
FROM adoptopenjdk/openjdk11:jdk-11.0.3_7-alpine

ENV JAVA_VERSION jdk-11.0.3+7
ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/opt/java/openjdk/bin:$PATH"

EXPOSE 8080
# OpenShift has /app in the image, but it's missing when doing local development - Create it when missing
RUN test ! -d /app && mkdir /app || :
# Add spring boot application
RUN mkdir -p /app
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/forms-flow-bpm.jar ./app
RUN chmod a+rwx -R /app
WORKDIR /app
VOLUME /tmp
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/forms-flow-bpm.jar"]
