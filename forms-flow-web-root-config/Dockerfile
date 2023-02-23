# base image
FROM node:14.17.0-alpine as build-stage

# set working directory
WORKDIR /forms-flow-web-root-config/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /forms-flow-web-root-config/app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# install and cache app dependencies

COPY package-lock.json /forms-flow-web-root-config/app/package-lock.json
COPY package.json /forms-flow-web-root-config/app/package.json
COPY env.sh /forms-flow-web-root-config/app/env.sh

RUN npm ci

COPY . /forms-flow-web-root-config/app/
RUN npm run build:webpack

FROM nginx:1.15.2-alpine as production-stage

RUN mkdir /app
COPY --from=build-stage /forms-flow-web-root-config/app/dist /usr/share/nginx/html
COPY --from=build-stage /forms-flow-web-root-config/app/env.sh /usr/share/nginx/html/config
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080:8080
WORKDIR /usr/share/nginx/html/config
COPY .env .
RUN apk add --no-cache bash
RUN chmod +x env.sh

CMD ["/bin/bash", "-c", "/usr/share/nginx/html/config/env.sh && nginx -g \"daemon off;\""]