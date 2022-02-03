@echo off

::=================== INIT =====================>
:Installation
set analytics=0;
set customKeycloak=0;
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
pause> null 
goto :KEYCLOAK

:INSTALL_WITHOUT_ANALYTICS

echo The installation will be completed in the following order
echo 1. form.io
echo 2. web
echo 3. webapi
echo 4. camunda

echo press enter to continue
pause>nul
goto :KEYCLOAK

echo.
echo                                         KEYCLOAK
echo.
  
:KEYCLOAK
cd ..\..\..\forms-flow-idm\keycloak
:keycloak repeat
:choice
set /P c=Do you have an existing keycloak?[y/n]?
if /I "%c%" EQU "y" goto :INSTALL WITH EXISTING KEYCLOAK
if /I "%c%" EQU "n" goto :USE DEFAULT KEYCLOAK SETUP
goto :choice


:USE DEFAULT KEYCLOAK SETUP
echo WE ARE SETING UP OUR DEFAULT KEYCLOCK FOR YOU
echo press enter to continue
pause> nul
findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL" sample.env > .env


for /f "tokens=*" %%s in (.env) do (
 echo %%s
)
echo Please wait, keycloak is setting up!
docker-compose up -d
echo you can pick up the bpm client secret id from localhost:8080
set /p keySecret="what is your bpm client secret key?"
echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% 


:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :keycloak repeat
if /I "%c%" EQU "n" goto :FORMSFLOW FORMS
goto :choice


::------------------------------------------
:INSTALL WITH EXISTING KEYCLOAK
set customKeycloak=1;

echo existing keycloak setup here

set /p keySecret="what is your bpm client secret key?"
echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% 

set /p keyurl="what is your Keycloak url?"
echo KEYCLOAK_URL=%keyurl% 

pause
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :keycloak repeat
if /I "%c%" EQU "n" goto :FORMSFLOW FORMS
goto :choice
::------------------------------------------
echo             KEYCLOAK-ENDS

::=================FORMS-STARTS=========================>
:FORMSFLOW FORMS
cls
echo.
echo.
echo                                          FORMSFLOW FORMS
echo.
cd ..\..\forms-flow-forms

::fetching ip address
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set _IPaddr=%%a

:formsflow repeat
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
echo Please wait, forms is getting up!
	
docker-compose -f docker-compose-windows.yml up -d forms-flow-forms 

pause> nul
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :formsflow repeat
if /I "%c%" EQU "n" goto :ROLS
goto :choice
pause


::------------------------------------------
:FORMS CUSTOM SETUP
echo formsflow custom setup here
echo please wait until the process complete
echo BEFORE MOVING TO THE NEXT STEP PLEASE MAKE SURE THAT FORMSFLOW FORMS IS UP IN http://localhost:3001
echo Press enter to continue!
pause> nul

::------------------------------------------

::================FORMS-ENDS=========================>

::==========FETCHING ROLS=========>
:ROLS
cd .\script
:rols repeat
echo PLEASE MAKE SURE THAT FORMSFLOW FORMS IS UP IN http://localhost:3001
pause> nul
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

pause> nul
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :rols repeat
if /I "%c%" EQU "n" goto :WEB

goto :choice
pause

::==========PASSING ROLIDS========>




::================WEB STARTS=========================>
:WEB
echo.
echo.
echo                                                       FORMS FLOW WEB
echo.
echo.
cd ..\..\forms-flow-web

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
echo Please wait,web is getting up!
docker-compose up -d 

:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :WEB DEFAULT INSTALLATION
if /I "%c%" EQU "n" goto :analycs
goto :choice
pause

::WEB CUSTOM INSTALLATION
::findstr /v /i /c:"CLIENT_ROLE_ID=" /c:"DESIGNER_ROLE_ID=" /c:"REVIEWER_ROLE_ID" /c:"ANONYMOUS_ID" /c:"USER_RESOURCE_ID" sample.env > .env

::setlocal ENABLEDELAYEDEXPANSION
::set /p clientsecret="what is your client role id?"
::echo CLIENT_ROLE_ID=%clientsecret% >> .env

::set /p designer="what is your designer role id?"
::echo DESIGNER_ROLE_ID=%designer% >> .env

::set /p reviewer="what is your reviewer role id?"
::echo REVIEWER_ROLE_ID=%reviewer% >> .env

::set /p anonymous="what is your anonymous id?"
::echo ANONYMOUS_ID=%anonymous% >> .env

::set /p user="what is your user resouce id?"
::echo USER_RESOURCE_ID=%user% >> .env


::for /f "tokens=*" %%s in (.env) do (
::echo %%s
::)

::set /P c=process FAILD with some error? please repeat. [y/n]?
::if /I "%c%" EQU "y" goto :web repeat
::if /I "%c%" EQU "n" goto :analycs
::goto :choice
::pause

