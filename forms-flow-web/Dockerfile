# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /forms-flow-web/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Bundle app source
COPY . /forms-flow-web/app

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install --silent
#RUN npm install react-scripts@3.0.1 -g --silent

# start app
CMD ["npm", "start"]