# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /forms-flow-bpm/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /forms-flow-bpm/app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# install and cache app dependencies
COPY package.json /forms-flow-bpm/app/package.json
RUN npm install --silent
#RUN npm install react-scripts@3.0.1 -g --silent

# start app
CMD ["npm", "start"]
