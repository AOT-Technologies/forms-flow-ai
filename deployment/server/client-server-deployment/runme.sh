#!/bin/bash
read -p "Enter the Domain For Keycloak: " keycloak
read -p "Enter the Domain For forms: " forms
read -p "Enter the Domain For analytics: " analytics
read -p "Enter the public IP: " ip
if [[ $ip =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "OK"
else
  echo "enter valid ip address"
  exit 1
fi
#checking files and folders are existing in the root folder
if [ -d "forms-flow-nginx/$keycloak" ]; then
  
  echo "Directory ${keycloak} is existing.."
else
  echo "please create the directory $keycloak and copy the certificates.."
  exit 1
fi
if [ -d "forms-flow-nginx/$forms" ]; then
  
  echo "Directory ${forms} is existing.."
else
  echo "please create the directory $forms and copy the certificates.."
  exit 1
fi
if [ -d "forms-flow-nginx/$analytics" ]; then
  
  echo "Directory ${analytics} is existing.."
else
  echo "please create the directory $analytics and copy the certificates.."
  exit 1
fi
echo "*******************************************"
echo "*******Changing values in Dockerfile*******"
echo "*******************************************"

sed -i "s/analytics/$analytics/g" Dockerfile
sed -i "s/app/$forms/g" Dockerfile
sed -i "s/keycloak/$keycloak/g" Dockerfile

echo "*******************************************"
echo "*******Changing values in Nginx conf*******"
echo "*******************************************"


sed -i "s/your-ip-address/$ip/g" nginx.conf
sed -i "s/keycloak/$keycloak/g" nginx.conf
sed -i "s/analytics/$analytics/g" nginx.conf
sed -i "s/app/$forms/g" nginx.conf

echo "-----------------------------------"
echo "Building Image"
echo "-----------------------------------"
docker build -t forms-flow-nginx:v1.0.0 .
echo "-----------------------------------"
echo "container is starting"
echo "-----------------------------------"
docker-compose up -d