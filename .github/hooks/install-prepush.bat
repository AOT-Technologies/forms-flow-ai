@ECHO OFF
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

ECHO 🔧 Installing Git hooks...

REM Detect Git root directory
FOR /F "delims=" %%D IN ('git rev-parse --show-toplevel 2^>NUL') DO SET "GIT_ROOT=%%D"

IF NOT DEFINED GIT_ROOT (
    ECHO ❌ Error: .git directory not found. Please run this script inside a Git repository.
    EXIT /B 1
)

REM Rename sample.env to .env if .env doesn't already exist
IF EXIST "%~dp0sample.env" (
    IF NOT EXIST "%~dp0.env" (
        REN "%~dp0sample.env" ".env"
        IF ERRORLEVEL 1 (
            ECHO ❌ Failed to rename sample.env to .env.
            EXIT /B 1
        )
        ECHO ✅ sample.env renamed to .env successfully.
    ) ELSE (
        ECHO ⚠️  .env already exists. Skipping rename.
    )
) ELSE (
    ECHO ❌ sample.env file not found in the script directory.
    EXIT /B 1
)

SET "HOOKS_DIR=%GIT_ROOT%\.git\hooks"
SET "GH_HOOKS_LOG_DIR=%GIT_ROOT%\.github\hooks"

REM Create .github/hooks directory if not exists
IF NOT EXIST "%GH_HOOKS_LOG_DIR%" (
    mkdir "%GH_HOOKS_LOG_DIR%"
)

REM Copy pre-push hook
COPY /Y "%~dp0pre-push" "%HOOKS_DIR%\pre-push" >NUL
IF ERRORLEVEL 1 (
    ECHO ❌ Failed to copy pre-push hook.
    EXIT /B 1
)

REM Set executable permission if using Git Bash or WSL
IF EXIST "%HOOKS_DIR%\pre-push" (
    bash -c "chmod +x '%HOOKS_DIR%/pre-push'" 2>NUL
)
ECHO ✅ Pre-push hook installed.

REM Copy .env file for hooks
IF EXIST "%~dp0.env" (
    COPY /Y "%~dp0.env" "%HOOKS_DIR%\.env" >NUL
    IF ERRORLEVEL 1 (
        ECHO ❌ Failed to copy .env file.
        EXIT /B 1
    )
    ECHO ✅ .env file copied successfully.
) ELSE (
    ECHO ❌ .env file not found in the script directory.
    EXIT /B 1
)

REM Load SNYK_TOKEN from .env
SET "SNYK_TOKEN="
FOR /F "usebackq tokens=1,* delims==" %%A IN ("%~dp0.env") DO (
    IF /I "%%A"=="SNYK_TOKEN" SET "SNYK_TOKEN=%%B"
)

IF NOT DEFINED SNYK_TOKEN (
    ECHO ❌ SNYK_TOKEN not set in .env file.
    EXIT /B 1
)

REM Check if Snyk CLI exists
ECHO 🔍 Checking Snyk CLI...
WHERE snyk >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO ⚠️  Snyk CLI not found. Downloading Snyk for Windows...

    REM Check if curl exists
    WHERE curl >NUL 2>&1
    IF %ERRORLEVEL% EQU 0 (
        curl -s https://static.snyk.io/cli/latest/snyk-win.exe -o "%GIT_ROOT%\snyk.exe"
    ) ELSE (
        powershell -Command "Invoke-WebRequest -Uri 'https://static.snyk.io/cli/latest/snyk-win.exe' -OutFile '%GIT_ROOT%\snyk.exe'"
    )

    IF ERRORLEVEL 1 (
        ECHO ❌ Failed to download Snyk CLI.
        EXIT /B 1
    )

    ECHO ✅ Snyk CLI downloaded successfully to %GIT_ROOT%\snyk.exe
    SET "SNYK_CMD=%GIT_ROOT%\snyk.exe"
) ELSE (
    ECHO ✅ Snyk CLI already installed.
    SET "SNYK_CMD=snyk"
)

REM Authenticate Snyk CLI
ECHO 🔐 Authenticating Snyk CLI using token from .env...
"%SNYK_CMD%" config set api=%SNYK_TOKEN% >NUL 2>&1

REM Confirm token is set correctly
FOR /F "tokens=* USEBACKQ" %%T IN (`"%SNYK_CMD%" config get api 2^>NUL`) DO SET "CONFIGURED_TOKEN=%%T"

IF "%CONFIGURED_TOKEN%"=="%SNYK_TOKEN%" (
    ECHO ✅ Snyk CLI authenticated successfully!
    ECHO ✅ Git hooks installed successfully!
    EXIT /B 0
) ELSE (
    ECHO ❌ Authentication failed. Token not set correctly.
    EXIT /B 1
)
