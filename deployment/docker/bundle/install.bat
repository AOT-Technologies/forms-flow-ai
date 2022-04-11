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


EXIT /B %ERRORLEVEL%


:: ================&&&&&&===  Functions  ====&&&&&&&&&============================

:: #############################################################
:: ################### Main Function ###########################
:: #############################################################

:main
    call:get-repo
    call:set-common-properties
    call:keycloak source\forms-flow-idm\keycloak %~2   
    call:forms-flow-bpm source\forms-flow-bpm
    if %~1==1 (
        call:forms-flow-analytics source\forms-flow-analytics
    )
    call:forms-flow-api source\forms-flow-api %~1
    call:forms-flow-forms source\forms-flow-forms
    call:forms-flow-web source\forms-flow-web
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
:: ################### Clone formsflow repo ####################
:: #############################################################

:get-repo
    SETLOCAL
    Set _folder=source
    if exist %_folder% (
        For /F %%A in ('dir /b /a %_folder%') Do (
            git -C %_folder% pull origin master
            EXIT /B 0
        )
    ) else (
        mkdir %_folder%
    )
    ENDLOCAL
    git clone https://github.com/AOT-Technologies/forms-flow-ai.git source
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

    call:clear-dir %~1
    set FORMIO_ROOT_EMAIL=admin@example.com
    set FORMIO_ROOT_PASSWORD=changeme
    set FORMIO_DEFAULT_PROJECT_URL=http://%ip-add%:3001

    echo FORMIO_ROOT_EMAIL=%FORMIO_ROOT_EMAIL%>>%~1\.env
    echo FORMIO_ROOT_PASSWORD=%FORMIO_ROOT_PASSWORD%>>%~1\.env
    echo FORMIO_DEFAULT_PROJECT_URL=%FORMIO_DEFAULT_PROJECT_URL%>>%~1\.env

    docker-compose -f %~1\docker-compose-windows.yml up --build -d
	timeout 5
    EXIT /B 0


:: #########################################################################
:: ######################### forms-flow-web ################################
:: #########################################################################

:forms-flow-web

    SETLOCAL
    call:clear-dir %~1
    timeout 10
    set attemptCount=2
    :fetchRoleId
        set hour=6
set res=F

set token=nul

setlocal ENABLEDELAYEDEXPANSION

:: Getting x-jwt-token
for /F "skip=1delims=" %%I in ('curl -d "{ \"data\": { \"email\": \"!FORMIO_ROOT_EMAIL!\", \"password\": \"!FORMIO_ROOT_PASSWORD!\"} }" -H "Content-Type: application/json" -sSL -D - !FORMIO_DEFAULT_PROJECT_URL!/user/login  -o null') do (
  set header=%%I
  if "!header:~0,11!"=="x-jwt-token" (
     set token=!header:~13!
  )
)

:: Getting role id's and mapping it into an array
for /f "delims=" %%R in ('curl -H "x-jwt-token:!token!"  -sSL -D - !FORMIO_DEFAULT_PROJECT_URL!/role') do (
set "JSON=%%R"
)

SET id[]=0
SET title[]=""
SET i=0
for %%a in (!JSON!) do ( 
   set line=%%a
   set line=!line:{=!
   set line=!line:[=!
   set line=!line:"=!
   if "!line:~0,3!"=="_id" (
     set id=!line:~4!
	 set id[!i!]=!id!
   )
   if "!line:~0,5!"=="title" (
     set title=!line:~6!
	 set title[!i!]=!title!
	 set /a i=i+1
   )
)
:: Getting user id's and mapping it into an array
for /f "delims=" %%R in ('curl -H "x-jwt-token:!token!"  -sSL -D - !FORMIO_DEFAULT_PROJECT_URL!/user') do (
set "JSON=%%R"
)

for %%a in (!JSON!) do ( 
   set line=%%a
   set line=!line:{=!
   set line=!line:[=!
   set line=!line:"=!
   if "!line:~0,3!"=="_id" (
     set id=!line:~4!
	 set id[!i!]=!id!
   )
   if "!line:~0,5!"=="title" (
     set title=!line:~6!
	 set title[!i!]=!title!
	 set /a i=i+1
   )
)
set len=0
:Loop 

if defined id[%len%] ( 
set /a len+=1
GOTO :Loop 
)
if %len% ==0 (
  echo.
  echo.
  echo Could not find Role Ids...!
  echo Kindly make sure the localhost:3001 is up.
  echo.
  echo Repeating attempt %attemptCount% of 5 Please wait 
  set /a attemptCount+=1
  if %attemptCount%==5 (
      echo.
      echo Could not find the role Ids...
      goto :setUpEnv
      pause
  )
  timeout 10
 goto :fetchRoleId
)

    set FORMSFLOW_API_URL=http://%ip-add%:5000
    set CAMUNDA_API_URL=http://%ip-add%:8000/camunda
    set APPLICATION_NAME=formsflow.ai
    set USER_ACCESS_PERMISSIONS={"accessAllowApplications":false,"accessAllowSubmissions":false}

    echo FORMIO_DEFAULT_PROJECT_URL=%FORMIO_DEFAULT_PROJECT_URL%>>%~1\.env
    echo KEYCLOAK_URL=%KEYCLOAK_URL%>>%~1\.env
    echo FORMSFLOW_API_URL=%FORMSFLOW_API_URL%>>%~1\.env
    echo CAMUNDA_API_URL=%CAMUNDA_API_URL%>>%~1\.env
    echo WEBSOCKET_ENCRYPT_KEY=%WEBSOCKET_ENCRYPT_KEY%>>%~1\.env
    echo APPLICATION_NAME=%APPLICATION_NAME%>>%~1\.env
    echo KEYCLOAK_URL_REALM=%KEYCLOAK_URL_REALM%>>%~1\.env
    echo USER_ACCESS_PERMISSIONS=%USER_ACCESS_PERMISSIONS%>>%~1\.env
    echo DESIGNER_ROLE_ID=%id[0]%>>%~1\.env
    echo ANONYMOUS_ID=%id[1]%>>%~1\.env
    echo CLIENT_ROLE_ID=%id[3]%>>%~1\.env
    echo REVIEWER_ROLE_ID=%id[4]%>>%~1\.env
    echo USER_RESOURCE_ID=%id[5]%>>%~1\.env
    ENDLOCAL
    docker-compose -f %~1\docker-compose.yml up --build -d
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
    docker-compose -f %~1\docker-compose-windows.yml up --build -d
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-analytics ########################
:: #############################################################

:forms-flow-analytics

    SETLOCAL
    call:clear-dir %~1
    set REDASH_HOST=http://%ip-add%:7000
    echo REDASH_HOST=%REDASH_HOST%>>%~1\.env
    ENDLOCAL
    docker-compose -f %~1\docker-compose-windows.yml up --build -d
	timeout 5
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-api ########################
:: #############################################################

:forms-flow-api

    SETLOCAL

    call:clear-dir %~1
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
    docker-compose -f %~1\docker-compose-windows.yml up --build -d
    EXIT /B 0

:: #############################################################
:: ################### clearing .env ###########################
:: #############################################################

:clear-dir
    if exist %~1\.env (
        del %~1\.env
    )
    EXIT /B 0
