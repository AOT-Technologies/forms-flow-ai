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
        call:keycloak source\forms-flow-idm\keycloak
    )
    call:forms-flow-bpm source\forms-flow-bpm
    call:forms-flow-analytics source\forms-flow-analytics
    call:forms-flow-api source\forms-flow-api
	call:forms-flow-forms source\forms-flow-forms
    call:forms-flow-web source\forms-flow-web
    call:prune-docker
    call:clear-dir source
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

:forms-flow-forms

    if exist %~1 (
        docker-compose -f %~1\docker-compose-windows.yml down
	)
    EXIT /B 0


:: #########################################################################
:: ######################### forms-flow-web ################################
:: #########################################################################

:forms-flow-web

    if exist %~1 (
        docker-compose -f %~1\docker-compose.yml down
	)
    EXIT /B 0


:: #############################################################
:: ################### forms-flow-bpm ########################
:: #############################################################

:forms-flow-bpm

    if exist %~1 (
        docker-compose -f %~1\docker-compose-windows.yml down
	)
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-analytics ########################
:: #############################################################

:forms-flow-analytics

    if exist %~1 (
        docker-compose -f %~1\docker-compose-windows.yml down
	)
    EXIT /B 0

:: #############################################################
:: ################### forms-flow-api ########################
:: #############################################################

:forms-flow-api

    if exist %~1 (
        docker-compose -f %~1\docker-compose-windows.yml down
	)
    EXIT /B 0

:: #############################################################
:: ################ clearing directory #########################
:: #############################################################

:clear-dir
    if exist %~1 (
        rmdir /s /q %~1
    )
    EXIT /B 0
	
:: #############################################################
:: ############# clearing dangling images ######################
:: #############################################################

:prune-docker
    docker system prune -f
    docker volume prune -f