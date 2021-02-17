# choose the base image- Node Latest stable version
FROM node:14.15-alpine3.13

# choose the workdir
WORKDIR /camunda-vue-tasklist/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# copy package.json and package-lock.json
COPY package.json /camunda-vue-tasklist/app/

# Install packages
RUN npm install --silent

# copy project files
COPY . /camunda-vue-tasklist/app/

# Run app
CMD ["npm", "run", "serve"]