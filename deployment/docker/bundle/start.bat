@echo off

::=================== INIT =====================>
:Installation
::fetching ip address
FOR /F "tokens=4 delims= " %%i in ('route print ^| find " 0.0.0.0"') do set localIp=%%i

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
echo 5. camunda
echo 6. webapi


echo press enter to continue
pause> null 
goto :KEYCLOAK

:INSTALL_WITHOUT_ANALYTICS

echo The installation will be completed in the following order
echo 1. keycloak
echo 2. form.io
echo 3. web
echo 4. camunda
echo 5. webapi

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
pause> nuls
copy sample.env .env
FOR /F "tokens=4 delims= " %%i in ('route print ^| find " 0.0.0.0"') do set localIp=%%i

echo Please wait, keycloak is setting up!
docker-compose up -d
timeout 8
echo.
echo.

setlocal ENABLEDELAYEDEXPANSION

set keyurl=%localIp%
set str=KEYCLOAK_URL=http://{your-ip-address}:8080
set keyurls=%str:{your-ip-address}=!keyurl!%
set /p keysecret="What is your bpm client secret key?"
set realmname=forms-flow-ai

echo. >>".env"
echo KEYCLOAK_URL_REALM=%realmname%>>.env
echo %keyurls%>>".env"
echo KEYCLOAK_BPM_CLIENT_SECRET=%keysecret%>>.env

goto :analyticsoption

:INSTALL WITH EXISTING KEYCLOAK
set customKeycloak=1;

echo existing keycloak setup here

set /p keySecret="what is your bpm client secret key?"

set /p keyurls="what is your Keycloak url?"

set /p realmname="what is your keycloak url realm name?"

goto :analyticsoption


:analyticsoption
echo.
echo.
if %analytics% ==1 (
echo.
echo press ENTER to continue
pause> nul
goto :ANALYTICS
)

if %analytics% ==0 (
echo let's move to the installation 
echo press ENTER to continue
pause> nul
goto :configuration section
)
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
FOR /F "tokens=4 delims= " %%i in ('route print ^| find " 0.0.0.0"') do set localIp=%%i

setlocal ENABLEDELAYEDEXPANSION
set key=%localIp%
set ste=REDASH_HOST=http://{your-ip-address}:7000
set strng=%ste:{your-ip-address}=!key!%
echo %strng%>>".env"

docker-compose -f docker-compose-windows.yml run --rm server create_db

echo Wait for a moment for the analytics to start.

docker-compose -f docker-compose-windows.yml up --build -d 

pause
echo please collect the redash api key
set /p redashApiKey="what is your Redash API key?"
echo INSIGHT_API_KEY=%redashApiKey%>>.env

echo press ENTER to move to next installation
pause>nul
goto :configuration section

::------------------------------------------

::============ANALYTICS ENDS=========================>

:configuration section
echo.
echo.
echo                                                  Installation-Automation                                                                        
echo.
echo.
cd ..

FOR /F "tokens=4 delims= " %%i in ('route print ^| find " 0.0.0.0"') do set localIp=%%i

setlocal ENABLEDELAYEDEXPANSION

set default_url=%localIp%
set ste=FORMIO_DEFAULT_PROJECT_URL=http://{your-ip-address}:3001
set strong=%ste:{your-ip-address}=!default_url!%

set keycloak_url=%localIp%
set str=KEYCLOAK_URL=http://{your-ip-address}:8080
set keyurls=%str:{your-ip-address}=!keycloak_url!%

set API_URL=%localIp%
set url=INSIGHT_API_URL=http://{your-ip-address}:7000
set strinnng=%url:{your-ip-address}=!API_URL!%

echo Please wait, forms is getting up!
	
docker-compose -f docker-compose.yml up --build -d forms-flow-forms
timeout 40

set websock=%localIp%
set lpi=CAMUNDA_API_URL=http://{your-ip-address}:8000/camunda
set streng=%lpi:{your-ip-address}=!websock!%

set api=%localIp%
set stp=FORMSFLOW_API_URL=http://{your-ip-address}:5000/api
set strongs=%stp:{your-ip-address}=!api!%

set websock=%localIp%
set lpu=WEBSOCKET_SECURITY_ORIGIN=http://{your-ip-address}:3000
set streeng=%lpu:{your-ip-address}=!websock!%

echo.
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

set Administrator=%id[0]%
set Anonymous=%id[1]%
set Authenticated=%id[2]%
set formsflowClient=%id[3]%
set formsflowReviewer=%id[4]%
set User=%id[5]%

echo Press enter to continue!
pause> nul

echo %strong%>>.env
echo %strinnng%>>.env
echo KEYCLOAK_URL_REALM=%realmname%>>.env
echo %keyurls%>>.env
echo KEYCLOAK_BPM_CLIENT_SECRET=%keysecret%>>.env
echo INSIGHT_API_KEY=%redashApiKey%>>.env
echo %streng%>>.env
echo %strongs%>>.env
echo %streeng%>>.env
echo CLIENT_ROLE_ID=%formsflowClient%>>.env
echo DESIGNER_ROLE_ID=%Administrator%>>.env
echo REVIEWER_ROLE_ID=%formsflowReviewer%>>.env
echo ANONYMOUS_ID=%Anonymous%>>.env
echo USER_RESOURCE_ID=%User%>>.env

docker-compose up --build -d

echo.
echo.
echo Installation Automation completed

pause> nul


