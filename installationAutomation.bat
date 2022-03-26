@echo off

::=================== INIT =====================>
:Installation
set analytics=0;
set /p choice=Do you want to include analytics in the installation? [y/n]
if %choice%==y (
set analytics=1;
goto :INSTALL_WITH_ANALYTICS
)
if %choice% ==n (
goto :INSTALL_WITHOUT_ANALYTICS
)

:INSTALL_WITH_ANALYTICS
echo installation will be completed in the following order:
echo 1. form.io
echo 2. web
echo 3. analytics
echo 4. webapi
echo 5. camunda


echo press enter to continue
pause>null
goto :KEYCLOAK

:INSTALL_WITHOUT_ANALYTICS

echo The installation will be completed in the following order
echo 1. form.io
echo 2. web
echo 3. webapi
echo 4. camunda

echo press enter to continue
pause>null
goto :KEYCLOAK



::================KEYCLOAK=========================>
:KEYCLOAK
cd .\forms-flow-idm\keycloak
:keycloak repeat
:choice
set /P c=Do you have an existing keycloak?[y/n]?
if /I "%c%" EQU "y" goto :INSTALL WITH EXISTING KEYCLOAK
if /I "%c%" EQU "n" goto :USE DEFAULT KEYCLOAK SETUP
goto :choice


:USE DEFAULT KEYCLOAK SETUP
echo WE ARE SETING UP OUR DEFAULT KEYCLOCK FOR YOU
echo press enter to continue
pause> null
findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL" sample.env > .env


for /f "tokens=*" %%s in (.env) do (
 echo %%s
)

echo %cd%
::docker-compose up -d

:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :keycloak repeat
if /I "%c%" EQU "n" goto :FORMSFLOW FORMS
goto :choice


::------------------------------------------
:INSTALL WITH EXISTING KEYCLOAK

echo existing keycloak setup here
pause
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :keycloak repeat
if /I "%c%" EQU "n" goto :FORMSFLOW FORMS
goto :choice
::------------------------------------------
::================KEYCLOAK-ENDS=========================>

::=================FORMS-STARTS=========================>
:FORMSFLOW FORMS
cls
echo FORMSFLOW FORMS

cd ..\..\forms-flow-forms
echo %cd%

::fetching ip address
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set _IPaddr=%%a

:choice
set /P choice=Are you sure you want run default settings[y/n]?
if /I "%choice%" EQU "y" goto :FORMS DEFAULT SETUP
if /I "%choice%" EQU "n" goto :FORMS CUSTOM SETUP
goto :choice

:FORMS DEFAULT SETUP

findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL" sample.env > .env
setlocal ENABLEDELAYEDEXPANSION
set word=%_IPaddr%
set str=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
set strng=%str:{your-ip-address}=!word!%

echo %strng%>>".env"

for /f "tokens=*" %%s in (.env) do (
 echo %%s
)
	
::docker-compose -f docker-compose-windows.yml up -d forms-flow-forms 

pause> null

:ROLS

::------------------------------------------
:FORMS CUSTOM SETUP
echo formsflow custom setup here
echo please wait until the process complete
echo BEFORE MOVING TO THE NEXT STEP PLEASE MAKE SURE THAT FORMSFLOW FORMS IS UP IN http://localhost:3001
pause> null

::------------------------------------------

::================FORMS-ENDS=========================>

::==========FETCHING ROLS=========>
:ROLS

cd .\script
echo %cd%


set hour=6
set res=F
SET email=admin@example.com
SET password=changeme
SET host=http://localhost:3001

set token=nul

setlocal ENABLEDELAYEDEXPANSION

:: Getting x-jwt-token
for /F "skip=1delims=" %%I in ('curl -d "{ \"data\": { \"email\": \"!email!\", \"password\": \"!password!\"} }" -H "Content-Type: application/json" -sSL -D - !host!/user/login  -o null') do (
  set header=%%I
  if "!header:~0,11!"=="x-jwt-token" (
     set token=!header:~13!
  )
)

