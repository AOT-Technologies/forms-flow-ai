#!/bin/sh

function installation()
{
ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
}

while true; do
    read -p "Do you want to include analytics in the installation?[y/n]?" yn
    case $yn in
        [Yy]* ) jumpto INSTALL_WITH_ANALYTICS(); break;;
        [Nn]* ) jumpto INSTALL_WITHOUT_ANALYTICS();;
        * ) echo "error";;
    esac
done

run INSTALL_WITH_ANALYTICS()

function INSTALL_WITH_ANALYTICS()
{
printf installation will be completed in the following order:
printf 1. keycloak
printf 2. form.io
printf 3. analytics
printf 4. web
printf 5. camunda
printf 6. webapi
}

pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}

$KEYCLOAK()

INSTALL_WITHOUT_ANALYTICS()
{
printf installation will be completed in the following order:
printf 1. keycloak
printf 2. form.io
printf 3. web
printf 4. camunda
printf 5. webapi
}

pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}

/n
/n
export PATH="$PATH:keycloak"
/n
printf        Keycloak
/n
/n

while true; do
    read -p "Do you have an existing keycloak?[y/n]?" yn
    case $yn in
        [Yy]* ) jumpto custuminstallation; break;;
        [Nn]* ) jumpto defaultinstallation;;
        * ) echo "error";;
    esac
done

defaultinstallation()
{
printf WE ARE SETING UP OUR DEFAULT KEYCLOCK FOR YOU
function pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}

cp sample.env .env
ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
printf Please wait, keycloak is setting up!
docker-compose up -d

printf what is your keycloak url realm name?
read realmname

Keyurl=$ip
str=KEYCLOAK_URL=http://{your-ip-address}:8080
stg=$str:{your-ip-address}=!keyurl!$
str keycloak urlrelm name is $name 

echo what is your bpm client secret key?
read keysecret

analyticsoption()

INSTALL WITH EXISTING KEYCLOAK()
{
set customKeycloak=1;
echo existing keycloak setup here

printf what is your keycloak url realm name?
read realmname

echo what is your bpm client secret key?
read keysecret

echo what is your Keycloak url?
read keyurl

analyticsoption()

echo.
echo.
if $analytics ==1 (
echo.
function pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}
ANALYTICS()
)

if $analytics ==0 (
echo let us move to the installation 
function pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}
configuration section()

ANALYTICS()
{
echo.
echo.
echo                                                 ANALYTICS
echo.
echo.

ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
cp sample.env .env

set key=$_IPaddr
set ste=REDASH_HOST=http://{your-ip-address}:7000
set strng=$ste:{your-ip-address}=$key

docker-compose -f docker-compose-windows.yml run --rm server create_db

echo analytics database has been created.. wait for a moment for the analytics to start.

docker-compose -f docker-compose-windows.yml up --build -d 

echo please collect the redash api key
echo what is your Redash API key?
read redashApiKey
`cat < $redashApiKey` > .env

function pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}

configuration section()
{
echo                                                  Installation-Automation                                                                        

findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL=" /c:"#KEYCLOAK_URL_REALM=" /c:"KEYCLOAK_URL=" /c:"KEYCLOAK_BPM_CLIENT_SECRET=" /c:"INSIGHT_API_URL=" /c:"INSIGHT_API_KEY=" /c:"CLIENT_ROLE_ID=" /c:"DESIGNER_ROLE_ID=" /c:"REVIEWER_ROLE_ID" /c:"ANONYMOUS_ID" /c:"USER_RESOURCE_ID" /c:"CAMUNDA_API_URL=" /c:"FORMSFLOW_API_URL=" /c:"WEBSOCKET_SECURITY_ORIGIN=" sample.env > .env
ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"

set default_url=$_IPaddr
set ste=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
set strong=$ste:{your-ip-address}=$default_url

set keycloak_url=$_IPaddr
set str=KEYCLOAK_URL=http://{your-ip-address}:8080
set strng=$str:{your-ip-address}=$keycloak_url!

set API_URL=$_IPaddr
set url=INSIGHT_API_URL=http://{your-ip-address}:7000
set strinnng=$url:{your-ip-address}=$API_URL

echo Please wait, forms is getting up!
docker-compose -f docker-compose.yml up --build -d forms-flow-forms

set websock=$_IPaddr
set lpi=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
set streng=$lpi:{your-ip-address}=$websock

set api=$_IPaddr
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
set strongs=$stp:{your-ip-address}=$api

set websock=$_IPaddr
set lpu=WEBSOCKET_SECURITY_ORIGIN=http://{your-ip-address}:3000
set streeng=$lpu:{your-ip-address}=$websock



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

function pause(){
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}



