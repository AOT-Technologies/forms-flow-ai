FROM nginx
RUN mkdir -p /etc/nginx/keycloak/certs
RUN mkdir -p /etc/nginx/app/certs
RUN mkdir -p /etc/nginx/analytics/certs
COPY ./keycloak/cert.pem /etc/nginx/keycloak/certs/
COPY ./keycloak/private.key /etc/nginx/keycloak/certs/
COPY ./app/cert.pem /etc/nginx/app/certs/
COPY ./app/private.key /etc/nginx/app/certs/
COPY ./analytics/cert.pem /etc/nginx/analytics/certs/
COPY ./analytics/private.key /etc/nginx/analytics/certs/
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
EXPOSE 80 443