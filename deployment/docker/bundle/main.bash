#!/bin/bash
_IPdr=192.168.1.3
echo "Do you wish to continue installation that include ANALYTICS? [y/n]" 
read choice
if [[ $choice == "y" ]]; then
    ANALYTICS=1
elif [[ $choice == "n" ]]; then
    ANALYTICS=0
fi
function installAnaly
{
    cd ../analytics
    cp sample.env .env
    _IPdr=192.168.1.3
    REDASH_HOST=http://{your-ip-address}:7000
    REDASH_HOST=http://$_IPdr:7000
    echo REDASH_HOST=$REDASH_HOST >>.env
    docker-compose -f docker-compose-windows.yml run --rm server create_db
    echo analytics database has been created.. wait for a moment for the analytics to start.
    docker-compose -f docker-compose-windows.yml up --build -d 
    echo What is your redash api key?
    read readash
	echo INSIGHT_API_KEY=$readash >>.env
    printf "%s " "Press enter to continue"
    read that
    forms-flow-forms
}
function forms-flow-forms
{
    cd ..
    cp sample.env .env
    _IPdr=192.168.1.3
    FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:8080
    FORMIO_DEFAULT_PROJECT_URL=http://$_IPdr:8080
    KEYCLOAK_URL=http://{your-ip-address}:8080
    KEYCLOAK_URL=http://$_IPdr:8080
    INSIGHT_API_URL=http://{your-ip-address}:7000
    INSIGHT_API_URL=http://$_IPdr:7000
    echo Please wait, forms is getting up!
    docker-compose -f docker-compose.yml up --build -d forms-flow-forms
	CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
    CAMUNDA_API_URL=http://$_IPdr:8000/camunda
    FORMSFLOW_API_URL=http://{your-ip-address}:5000
    FORMSFLOW_API_URL=http://$_IPdr:5000
	WEBSOCKET_SECURITY_ORIGIN=http://{your-ip-address}:3000
    WEBSOCKET_SECURITY_ORIGIN=http://$_IPdr:3000

email=admin@example.com
password=changeme
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
for i in $(seq 0 $index)
do
        key=$role[$i]
        val=$id[$i]

done
	echo FORMIO_DEFAULT_PROJECT_URL=$FORMIO_DEFAULT_PROJECT_URL >>.env
	echo KEYCLOAK_URL_REALM=$KEYCLOAK_URL_REALM >>.env
	echo KEYCLOAK_BPM_CLIENT_SECRET=$Keysecret >>.env
	echo KEYCLOAK_URL=http:$KEYCLOAK_URL >>.env
	echo INSIGHT_API_URL=$INSIGHT_API_URL >>.env
	echo INSIGHT_API_KEY=$readash >>.env
	echo CAMUNDA_API_URL=$CAMUNDA_API_URL >>.env
    echo FORMSFLOW_API_URL=$FORMSFLOW_API_URL >>.env
    echo WEBSOCKET_SECURITY_ORIGIN=$WEBSOCKET_SECURITY_ORIGIN >>.env
	echo Administrator="${id[0]}" >>.env
    echo Anonymous= "${id[1]}" >>.env
    echo Authenticated= "${id[2]}" >>.env
    echo formsflowClient= "${id[3]}" >>.env
    echo formsflowReviewer= "${id[4]}" >>.env
    echo User= "${id[5]}" >>.env
    printf "%s " "Press enter to continue"
    read that
    docker-compose up --build -d forms-flow-web
    docker-compose -f docker-compose.yml up --build -d forms-flow-bpm
    docker-compose -f docker-compose.yml up --build -d forms-flow-webapi
    
}
function keycloak
{
    cd configuration/keycloak/
    echo "Do you have an exsisting keycloak? [y/n]" 
    read value1
    function defaultinstallation
    {
        echo WE ARE SETING UP OUR DEFAULT KEYCLOCK FOR YOU
        printf "%s " "Press enter to continue"
        read that
        cp sample.env .env
        _IPdr=192.168.1.3
        echo Please wait, keycloak is setting up!
        docker-compose up -d
        KEYCLOAK_URL_REALM=forms-flow-ai
        KEYCLOAK_URL=http://{your-ip-address}:8080
        KEYCLOAK_URL=http://$_IPdr:8080
		Keysecret=e4bdbd25-1467-4f7f-b993-bc4b1944c943
		echo $KEYCLOAK_URL_REALM >>.env
		echo $KEYCLOAK_URL >>.env
		echo KEYCLOAK_BPM_CLIENT_SECRET=$Keysecret >>.env

        printf "%s " "Press enter to continue"
        read that
    }
    
    function INSTALL_WITH_EXISTING_KEYCLOAK
    {
        echo what is your keycloak url realm name?
        read realmname

        echo what is your bpm client secret key?
        read keysecret

        echo what is your Keycloak url?
        read keyurl

        echo KEYCLOAK_URL_REALM=$realmname >>.env
        echo KEYCLOAK_URL=$keyurl >>.env
        echo KEYCLOAK_BPM_CLIENT_SECRET=$keysecret >>.env 
        printf "%s " "Press enter to continue"
        read that
    }
    
     if [[ "$value1" == "y" ]]; then  
        INSTALL_WITH_EXISTING_KEYCLOAK
     elif [[ "$value1" == "n" ]]; then  
         defaultinstallation
     fi  
      
    
if [[ $ANALYTICS == 1 ]]; then
    installAnaly
elif [[ $ANALYTICS == 0 ]]; then
    forms-flow-forms
fi
}
function analycsfunction
{
  echo installation will be completed in the following order:
  echo 1. keycloak
  echo 2. form.io
  echo 3. analytics
  echo 4. web
  echo 5. camunda
  echo 6. webapi
  printf "%s " "Press enter to continue"
  read that
  keycloak
}
function notAnalytics
{
    echo installation will be completed in the following order:
    echo 1. keycloak
    echo 2. form.io
    echo 3. web
    echo 4. camunda
    echo 5. webapi 
    printf "%s " "Press enter to continue"
    read that
    keycloak
}
if [[ $ANALYTICS == 1 ]]; then
    analycsfunction
elif [[ $ANALYTICS == 0 ]]; then
    notAnalytics
fi

