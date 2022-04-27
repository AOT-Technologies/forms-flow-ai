@echo off

set /p choice=Do you want analytics to include in the installation? [y/n]
if %choice%==y (
    set /a analytics=1
) else (
    set /a analytics=0
)
set /p choice=Do you have an existing keycloak?[y/n]?
if %choice%==y (
    set /a keycloak=1
) else (
    set /a keycloak=0
)

call:find-my-ip
call:main %analytics% %keycloak%

echo ********************** formsflow.ai is successfully installed ****************************
pause

EXIT /B %ERRORLEVEL%


:: ================&&&&&&===  Functions  ====&&&&&&&&&============================

:: #############################################################
:: ################### Main Function ###########################
:: #############################################################

:main
    call:set-common-properties
    call:keycloak configuration\keycloak %~2 
    if %~1==1 (
        call:forms-flow-analytics configuration\forms-flow-analytics
    )
    call:forms-flow-bpm configuration
    call:forms-flow-api configuration %~1
    call:forms-flow-forms configuration
    call:config configuration
    call:forms-flow-web configuration
    EXIT /B 0
	
:: #############################################################
:: ################### Finding IP Address ######################
:: #############################################################

:find-my-ip
    FOR /F "tokens=4 delims= " %%i in ('route print ^| find " 0.0.0.0"') do set ip-add=%%i
    EXIT /B 0
  
:set-common-properties
    set WEBSOCKET_ENCRYPT_KEY=giert989jkwrgb@DR55
    EXIT /B 0

:: #############################################################
:: ########################### Keycloak ########################
:: #############################################################

:keycloak

	if %~2==1 (
        set /p KEYCLOAK_URL="What is your Keycloak url?"
        set /p KEYCLOAK_URL_REALM="What is your keycloak url realm name?"
		set /p KEYCLOAK_ADMIN_USERNAME="what is your keycloak admin user name?"
		set /p KEYCLOAK_ADMIN_PASSWORD="what is your keycloak admin password?"
	) else (
	    docker-compose -f %~1\docker-compose.yml up --build -d
		timeout 5
		set KEYCLOAK_URL=http://%ip-add%:8080
		set KEYCLOAK_URL_REALM=forms-flow-ai
		set KEYCLOAK_ADMIN_USERNAME=admin
		set KEYCLOAK_ADMIN_PASSWORD=changeme
	)
        set /p KEYCLOAK_BPM_CLIENT_SECRET="What is your [Keycloak] forms-flow-bpm client secret key?"
 	EXIT /B 0
   
:: #############################################################
:: ################### forms-flow-forms ########################
:: #############################################################

:forms-flow-forms

    set FORMIO_ROOT_EMAIL=admin@example.com
    set FORMIO_ROOT_PASSWORD=changeme
    set FORMIO_DEFAULT_PROJECT_URL=http://%ip-add%:3001

    echo FORMIO_ROOT_EMAIL=%FORMIO_ROOT_EMAIL%>>%~1\.env
    echo FORMIO_ROOT_PASSWORD=%FORMIO_ROOT_PASSWORD%>>%~1\.env
    echo FORMIO_DEFAULT_PROJECT_URL=%FORMIO_DEFAULT_PROJECT_URL%>>%~1\.env

    docker-compose -f %~1\docker-compose.yml up --build -d forms-flow-forms
	call:fetch-role-ids
    EXIT /B 0
	
:restart-forms-service
   
    docker stop forms-flow-forms
    docker rm forms-flow-forms
    docker-compose -f %~1\docker-compose.yml up --build -d forms-flow-forms
    EXIT /B 0

:: #########################################################################
:: #########################   config.js    ################################
:: #########################################################################

