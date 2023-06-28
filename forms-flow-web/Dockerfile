# base image
FROM node:14.17.0-alpine as build-stage

# set working directory
WORKDIR /forms-flow-web/app
 
# add `/app/node_modules/.bin` to $PATH
ENV PATH /forms-flow-web/app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# install and cache app dependencies

COPY package-lock.json /forms-flow-web/app/package-lock.json
COPY package.json /forms-flow-web/app/package.json

RUN npm install 
#RUN npm install react-scripts@3.0.1 -g --silent
COPY . /forms-flow-web/app/
RUN npm run build

FROM nginx:1.22 as production-stage
RUN mkdir /app
COPY --from=build-stage /forms-flow-web/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3004:8080
CMD ["nginx", "-g", "daemon off;"]