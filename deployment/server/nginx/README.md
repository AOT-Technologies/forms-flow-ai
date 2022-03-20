# NGINX
In the following document, we’ll describe about the nginx configuration steps.

## Table of Contents
1. [ Summary](#summary)
2. [Nginx Configuration](#nginx-configuration)


## Summary

Nginx is a web server that can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache. It can be configured as a reverse proxy for HTTP and other protocols, with support for modifying request headers and fine-tuned buffering of responses. Nginx is used as a reverse proxy to each components in formsflow.ai.

A common deployment option for formsflow.ai is a cloud or self-hosted solution. Our project contains setup which uses web-accessible server fronting nginx to reverse-proxy to each of the components in a docker environment, each component running as a separate server with its own SSL connection certificate. For deployment standard alpine nginx container is deployed with a custom configuration file app.conf. This document focus on the configuration of nginx in formsflow.ai.



## Nginx Configuration
### Configuration Steps

Create a new directory **nginx** and add **docker-compose.yml** file in **\nginx** directory.

```
  nginx:
    image: nginx:1.17-alpine
    ports:
      - "443:443"
    volumes:
      - ./conf.d/:/etc/nginx/conf.d/
      - /home/dev/certs:/etc/nginx/certs
    restart: unless-stopped
    tty: true
```

Store the **app.conf** file in **/nginx/conf.d** directory. 

Variable placeholders need to be replaced in this file with the values required of your specific environment. Additionally SSL certificates need to be generated for each of components accessed through nginx.

 The following table lists the required placeholder mappings


Placeholder | Meaning | Sample 
--- | --- | --- 
`http://localhost:3000`| Replace with the ip /host / port of the formsflow.ai UI|   `http://<hostname>:3000`
`http://localhost:5000` | Replace with the ip/ host / portf the formsflow.ai API|  `http://<hostname>:5000`
`<forms-flow-web hostname fullchain.pem>`|SSL certificate public key for formsflow.ai UI component|`/etc/nginx/certs/app1.<hostname>/fullchain.pem`
`<forms-flow-web hostname privkey.pem>`|SSL certificate private key for formsflow.ai UI component| `/etc/nginx/certs/app1.<hostname>/privkey.pem`
`<forms hostname>`| Hostname of form.io server | `forms1.<hostname>`
`http://localhost:3001`| Replace with the ip/ host / port of the form.io server|  `http://<hostname>:3001`
`<forms-flow-forms hostname fullchain.pem>`|SSL certificate public key for form.io component| `/etc/nginx/certs/forms1.<hostname>/fullchain.pem`
`<forms-flow-forms hostname privkey.pem>`|SSL certificate private key for form.io component| `/etc/nginx/certs/forms1.<hostname>/privkey.pem`
` <bpm hostname>`| Hostname of Camunda server | `bpm1.<hostname>`
`https://localhost:8000`| Replace with the ip/ host / port of the Camunda server NB: Note the HTTPS | `https://<hostname>:8000`
`<forms-flow-bpm hostname fullchain.pem>`|SSL certificate public key for Camunda component| `/etc/nginx/certs/bpm1.<hostname>/fullchain.pem`
`<forms-flow-bpm hostname privkey.pem>`|SSL certificate private key for Camunda component| `/etc/nginx/certs/bpm1.<hostname>/privkey.pem`
`<analytics hostname>`| Hostname of Redash server |  `analytics1.<hostname>`
`http://localhost:7000`| Replace with the ip/ host / port for Redash |  `http://<hostname>:7000`
`<path to analytics hostname fullchain.pem>`|SSL certificate public key for Redash component| `/etc/nginx/certs/analytics1.<hostname>/fullchain.pem`
`<path to analytics hostname privkey.pem>`|SSL certificate private key for Redash component| `/etc/nginx/certs/analytics1.<hostname>/privkey.pem`
 

Additional Configuration
-------------------------

  - Remember to change the relevant hostnames in the Keycloak server as per instructions in main [README](../../docker/README.md)
  - Also change values in .env file as per instructions in main [README](../../docker/README.md)
 


The syntax of the docker run command is as follows:
```
docker-compose  up -d	
```

To stop one or more running Docker containers, you can use the docker stop command. The syntax is as follows: 
```
docker stop
```






