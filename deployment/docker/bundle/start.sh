#!/bin/bash

installation()
{
ip="$(ipconfig | grep -A 1 'IPv4' | tail -1 |-f 1)"
}

while true; do
    read -p "Do you want to include analytics in the installation?[y/n]?" yn
    case $yn in
        [Yy]* ) INSTALL_WITH_ANALYTICS(); break;;
        [Nn]* ) INSTALL_WITHOUT_ANALYTICS();;
        * ) echo "error";;
    esac
done

INSTALL_WITH_ANALYTICS

INSTALL_WITH_ANALYTICS()
{
echo installation will be completed in the following order:
echo 1. keycloak
echo 2. form.io
echo 3. analytics
echo 4. web
echo 5. camunda
echo 6. webapi
}

function pause(){
   read -p "$*"
}
pause 'Press [Enter] key to continue...'

KEYCLOAK

INSTALL_WITHOUT_ANALYTICS()
{
echo installation will be completed in the following order:
echo 1. keycloak
echo 2. form.io
echo 3. web
echo 4. camunda
echo 5. webapi
}

pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}

/n
/n
export PATH="$PATH:keycloak"
/n
echo                                   Keycloak
/n
/n
cd configuration\keycloak
KEYCLOAK()
{
while true; do
    read -p "Do you have an existing keycloak?[y/n]?" yn
    case $yn in
        [Yy]* ) jumpto custuminstallation; break;;
        [Nn]* ) jumpto defaultinstallation;;
        * ) echo "error";;
    esac