:: Getting role id's and mapping it into an array
for /f "delims=" %%R in ('curl -H "x-jwt-token:!token!"  -sSL -D - !host!/role') do (
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
for /f "delims=" %%R in ('curl -H "x-jwt-token:!token!"  -sSL -D - !host!/user') do (
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
echo -------------------------------------------
echo Role Name       -          ID
echo -------------------------------------------
for /L %%a in (0,1,!i!) do (
echo !title[%%a]!   -           !id[%%a]!
set !title[%%a]!=!id[%%a]!
)

set Administrator=%id[0]%
set Anonymous=%id[1]%
set Authenticated=%id[2]%
set formsflowClient=%id[3]%
set formsflowReviewer=%id[4]%
set User=%id[5]%

:WEB
::==========PASSING ROLIDS========>




::================WEB STARTS=========================>
:WEB
echo FORMS FLOW WEB
cd ..\..\forms-flow-web
echo %cd%
:choice
set /P c=Are you sure you want run default settings[Y/N]?
if /I "%c%" EQU "Y" goto :WEB DEFAULT INSTALLATION
if /I "%c%" EQU "N" goto :WEB CUSTOM INSTALLATION
goto :choice


:WEB DEFAULT INSTALLATION

findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL=" /c:"KEYCLOAK_URL=" /c:"FORMSFLOW_API_URL=" /c:"CAMUNDA_API_URL=" /c:"WEBSOCKET_SECURITY_ORIGIN=" /c:"CLIENT_ROLE_ID=" /c:"DESIGNER_ROLE_ID=" /c:"REVIEWER_ROLE_ID" /c:"ANONYMOUS_ID" /c:"USER_RESOURCE_ID" sample.env > .env

for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set _IPaddr=%%a

setlocal ENABLEDELAYEDEXPANSION
set word=%_IPaddr% 
set str=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
set strng=%str:{your-ip-address}=!word!%

set key=%_IPaddr% 
set ste=KEYCLOAK_URL=http://{your-ip-address}:8080
set stng=%ste:{your-ip-address}=!key!%

set api=%_IPaddr% 
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
set strong=%stp:{your-ip-address}=!api!%

set websock=%_IPaddr% 
set lpu=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
set streng=%lpu:{your-ip-address}=!websock!%

echo %strng% >>".env"
echo %stng% >>".env"
echo %strong% >>".env"
echo %streng% >>".env"
echo CLIENT_ROLE_ID=%formsflowClient% >> .env
echo DESIGNER_ROLE_ID=%Administrator% >> .env
echo REVIEWER_ROLE_ID=%formsflowReviewer% >> .env
echo ANONYMOUS_ID=%Anonymous% >> .env
echo USER_RESOURCE_ID=%User% >> .env
for /f "tokens=*" %%s in (.env) do (
echo %%s
)

::docker-compose up -d 

if %analytics% ==1 (
echo you have chosen the option to install analytics.
echo press ENTER to continue
pause> null
goto :ANALYTICS
)

if %analytics% ==0 (
echo let's move to the installation of api
echo press ENTER to continue
pause> null
goto :API 
)
::------------------------------------------
:WEB CUSTOM INSTALLATION

echo web custom installation here

if %analytics% ==1 (
echo you have chosen the option to install analytics.
echo press ENTER to continue
pause> null
goto :ANALYTICS
)

if %analytics% ==0 (
echo let's move to the installation of api
echo press ENTER to continue
pause> null

goto :API 

::------------------------------------------
::==================WEB-ENDS=========================>







::============ANALYTICS STARTS=======================>
:ANALYTICS
echo ANALYTICS
cd ..\forms-flow-analytics
echo %cd%

:choice
set /P c=Are you sure you want run default settings[y/n]?
if /I "%c%" EQU "y" goto :ANALYTICS DEFAULT INSTALLATION
if /I "%c%" EQU "n" goto :ANALYTICS CUSTOM INSTALLATION
goto :choice


:ANALYTICS DEFAULT INSTALLATION

findstr /v /i /c:"REDASH_HOST=" sample.env > .env

setlocal ENABLEDELAYEDEXPANSION
set key=%_IPaddr% 
set ste=REDASH_HOST=http://{your-ip-address}:7000
set strng=%ste:{your-ip-address}=!key!%
echo %strng%>>".env"

for /f "tokens=*" %%s in (.env) do (
 echo %%s
)
::docker-compose up -d
echo press ENTER to move to API installation
pause>null
goto :API 

::------------------------------------------
:ANALYTICS CUSTOM INSTALLATION
echo ANALYTICS custom setup
echo press ENTER to move to API installation
pause
goto :API 
::------------------------------------------

::============ANALYTICS ENDS=========================>


::================API STARTS=========================>
:API 
echo FORMSFLOW API
cd ..\forms-flow-api
echo %cd%
:choice
set /P c=Are you sure you want run default settings?: [y/n]
if /I "%c%" EQU "y" goto :API DEFAULT INSTALLATION
if /I "%c%" EQU "n" goto :API CUSTOM INSALATION
goto :choice

:API DEFAULT INSTALLATION

findstr /v /i /c:"INSIGHT_API_URL=" /c:"KEYCLOAK_URL=" /c:"FORMSFLOW_API_URL=" /c:"CAMUNDA_API_URL=" /c:"INSIGHT_API_KEY=" /c:"KEYCLOAK_BPM_CLIENT_SECRET="  sample.env > .env

set /p keycloakSecret="what is your Keycloak client secret key?"
echo KEYCLOAK_BPM_CLIENT_SECRET=%keycloakSecret% >> .env

set /p redashApiKey="what is your Redash API key?"
echo INSIGHT_API_KEY=%redashApiKey% >> .env

setlocal ENABLEDELAYEDEXPANSION
set word=%_IPaddr% 
set str=KEYCLOAK_URL=http://{your-ip-address}:8080
set strng=%str:{your-ip-address}=!word!%

set key=%_IPaddr% 
set ste=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
set stng=%ste:{your-ip-address}=!key!%

set api=%_IPaddr% 
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
set strong=%stp:{your-ip-address}=!api!%

set websock=%_IPaddr% 
set lpu=INSIGHT_API_URL=http://{your-ip-address}:7000
set streng=%lpu:{your-ip-address}=!websock!%

echo %strng% >>".env"
echo %stng% >>".env"
echo %strong% >>".env"
echo %streng% >>".env"
KEYCLOAK_ADMIN_USERNAME=admin >> .env
KEYCLOAK_ADMIN_PASSWORD=changeme >> .env


for /f "tokens=*" %%s in (.env) do (
echo %%s
)

::docker-compose -f docker-compose-windows.yml up -d

echo press ENTER to install BPM
pause> null
goto :BPM


::------------------------------------------
:API CUSTOM INSALATION
echo API custom installation here
echo press ENTER to install BPM
pause> null
goto :BPM

::------------------------------------------


::=================API NDS===========================>



::=================BPM STARTS===========================>
:BPM
cls
echo FORMSFLOW BPM
cd ..\forms-flow-bpm
echo %cd%

:choice
set /P c=Are you sure you want run default settings[y/n]?
if /I "%c%" EQU "y" goto :BPM DEFAULT INSTALLATION
if /I "%c%" EQU "n" goto :BPM CUSTOM INSTALLATION
goto :choice


:BPM DEFAULT INSTALLATION

findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL" /c:"KEYCLOAK_URL=" /c:"KEYCLOAK_BPM_CLIENT_SECRET=" /c:"FORMSFLOW_API_URL=" /c:"WEBSOCKET_SECURITY_ORIGIN=" sample.env > .env


setlocal ENABLEDELAYEDEXPANSION
set word=%_IPaddr% 
set str=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
set strng=%str:{your-ip-address}=!word!%

set key=%_IPaddr% 
set ste=KEYCLOAK_URL=http://{your-ip-address}:8080
set stng=%ste:{your-ip-address}=!key!%

set api=%_IPaddr% 
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
set strong=%stp:{your-ip-address}=!api!%

set websock=%_IPaddr% 
set lpu=WEBSOCKET_SECURITY_ORIGIN=http://{your-ip-address}:3000
set streng=%lpu:{your-ip-address}=!websock!%

echo %strng% >>".env"
echo %stng% >>".env"
echo %strong% >>".env"
echo %streng% >>".env"

set /p clientsecret="what is your client secret?"
echo KEYCLOAK_BPM_CLIENT_SECRET=%clientsecret% >> .env

for /f "tokens=*" %%s in (.env) do (
echo %%s
)

::docker-compose -f docker-compose-windows.yml up -d forms-flow-bpm 

pause
goto :END

::------------------------------------------
:BPM CUSTOM INSTALLATION
echo bpm custom installation here
pause
goto :END
::------------------------------------------

::=================BPM ENDS===========================>



:END
echo INSTALLATION FLOW IS COMPLETED
Pause

