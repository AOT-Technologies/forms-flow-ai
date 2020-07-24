# Hosted Server Setup
## Typical Setup

A common deployment option for the FormsFlow.IO solution is a cloud or hosted solution. Many of the cloud-based solutions have proprietory web-server/storage/networking etc. which is beyond the scope of this project (with the exception of Openshift where we do have more detailed deployment instructions) .

This section describes and contains code for a setup which uses a web-accessible server fronting nginx to reverse-proxy to each of the components in a docker environment, each component running as a separate server with its own SSL connection certificate.
 Obviously there are individual preferences involved with such deployments, however the nginx setup here might prove helpful as a starting point. 

For this deployment a standard alpine nginx container is deployed with a custom configuration file app.conf. Variable placeholders need to be replaced in this file with the values required of your specific environment. Additionally, SSL certificates need to be generated for each of the components accessed through nginx.  

In the example below, the following external URL's are accessible (as of writing these URLs were up and running ):


* Main application - `https://app1.<hostname>`
* Camunda admin interface - `https://bpm1.<hostname>`
* Redash admin interface - `https://analytics1.<hostname>`

The following table lists the required placeholder mappings


Placeholder | Meaning | Sample 
--- | --- | --- 
`http://localhost:3000`| Replace with the ip /host / port of the FormsFlow UI|   `http://<hostname>:3000`
`http://localhost:5000` | Replace with the ip/ host / portf the FormsFlow API|  `http://<hostname>:5000`
`<forms-flow-web hostname fullchain.pem>`|SSL certificate public key for FormsFlow UI component|`/etc/nginx/certs/app1.<hostname>/fullchain.pem`
`<forms-flow-web hostname privkey.pem>`|SSL certificate private key for FormsFlow UI component| `/etc/nginx/certs/app1.<hostname>/privkey.pem`
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

  - Remember to change the relevant hostnames in the Keycloak server as per instructions in main [README](../README)
  - Also change values in .env file as per instructions in main [README](../README)

## Deployment
Run 
```code
docker-compose up -d
```
