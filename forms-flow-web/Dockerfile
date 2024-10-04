# Base image
FROM node:14.17.6-alpine as build-stage

# Set working directory
WORKDIR /forms-flow-web/app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /forms-flow-web/app/node_modules/.bin:$PATH

# Install and cache app dependencies
COPY package-lock.json /forms-flow-web/app/package-lock.json
COPY package.json /forms-flow-web/app/package.json
RUN npm ci --only=production

# Copy source code
COPY . /forms-flow-web/app/

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.25.4-alpine as production-stage

# Copy built files from build stage
COPY --from=build-stage /forms-flow-web/app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]