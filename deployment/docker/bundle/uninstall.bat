@echo off

set /p choice=Do you want to uninstall formsflow.ai installation? [y/n]
if %choice%==y (
    set /a uninstall=1
) else (
    set /a uninstall=0
)

if %uninstall%==1 (
    call:main
)

echo ********************** formsflow.ai is successfully uninstalled ****************************


EXIT /B %ERRORLEVEL%


:: ================&&&&&&===  Functions  ====&&&&&&&&&============================

:: #############################################################
:: ################### Main Function ###########################
:: #############################################################

:main
    set /p choice=Do you want to uninstall Keycloak? [y/n]
    if %choice%==y (
        call:keycloak configuration\keycloak
    )
    call:forms-flow-all configuration
    call:forms-flow-analytics configuration\forms-flow-analytics
    call:prune-docker
    call:clear-dir configuration
    EXIT /B 0
	

:: #############################################################
:: ########################### Keycloak ########################
:: #############################################################

:keycloak

    if exist %~1 (
	    docker-compose -f %~1\docker-compose.yml down
	)
    EXIT /B 0
   
:: #############################################################
:: ################### forms-flow-forms ########################
:: #############################################################

:forms-flow-all

    if exist %~1 (
        docker-compose -f %~1\docker-compose.yml down
	)
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-analytics ########################
:: #############################################################

:forms-flow-analytics

    if exist %~1 (
        docker-compose -f %~1\docker-compose.yml down
	)
    EXIT /B 0

:: ##############################################################
:: ##############################################################

:clear-dir
    if exist %~1 (
        del /Q /S "config.js" ".env"
   EXIT /B 0
	
:: #############################################################
:: ############# clearing dangling images ######################
:: #############################################################

:prune-docker
    docker volume prune -f
