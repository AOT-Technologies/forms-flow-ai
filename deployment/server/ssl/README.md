# SSL CERTIFICATION
In the following document, we’ll describe about the SSL cetificate generation and renewal.

## Table of Contents
1. [ Summary](#summary)
2. [Dependencies](#dependencies)
3. [SSL Certificate Generation](#ssl-certificate-generation)
4. [SSL Certificate  Renewal](#ssl-certificate-renewal)


## Summary

An SSL certificate is a digital certificate that authenticates a website's identity and enables an encrypted connection. We use SSL in formsflow.ai to keep our individual application approved

## Dependencies
* openssl should be installed(https://sourceforge.net/projects/openssl/)

* need to have certbot(https://eff-certbot.readthedocs.io/en/stable/install.html#running-with-docker)


## SSL Certificate Generation
### Key Generation and Self-signed Certificate generation

 

 * NOTE:  We need to generate private key and a public key before generating the SSL certificate
 ### Steps for keystore generation:
 ##### (Ensure bpm2.pkcs12, truststore.ks, keystore.ks , combined.pem is deleted before doing below operations)
  * cat fullchain.pem privkey.pem > combined.pem
  * cat combined.pem
  * Openssl pkcs12 -export -out bpm1.pkcs12 -in combined.pem. (create bpm1.pkcs12 file)
  * keytool -genkey -keyalg RSA -alias tomcat -keystore truststore.ks. (create keystore.ks)
	* keytool -delete -alias tomcat -keystore truststore.ks.
	* keytool -import -v -trustcacerts -alias tomcat -file fullchain.pem -keystore truststore.ks.
  * keytool -genkey -keyalg RSA -alias tomcat -keystore keystore.ks. (create keystore.ks)
  * keytool -v -importkeystore -srckeystore bpm1.pkcs12 -srcstoretype PKCS12 -destkeystore keystore.ks -deststoretype JKS. (finally import enter passwords set during generation of keystore and trustkeystore)
 
 #### Generating keystore from a pem file
 
 #### we have to start the application in https, and since it's a java application, we need to generate a keystore from a pem file. 
 ##### It needs to follow the below steps,
  *	These commands should be run inside the corresponding folder.   
  *	Password will be 'password'

**NOTE:** We can also generate key using openssl command as follows.

   ##### 1. In order to generate key pair we can use the command.
```
   openssl genrsa -out {name of the key}.key {key size in KB}
```
   ##### 2. It will generate a key and can view it in the directory
   ##### 3. Now we can extract a public key from the private key
```
   openssl rsa -in {private key name} -pubout -out {public key name}.key 
```
   ##### 4. Now we have a certificate signing request. Here we are self-signing the certificate.
   ##### 5. Now we can generate a CSR by using the command
```
   openssl req -new -key {private key name} -out {CSR name}.csr 
```
As we ae generating a CSR, their will be a series of questions asked. The details should be appropriate and remember the details that we give.
 * Country name
 * State/province
 * City
 * Organizational unit name
 * Organizational name 
 * Common name (it should match with the server name).
 * Email address
 * Password
   ##### 6. So, now we have requested for the certificate generation. After giving all the details we need to verify whether the details entered are correct or is their any change. If there is a change in it, we can regenerate it.
```
   openssl req -text -in {CSR name} -noout -verify
```
 Then it will show all the details regarding the CSR that we have entered.
   ##### 7. Now to self-sign our certificate and generate the SSL certificate
```
   openssl x509 -in {CSR name}  -out {Certificate name}.crt -req -signkey {private key name} -days {validity in days}
``` 

Now if we click the **dir** command, we can see our keys and certificate that has been generated.

  #### Now we are done with the SSL certificate generation. After following the above metioned steps you can see the generated certificate on your directory.
-------------------------------------------------------------------------------------------------------------

## SSL Certificate Renewal
In the following document, we’ll describe about the steps involved in the upgradation and renewal of SSL certificate. The SSL certificate is generated only for a period of time, we must renew it before it gets expired.

### Steps For SSL Renewal
 ##### -> Login into server as root 
```
   sudo  su -
``` 
 ##### -> Certificate renewal is actually quite simple with Certbot. You can renew the certificates with the following command:
```
   certbot renew
``` 
 ##### ->	Go to the appropriate folder in /etc/letsencrypt/live/*
 
 ##### ->	Now, copy the privkey.pem and fullchain.pem contents from  the certbot renew command page to appropriate folder in cd /home/dev/certs/*  
 
 ##### ->	Stop nginx by going into apps/nginx 
 ``` 
 docker-compose down
 ``` 
 * NOTE: The docker restart is required for nginx.
 
 ##### ->	Start the nginx 
 ``` 
 docker-compose up -d
 ``` 
 SSL renewal should be performed whenever the certificate gets expired. We can follow the above steps to Renew the certificate.
 
#### Reference article to generate SSL certificate with LetsEncrypt :  
https://ordina-jworks.github.io/security/2019/08/14/Using-Lets-Encrypt-Certificates-In-Java.html

