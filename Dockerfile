
# Used by docker-compose.yml to deploy the forms-flow-io application
# (When modified, you must include `--build` )
# ------------------------------------------------------------------
#
# Use Node, Maven image, maintained by Docker:
# 

#
#Stage 1: forms-flow-bpm
#

# Maven build Base Image
FROM maven:3.6.1-jdk-11-slim AS MAVEN_TOOL_CHAIN

# Set working directory
WORKDIR /app/forms-flow-bpm

# setup folder structure
COPY /forms-flow-bpm/pom-docker.xml /tmp/pom.xml
COPY /forms-flow-bpm/src /tmp/src/
COPY /forms-flow-bpm/settings-docker.xml /usr/share/maven/ref/

# Maven clean package
RUN mkdir -p /tmp
WORKDIR /tmp/
RUN mvn -s /usr/share/maven/ref/settings-docker.xml clean package


# Final custom slim java image (for apk command see jdk-11.0.3_7-alpine-slim)
FROM adoptopenjdk/openjdk11:jdk-11.0.3_7-alpine
ENV JAVA_VERSION jdk-11.0.3+7
ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/opt/java/openjdk/bin:$PATH"
EXPOSE 8080

# Add spring boot application
RUN mkdir -p /app
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/camunda-bpm-identity-keycloak-examples-sso-kubernetes*.jar ./app
RUN chmod a+rwx -R /app

#Start Camunda

VOLUME /tmp
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/camunda-bpm-identity-keycloak-examples-sso-kubernetes.jar"]


#
#Stage 2: forms-flow-io
#

# Base image
FROM node:lts-alpine3.10

# set working directory
WORKDIR /app/forms-flow-io

# "bcrypt" requires python/make/g++, all must be installed in alpine
# (note: using pinned versions to ensure immutable build environment)
RUN apk update && \
    apk upgrade && \
    apk add python=2.7.16-r2 && \
    apk add make=4.2.1-r2 && \
    apk add g++=8.3.0-r0

# Using an alternative package install location
# to allow overwriting the /app folder at runtime
# stackoverflow.com/a/13021677
ENV NPM_PACKAGES=/.npm-packages \
    PATH=$NPM_PACKAGES/bin:$PATH \
    NODE_PATH=$NPM_PACKAGES/lib/node_modules:$NODE_PATH
RUN echo "prefix = $NPM_PACKAGES" >> ~/.npmrc

# Include details of the required dependencies
COPY ./forms-flow-io/package.json $NPM_PACKAGES/
COPY ./forms-flow-io/package-lock.json $NPM_PACKAGES/


# Use "Continuous Integration" to install as-is from package-lock.json
RUN npm ci --prefix=$NPM_PACKAGES

# Link in the global install because `require()` only looks for ./node_modules
# WARNING: This is overwritten by volume-mount at runtime!
#          See docker-compose.yml for instructions
RUN ln -sf $NPM_PACKAGES/node_modules node_modules

# Set this to inspect more from the application. Examples:
#   DEBUG=formio:db (see index.js for more)
#   DEBUG=formio:*
ENV DEBUG=""


# This will initialize the application based on
# some questions to the user (login email, password, etc.)
ENTRYPOINT [ "node", "main.js" ]


#
#Stage 3: forms-flow-web
#

# Base image
FROM node:12.2.0-alpine

# Set working directory
WORKDIR /app/forms-flow-web

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Install and cache app dependencies
COPY /forms-flow-web/package.json /forms-flow-web/app/package.json

# Bundle app source
COPY /forms-flow-web/. /forms-flow-web/app

RUN npm install --silent
#RUN npm install react-scripts@3.0.1 -g --silent

# Start app
CMD ["npm", "start"]



