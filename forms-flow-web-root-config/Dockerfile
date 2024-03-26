# Base image
FROM node:16.18.0-alpine as build-stage

# Set working directory
WORKDIR /forms-flow-web-root-config/app

# Set build arguments
ARG NODE_ENV
ARG MF_FORMSFLOW_WEB_URL
ARG MF_FORMSFLOW_NAV_URL
ARG MF_FORMSFLOW_SERVICE_URL
ARG MF_FORMSFLOW_ADMIN_URL
ARG MF_FORMSFLOW_THEME_URL

# Set environment variables
ENV MF_FORMSFLOW_WEB_URL ${MF_FORMSFLOW_WEB_URL}
ENV MF_FORMSFLOW_NAV_URL ${MF_FORMSFLOW_NAV_URL}
ENV MF_FORMSFLOW_SERVICE_URL ${MF_FORMSFLOW_SERVICE_URL}
ENV MF_FORMSFLOW_ADMIN_URL ${MF_FORMSFLOW_ADMIN_URL}
ENV MF_FORMSFLOW_THEME_URL ${MF_FORMSFLOW_THEME_URL}
ENV NODE_ENV ${NODE_ENV}

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /forms-flow-web-root-config/app/node_modules/.bin:$PATH

# Install necessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Install and cache app dependencies
COPY package-lock.json /forms-flow-web-root-config/app/package-lock.json
COPY package.json /forms-flow-web-root-config/app/package.json
COPY env.sh /forms-flow-web-root-config/app/env.sh
RUN npm ci --omit=dev

# Copy source code
COPY . /forms-flow-web-root-config/app/

# Build the application
RUN if [ $NODE_ENV == "development" ]; then \
        npm run build-dev:webpack; \
    else \
        npm run build:webpack; \
    fi


# Production stage
FROM nginx:1.25.4-alpine as production-stage

# Set label for image
LABEL Name="formsflow"

# Create directories
RUN mkdir /app
WORKDIR /usr/share/nginx/html/config

# Copy built files from build stage
COPY --from=build-stage /forms-flow-web-root-config/app/dist /usr/share/nginx/html
COPY --from=build-stage /forms-flow-web-root-config/app/env.sh /usr/share/nginx/html/config

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Install necessary packages
RUN apk add --no-cache bash

# Set execute permission for env.sh
RUN chmod +x /usr/share/nginx/html/config/env.sh

# Start Nginx server with environment setup
CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]
# CMD ["/bin/bash", "-c", "/usr/share/nginx/html/config/env.sh && nginx -g \"daemon off;\""]