:config

   set window["_env_"] = {
   set NODE_ENV= "production",
   set REACT_APP_CLIENT_ROLE= "formsflow-client",
   set REACT_APP_STAFF_DESIGNER_ROLE= "formsflow-designer",
   set REACT_APP_STAFF_REVIEWER_ROLE= "formsflow-reviewer",
   set REACT_APP_API_SERVER_URL="http://%ip-add%:3001",
   set REACT_APP_API_PROJECT_URL="http://%ip-add%:3001",
   set REACT_APP_KEYCLOAK_CLIENT="forms-flow-web",
   set REACT_APP_KEYCLOAK_URL_REALM="forms-flow-ai",
   set REACT_APP_KEYCLOAK_URL="http://%ip-add%:8080",
   set REACT_APP_WEB_BASE_URL="http://%ip-add%:5000",
   set REACT_APP_CAMUNDA_API_URI="http://%ip-add%:8000/camunda",
   set REACT_APP_WEBSOCKET_ENCRYPT_KEY="giert989jkwrgb@DR55",
   set REACT_APP_APPLICATION_NAME="formsflow.ai",
   set REACT_APP_WEB_BASE_CUSTOM_URL="",
   set REACT_APP_FORMIO_JWT_SECRET="--- change me now ---",
   set REACT_APP_USER_ACCESS_PERMISSIONS={accessAllowApplications:false, accessAllowSubmissions:false}
   
   echo window["_env_"] = {>>%~1\config.js
   echo NODE_ENV:%NODE_ENV%>>%~1\config.js
   echo REACT_APP_CLIENT_ROLE:%REACT_APP_CLIENT_ROLE%>>%~1\config.js
   echo REACT_APP_STAFF_DESIGNER_ROLE:%REACT_APP_STAFF_DESIGNER_ROLE%>>%~1\config.js
   echo REACT_APP_STAFF_REVIEWER_ROLE:%REACT_APP_STAFF_REVIEWER_ROLE%>>%~1\config.js
   echo REACT_APP_CLIENT_ID:"%CLIENT_ROLE_ID%",>>%~1\config.js
   echo REACT_APP_STAFF_REVIEWER_ID:"%REVIEWER_ROLE_ID%",>>%~1\config.js
   echo REACT_APP_STAFF_DESIGNER_ID:"%DESIGNER_ROLE_ID%",>>%~1\config.js
   echo REACT_APP_ANONYMOUS_ID:"%ANONYMOUS_ID%",>>%~1\config.js
   echo REACT_APP_USER_RESOURCE_FORM_ID:"%USER_RESOURCE_ID%",>>%~1\config.js
   echo REACT_APP_API_SERVER_URL:%REACT_APP_API_SERVER_URL%>>%~1\config.js
   echo REACT_APP_API_PROJECT_URL:%REACT_APP_API_PROJECT_URL%>>%~1\config.js
   echo REACT_APP_KEYCLOAK_CLIENT:%REACT_APP_KEYCLOAK_CLIENT%>>%~1\config.js
   echo REACT_APP_KEYCLOAK_URL_REALM:%REACT_APP_KEYCLOAK_URL_REALM%>>%~1\config.js
   echo REACT_APP_KEYCLOAK_URL:%REACT_APP_KEYCLOAK_URL%>>%~1\config.js
   echo REACT_APP_WEB_BASE_URL:%REACT_APP_WEB_BASE_URL%>>%~1\config.js
   echo REACT_APP_CAMUNDA_API_URI:%REACT_APP_CAMUNDA_API_URI%>>%~1\config.js
   echo REACT_APP_WEBSOCKET_ENCRYPT_KEY:%REACT_APP_WEBSOCKET_ENCRYPT_KEY%>>%~1\config.js
   echo REACT_APP_APPLICATION_NAME:%REACT_APP_APPLICATION_NAME%>>%~1\config.js
   echo REACT_APP_WEB_BASE_CUSTOM_URL:%REACT_APP_WEB_BASE_CUSTOM_URL%>>%~1\config.js
   echo REACT_APP_FORMIO_JWT_SECRET:%REACT_APP_FORMIO_JWT_SECRET%>>%~1\config.js
   echo REACT_APP_USER_ACCESS_PERMISSIONS:%REACT_APP_USER_ACCESS_PERMISSIONS%>>%~1\config.js
   echo };>>%~1\config.js
   EXIT /B 0
   

:: #########################################################################
:: ######################### forms-flow-web ################################
:: #########################################################################

:forms-flow-web

    docker-compose -f %~1\docker-compose.yml up --build -d forms-flow-web
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-bpm ########################
:: #############################################################

:forms-flow-bpm

    SETLOCAL
    call:clear-dir %~1
    set FORMSFLOW_API_URL=http://%ip-add%:5000
    set WEBSOCKET_SECURITY_ORIGIN=http://%ip-add%:3000
    set FORMIO_DEFAULT_PROJECT_URL=http://%ip-add%:3001

    echo KEYCLOAK_URL=%KEYCLOAK_URL%>>%~1\.env
    echo KEYCLOAK_BPM_CLIENT_SECRET=%KEYCLOAK_BPM_CLIENT_SECRET%>>%~1\.env
    echo KEYCLOAK_URL_REALM=%KEYCLOAK_URL_REALM%>>%~1\.env
    echo FORMSFLOW_API_URL=%FORMSFLOW_API_URL%>>%~1\.env
    echo WEBSOCKET_SECURITY_ORIGIN=%WEBSOCKET_SECURITY_ORIGIN%>>%~1\.env
    echo WEBSOCKET_ENCRYPT_KEY=%WEBSOCKET_ENCRYPT_KEY%>>%~1\.env
    echo FORMIO_DEFAULT_PROJECT_URL=%FORMIO_DEFAULT_PROJECT_URL%>>%~1\.env
    ENDLOCAL
    docker-compose -f %~1\docker-compose.yml up --build -d forms-flow-bpm
    EXIT /B 0  

:: #############################################################
:: ################### forms-flow-analytics ########################
:: #############################################################

:forms-flow-analytics

    SETLOCAL
    call:clear-dir %~1
    set REDASH_HOST=http://%ip-add%:7000
    set PYTHONUNBUFFERED=0
    set REDASH_LOG_LEVEL=INFO
    set REDASH_REDIS_URL=redis://redis:6379/0
    set POSTGRES_USER=postgres
    set POSTGRES_PASSWORD=changeme
    set POSTGRES_DB=postgres
    set REDASH_COOKIE_SECRET=redash-selfhosted
    set REDASH_SECRET_KEY=redash-selfhosted
    set REDASH_DATABASE_URL=postgresql://postgres:changeme@postgres/postgres
    set REDASH_CORS_ACCESS_CONTROL_ALLOW_ORIGIN=*
    set REDASH_REFERRER_POLICY=no-referrer-when-downgrade
    set REDASH_CORS_ACCESS_CONTROL_ALLOW_HEADERS=Content-Type, Authorization
    echo REDASH_HOST=%REDASH_HOST%>>%~1\.env
    echo PYTHONUNBUFFERED=%PYTHONUNBUFFERED%>>%~1\.env
    echo REDASH_LOG_LEVEL=%REDASH_LOG_LEVEL%>>%~1\.env
    echo REDASH_REDIS_URL=%REDASH_REDIS_URL%>>%~1\.env
    echo POSTGRES_USER=%POSTGRES_USER%>>%~1\.env
    echo POSTGRES_PASSWORD=%POSTGRES_PASSWORD%>>%~1\.env
    echo POSTGRES_DB=%POSTGRES_DB%>>%~1\.env
    echo REDASH_COOKIE_SECRET=%REDASH_COOKIE_SECRET%>>%~1\.env
    echo REDASH_SECRET_KEY=%REDASH_SECRET_KEY%>>%~1\.env
    echo REDASH_DATABASE_URL=%REDASH_DATABASE_URL%>>%~1\.env
    echo REDASH_CORS_ACCESS_CONTROL_ALLOW_ORIGIN=%REDASH_CORS_ACCESS_CONTROL_ALLOW_ORIGIN%>>%~1\.env
    echo REDASH_REFERRER_POLICY=%REDASH_REFERRER_POLICY%>>%~1\.env
    echo REDASH_CORS_ACCESS_CONTROL_ALLOW_HEADERS=%REDASH_CORS_ACCESS_CONTROL_ALLOW_HEADERS%>>%~1\.env
    ENDLOCAL
    docker-compose -f %~1\docker-compose.yml run --rm server create_db
    docker-compose -f %~1\docker-compose.yml up --build -d
	timeout 5
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-api ########################
:: #############################################################

:forms-flow-api

    SETLOCAL

    set FORMSFLOW_API_URL=http://%ip-add%:5000
    set CAMUNDA_API_URL=http://%ip-add%:8000/camunda
    set FORMSFLOW_API_CORS_ORIGINS=*
    if %~2==1 (
        set /p INSIGHT_API_KEY="What is your Redash API key?"
        set INSIGHT_API_URL=http://%ip-add%:7000
    )
    echo KEYCLOAK_URL=%KEYCLOAK_URL%>>%~1\.env
    echo KEYCLOAK_BPM_CLIENT_SECRET=%KEYCLOAK_BPM_CLIENT_SECRET%>>%~1\.env
    echo KEYCLOAK_URL_REALM=%KEYCLOAK_URL_REALM%>>%~1\.env
    echo KEYCLOAK_ADMIN_USERNAME=%KEYCLOAK_ADMIN_USERNAME%>>%~1\.env
    echo KEYCLOAK_ADMIN_PASSWORD=%KEYCLOAK_ADMIN_PASSWORD%>>%~1\.env
    echo CAMUNDA_API_URL=%CAMUNDA_API_URL%>>%~1\.env
    echo FORMSFLOW_API_CORS_ORIGINS=%FORMSFLOW_API_CORS_ORIGINS%>>%~1\.env
    if %~2==1 (
        echo INSIGHT_API_URL=%INSIGHT_API_URL%>>%~1\.env
        echo INSIGHT_API_KEY=%INSIGHT_API_KEY%>>%~1\.env
    )
    echo FORMSFLOW_API_URL=%FORMSFLOW_API_URL%>>%~1\.env
    
    ENDLOCAL
    docker-compose -f %~1\docker-compose.yml up --build -d forms-flow-webapi

:: #############################################################
:: ################### clearing .env ###########################
:: #############################################################

:clear-dir
    if exist %~1\.env (
        del %~1\.env
    )
    EXIT /B 0

:: #############################################################
:: ################### fetching role ids #######################
:: #############################################################
	
:fetch-role-ids

    timeout 10
    set /a len=0
    set /a attemptCount=1
	echo %DESIGNER_ROLE_ID%
    :Loop 
	    call fetch_role_ids.bat
        if defined DESIGNER_ROLE_ID ( 
            EXIT /B 0
        )
        echo Could not find Role Ids, Kindly make sure the localhost:3001 is up.
        set /a attemptCount+=1
        if %attemptCount% GTR  6 (
            echo Unable to find form role ids, please fix the issue and retry.
            EXIT /B 0
	    ) else (
		    echo Retrying attempt %attemptCount% of 6 Please wait 
		    if %attemptCount%==2 (
		        call:restart-forms-service configuration
		    )
		    if %attemptCount%==4 (
		        call:restart-forms-service configuration
		    )
		    if %attemptCount%==6 (
		        call:restart-forms-service configuration
		    )
			timeout 10
            call:Loop
		)
	EXIT /B 0
