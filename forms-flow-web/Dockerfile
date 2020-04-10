# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /forms-flow-web/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# install and cache app dependencies
COPY package.json /forms-flow-web/app/package.json
RUN npm install --silent
#RUN npm install react-scripts@3.0.1 -g --silent

COPY . /forms-flow-web/app/
COPY ../forms-flow-util/. /forms-flow-web/forms-flow-util/
ls -lrt ../forms-flow-util

# start app
CMD ["npm", "start", "--prefix", "/forms-flow-web/app"]