done
}
defaultinstallation()
{
echo WE AREING UP OUR DEFAULT KEYCLOCK FOR YOU
function pause(){
   read -p "$*"
}
pause 'Press [Enter] key to continue...'

cp sample.env .env
ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
echo Please wait, keycloak isting up!
docker-compose up -d

echo what is your keycloak url realm name?
read realmname

Keyurl=$ip
str=KEYCLOAK_URL=http://{your-ip-address}:8080
stg=$str:{your-ip-address}=!keyurl!$
str keycloak urlrelm name is $name 

echo what is your bpm client secret key?
read keysecret

echo KEYCLOAK_URL_REALM=$realm >> .env
echo $stg>>".env"
echo KEYCLOAK_BPM_CLIENT_SECRET=$keysecret >> .env


analyticsoption()

INSTALL WITH EXISTING KEYCLOAK()
{
customKeycloak=1;
echo existing keycloakup here

echo what is your keycloak url realm name?
read realmname

echo what is your bpm client secret key?
read keysecret

echo what is your Keycloak url?
read keyurl

echo KEYCLOAK_URL_REALM=$realm >> .env
echo KEYCLOAK_URL=$keyurl >> .env
echo KEYCLOAK_BPM_CLIENT_SECRET=$keySecret >> .env


analyticsoption()

echo.
echo.
if $analytics ==1 (
echo.
function pause(){
   read -p "$*"
}
pause 'Press [Enter] key to continue...'
ANALYTICS()
)

if $analytics ==0 (
echo let us move to the installation 
function pause(){
   read -p "$*"
}
pause 'Press [Enter] key to continue...'
configuration section()

ANALYTICS()
{
echo.
echo.
echo                                                 ANALYTICS
echo.
echo.
cd ..\analytics

ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
cp sample.env .env

 key=$_IPaddr
 ste=REDASH_HOST=http://{your-ip-address}:7000
 strng=$ste:{your-ip-address}=$key

docker-compose -f docker-compose-windows.yml run --rm server create_db

echo analytics database has been created.. wait for a moment for the analytics to start.

docker-compose -f docker-compose-windows.yml up --build -d 

echo please collect the redash api key
echo what is your Redash API key?
read redashApiKey
echo INSIGHT_API_KEY=$redashApiKey >> .env

function pause(){
   read -p "$*"
}
pause 'Press [Enter] key to continue...'

configuration section()
{
echo                                                  Installation-Automation                                                                        
/n
cd ..
findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL=" /c:"#KEYCLOAK_URL_REALM=" /c:"KEYCLOAK_URL=" /c:"KEYCLOAK_BPM_CLIENT_SECRET=" /c:"INSIGHT_API_URL=" /c:"INSIGHT_API_KEY=" /c:"CLIENT_ROLE_ID=" /c:"DESIGNER_ROLE_ID=" /c:"REVIEWER_ROLE_ID" /c:"ANONYMOUS_ID" /c:"USER_RESOURCE_ID" /c:"CAMUNDA_API_URL=" /c:"FORMSFLOW_API_URL=" /c:"WEBSOCKET_SECURITY_ORIGIN=" sample.env > .env
ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"

 default_url=$_IPaddr
 ste=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
 strong=$ste:{your-ip-address}=$default_url

 keycloak_url=$_IPaddr
 str=KEYCLOAK_URL=http://{your-ip-address}:8080
 strng=$str:{your-ip-address}=$keycloak_url!

 API_URL=$_IPaddr
 url=INSIGHT_API_URL=http://{your-ip-address}:7000
 strinnng=$url:{your-ip-address}=$API_URL

echo Please wait, forms is getting up!
docker-compose -f docker-compose.yml up --build -d forms-flow-forms

 websock=$_IPaddr
 lpi=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
 streng=$lpi:{your-ip-address}=$websock

 api=$_IPaddr
 stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
 strongs=$stp:{your-ip-address}=$api

 websock=$_IPaddr
 lpu=WEBSOCKET_SECURITY_ORIGIN=http://{your-ip-address}:3000
 streeng=$lpu:{your-ip-address}=$websock



if [ -z $1 ] || [ -z $2 ]
then
   echo Please specify User Email and Password
   exit 0
fi

email=$1
password=$2
host=http://localhost:3001

response=$(curl  -s -D - -o /dev/null "$host"/user/login -H 'Content-Type: application/json' --data '{"data": {"email" : "'$email'","password": "'$password'"}}'  | grep ^x-jwt-token*)
token=${response:13}
role_data=$(curl -H "x-jwt-token:${token//[$'\t\r\n ']}" -s  "$host"/role)

bkpIFS="$IFS"

IFS=',{}][' read -r -a array <<<"$role_data"

id=()
role=()
index=0
for i in "${array[@]}"
do
	if [ "${i:1:3}" == "_id" ]
	then
		id[$index]=${i:7:-1}
	elif [ "${i:1:5}" == "title" ]
	then
		role[$index]="${i:9:-1}"
		((index+=1))
	fi

done


user_data=$(curl -H "x-jwt-token:${token//[$'\t\r\n ']}" -s  "$host"/user)

bkpIFS="$IFS"

IFS=',{}][' read -r -a array <<<"$user_data"

for i in "${array[@]}"
do
	if [ "${i:1:3}" == "_id" ]
	then
		id[$index]=${i:7:-1}
	elif [ "${i:1:5}" == "title" ]
	then
		role[$index]="${i:9:-1}"
		((index+=1))
	fi

done

Administrator=$id[0]
Anonymous=$id[1]
Authenticated=$id[2]
formsflowClient=$id[3]
formsflowReviewer=$id[4]
User=$id[5]


function pause(){
   read -p "$*"
}
pause 'Press [Enter] key to continue...'

echo FORM.IO ENV Variables - START
echo $strong >> .env
echo Keycloak ENV Variables - START 
echo KEYCLOAK_URL_REALM=$realm >> .env
echo $strng >> .env
echo KEYCLOAK_BPM_CLIENT_SECRET=$keySecret >> .env
echo $strinnng >> .env
echo INSIGHT_API_KEY=$redashApiKey >> .env
echo $streng >> .env
echo $strongs >> .env
echo $streeng >> .env
echo CLIENT_ROLE_ID=$formsflowClient >> .env
echo DESIGNER_ROLE_ID=$Administrator >> .env
echo REVIEWER_ROLE_ID=$formsflowReviewer >> .env
echo ANONYMOUS_ID=$Anonymous >> .env
echo USER_RESOURCE_ID=$User >> .env

docker-compose up --build -d forms-flow-web
docker-compose -f docker-compose.yml up -d forms-flow-bpm
docker-compose -f docker-compose.yml up -d forms-flow-webapi

endofinstallation()
{
echo The Installation has finished!
}
