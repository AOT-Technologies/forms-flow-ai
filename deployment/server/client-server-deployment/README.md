# **formsflow.ai server deployment for clients**

This document discuss about the deployment of formsflow.ai in the nginx server with valid ssl certificate. 

## **SSL Configuration** 

Purchase a valid SSL from zerossl or any other trusted entity. If you are purchasing the SSL from zerossl for the first time, 90 days of SSL certificate  will be free of cost . After completing the successfull purchase of ssl certificate , you can download a zip file. The zip file contains three files (certificate.crt, ca_bundle.crt, private.key). 

Inside the project folder (**forms-flow-Nginx**) create another three folders according to their domain names. Eg:- for keycloak, we can create a directory like **iam.example.com**, in which example.com is your domain, it should be replace with original domain name. Like this we need to create two more folders for analytics and app (**analytics.example.com**,**app.example.com**)


Create a **cert.pem** file by combining the contents of the file **certificate.crt** and **ca_bunble.crt** (copy the entire content from both files and paste it in a new file and save it as cert.pem). The **cert.pem** file and **private.key** file should be moved to a directory which should be named as same as domain name  inside forms-flow-nginx folder. if you are not purchased from zerossl , please use chain file and keyfile for the further process 

The folder structure should be as following:-

forms-flow-nginx   
├───analytics.example.com                                            
├───app.example.com    
└───iam.example.com

copy the private key file and cert.pem file to the corresponding directories of domains. Identity management system will be available on the **iam.example.com** domain, analytics will be available on **analytics.example.com** and formsflow.ai forms will be available on **app.example.com**


## **Nginx Configuration with SSL**

After completing the process of **SSL Configuration** , execute the **runme.sh** file in the  folder

The shell script includes, checking the directories with domain names and their valid ssl certificates, edit the corresponding nginx configuration file and Dockerfile with given domain name and public ip address. 

your can execute the shell file using the following command

**sudo  bash runme.sh**

After completing the the both steps , you can create the A record , in your dns server with the ip address for all three domain names