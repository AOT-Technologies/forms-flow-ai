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

::============ANALYTICS STARTS=======================>
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

: end

echo installation over