:analycs
echo.
echo.
if %analytics% ==1 (
echo you have chosen the option to install analytics.
echo press ENTER to continue
pause> nul
goto :ANALYTICS
)

if %analytics% ==0 (
echo let's move to the installation of api
echo press ENTER to continue
pause> nul
goto :API 
)
::------------------------------------------
:WEB CUSTOM INSTALLATION

echo web custom installation here

if %analytics% ==1 (
echo you have chosen the option to install analytics.
echo press ENTER to continue
pause> nul
goto :ANALYTICS
)

if %analytics% ==0 (
echo let's move to the installation of api
echo press ENTER to continue
pause> nul

goto :API 

::------------------------------------------
::==================WEB-ENDS=========================>







::============ANALYTICS STARTS=======================>
:ANALYTICS
echo.
echo.
echo                                                 ANALYTICS
echo.
echo.
cd ..\forms-flow-analytics


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
docker-compose -f docker-compose-windows.yml run --rm server create_db

echo analytics database has been created.. wait for a moment for the analytics to get up.

docker-compose -f docker-compose-windows.yml up --build -d 

pause
echo please collect the redash api key from localhost:7000
set /p redashApiKey="what is your Redash API key?"
echo INSIGHT_API_KEY=%redashApiKey%

echo press ENTER to move to API installation
pause>nul
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :ANALYTICS DEFAULT INSTALLATION
if /I "%c%" EQU "n" goto :API
goto :choice
pause

::------------------------------------------

::============ANALYTICS ENDS=========================>


::================API STARTS=========================>
:API 
if %customKeycloak% ==1 (
echo WE are using your keycloak information.
echo press ENTER to continue
pause> nul
goto :CUSTOM INSALATION
)

if %customKeycloak% ==0 (
echo let's move to the installation of api
echo press ENTER to continue
pause> nul
goto :API default
)
:API default
echo.
echo.
echo                                                     FORMSFLOW API
echo.
echo.
cd ..\forms-flow-api

:API DEFAULT INSTALLATION

findstr /v /i /c:"INSIGHT_API_URL=" /c:"KEYCLOAK_URL=" /c:"FORMSFLOW_API_URL=" /c:"CAMUNDA_API_URL=" /c:"INSIGHT_API_KEY=" /c:"KEYCLOAK_BPM_CLIENT_SECRET="  sample.env > .env


echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% >> .env

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
echo Please wait, analytics is getting up!
docker-compose -f docker-compose-windows.yml up -d
pause
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :API default
if /I "%c%" EQU "n" goto :newlis
goto :choice
pause

:newlis
echo press ENTER to install BPM
pause> nul
goto :BPM


::------------------------------------------
:CUSTOM INSALATION
cd ..\forms-flow-api
echo API custom installation here
findstr /v /i /c:"INSIGHT_API_URL=" /c:"KEYCLOAK_BPM_CLIENT_SECRET=" /c:"FORMSFLOW_API_URL=" /c:"CAMUNDA_API_URL=" /c:"INSIGHT_API_KEY=" /c:"KEYCLOAK_URL=" sample.env > .env

setlocal ENABLEDELAYEDEXPANSION
set key=%_IPaddr% 
set ste=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
set stng=%ste:{your-ip-address}=!key!%

set api=%_IPaddr% 
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
set strong=%stp:{your-ip-address}=!api!%

set websock=%_IPaddr% 
set lpu=INSIGHT_API_URL=http://{your-ip-address}:7000
set streng=%lpu:{your-ip-address}=!websock!%

echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% >> .env

echo KEYCLOAK_URL=%keyurl% >> .env

echo %stng% >>".env"
echo %strong% >>".env"
echo %streng% >>".env"
KEYCLOAK_ADMIN_USERNAME=admin >> .env
KEYCLOAK_ADMIN_PASSWORD=changeme >> .env


for /f "tokens=*" %%s in (.env) do (
echo %%s
)
echo Please wait, analytics is getting up!
docker-compose -f docker-compose-windows.yml up -d
pause
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :API CUSTOM INSALATION
if /I "%c%" EQU "n" goto :BPM
goto :choice
echo press ENTER to install BPM
pause> nul


::------------------------------------------


::=================API NDS===========================>



::=================BPM STARTS===========================>
:BPM
cls
echo.
echo.
echo                                          FORMSFLOW BPM
echo.
echo.
cd ..\forms-flow-bpm

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

echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% >> .env

for /f "tokens=*" %%s in (.env) do (
echo %%s
)
echo Please wait,bpm is getting up!
docker-compose -f docker-compose-windows.yml up -d forms-flow-bpm 

pause
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :bpm repeat
if /I "%c%" EQU "n" goto :END
goto :choice
pause
goto :END

::------------------------------------------

::=================BPM ENDS===========================>



:END
echo.
echo                               INSTALLATION FLOW IS COMPLETED
echo.
Pause