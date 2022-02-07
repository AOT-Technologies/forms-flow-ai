@echo off

::=================== INIT =====================>
:Installation
::fetching ip address
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set _IPaddr=%%a

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
echo 1. keycloak
echo 2. form.io
echo 3. analytics
echo 4. web
echo 5. webapi
echo 6. camunda


echo press enter to continue
pause> null 
goto :KEYCLOAK

:INSTALL_WITHOUT_ANALYTICS

echo The installation will be completed in the following order
echo 1. keycloak
echo 2. form.io
echo 3. web
echo 4. webapi
echo 5. camunda

echo press enter to continue
pause>nul
goto :KEYCLOAK

echo.
echo                                         KEYCLOAK
echo.
  
:KEYCLOAK
cd configuration\keycloak

set /P c=Do you have an existing keycloak?[y/n]?
if /I "%c%" EQU "y" goto :INSTALL WITH EXISTING KEYCLOAK
if /I "%c%" EQU "n" goto :USE DEFAULT KEYCLOAK SETUP
goto :choice

:USE DEFAULT KEYCLOAK SETUP
echo WE ARE SETING UP OUR DEFAULT KEYCLOCK FOR YOU
echo press enter to continue
pause> nul
findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL" sample.env > .env
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set _IPaddr=%%a


for /f "tokens=*" %%s in (.env) do (
 echo %%s
)
echo Please wait, keycloak is setting up!
docker-compose up -d
echo you can pick up the bpm client secret id from localhost:8080
set /p realm="what is your keycloak url realm name?"
echo.
echo.
echo KEYCLOAK_URL_REALM=%realm% >> .env

set keycloak_url=%_IPaddr%
set str=KEYCLOAK_URL=http://{your-ip-address}:8080
set strng=%str:{your-ip-address}=!keycloak_url!% >> .env

set /p keySecret="what is your bpm client secret key?"
echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% >> .env

:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :KEYCLOAK
if /I "%c%" EQU "n" goto :analycs
goto :choice
pause


:INSTALL WITH EXISTING KEYCLOAK
set customKeycloak=1;

echo existing keycloak setup here

set /p keySecret="what is your bpm client secret key?"
echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret% 

set /p keyurl="what is your Keycloak url?"
echo KEYCLOAK_URL=%keyurl%

set /p realm="what is your keycloak url realm name?"
echo KEYCLOAK_URL_REALM=%realm% >> .env

:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :keycloak repeat
if /I "%c%" EQU "n" goto :analycs
goto :choice
pause

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
echo let's move to the installation without analytics
echo press ENTER to continue
pause> nul
goto :end 
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

::<===================ANALYTICS STARTS=======================>
:ANALYTICS
echo.
echo.
echo                                                 ANALYTICS
echo.
echo.
cd ..\analytics

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
echo INSIGHT_API_KEY=%redashApiKey% >> .env

echo press ENTER to move to next installation
pause>nul
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :ANALYTICS DEFAULT INSTALLATION
if /I "%c%" EQU "n" goto :end
goto :choice
pause

::------------------------------------------

::============ANALYTICS ENDS=========================>

:configuration section
echo.
echo.
echo                                                 
echo.
echo.
cd ..\sample.env
echo %cd%
pause

findstr /v /i /c:"FORMIO_DEFAULT_PROJECT_URL=" /c:"#KEYCLOAK_URL_REALM=" /c:"KEYCLOAK_URL=" /c:"KEYCLOAK_BPM_CLIENT_SECRET=" /c:"INSIGHT_API_URL=" /c:"INSIGHT_API_KEY=" /c:"CLIENT_ROLE_ID=" /c:"DESIGNER_ROLE_ID=" /c:"REVIEWER_ROLE_ID" /c:"ANONYMOUS_ID" /c:"USER_RESOURCE_ID" /c:"CAMUNDA_API_URL=" /c:"FORMSFLOW_API_URL=" /c:"WEBSOCKET_SECURITY_ORIGIN=" sample.env > .env

for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set _IPaddr=%%a

setlocal ENABLEDELAYEDEXPANSION

set default_url=%_IPaddr%
set str=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
set strng=%str:{your-ip-address}=!default_url!%

echo KEYCLOAK_URL_REALM=%realm%

set keycloak_url=%_IPaddr%
set str=KEYCLOAK_URL=http://{your-ip-address}:8080
set strng=%str:{your-ip-address}=!keycloak_url!%

echo KEYCLOAK_BPM_CLIENT_SECRET=%keySecret%

set API_URL=%_IPaddr%
set url=INSIGHT_API_URL=http://{your-ip-address}:7000
set strinnng=%url:{your-ip-address}=!API_URL!%

echo INSIGHT_API_KEY=%redashApiKey%

echo Please wait, forms is getting up!
	
docker-compose -f docker-compose-windows.yml up -d forms-flow-forms 

set websock=%_IPaddr%
set lpu=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
set streng=%lpu:{your-ip-address}=!websock!%

set api=%_IPaddr%
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000
set strong=%stp:{your-ip-address}=!api!%

set websock=%_IPaddr%
set lpu=WEBSOCKET_SECURITY_ORIGIN=http://{your-ip-address}:3000
set streng=%lpu:{your-ip-address}=!websock!%



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

pause

echo need to add some more files for the complete flow


echo CLIENT_ROLE_ID=%formsflowClient% >> .env
echo DESIGNER_ROLE_ID=%Administrator% >> .env
echo REVIEWER_ROLE_ID=%formsflowReviewer% >> .env
echo ANONYMOUS_ID=%Anonymous% >> .env
echo USER_RESOURCE_ID=%User% >> .env

for /f "tokens=*" %%s in (.env) do (
echo %%s
)

pause> nul
:choice
set /P c=process FAILD with some error? please repeat. [y/n]?
if /I "%c%" EQU "y" goto :configuration section
if /I "%c%" EQU "n" goto :end
goto :choice
pause
:end
echo automation comleted
