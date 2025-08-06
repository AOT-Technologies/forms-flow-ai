@ECHO OFF
SETLOCAL ENABLEEXTENSIONS

ECHO 🔧 Installing Git hooks...

REM Detect Git root directory
FOR /F "delims=" %%D IN ('git rev-parse --show-toplevel 2^>NUL') DO SET "GIT_ROOT=%%D"

IF NOT DEFINED GIT_ROOT (
    ECHO ❌ Error: .git directory not found. Please run this script inside a Git repository.
    EXIT /B 1
)

REM Copy pre-push hook
COPY /Y "%~dp0pre-push" "%GIT_ROOT%\.git\hooks\pre-push" > NUL
IF ERRORLEVEL 1 (
    ECHO ❌ Failed to copy pre-push hook.
    EXIT /B 1
)
ECHO ✅ Pre-push hook installed.

REM Copy pre-commit hook
COPY /Y "%~dp0pre-commit" "%GIT_ROOT%\.git\hooks\pre-commit" > NUL
IF ERRORLEVEL 1 (
    ECHO ❌ Failed to copy pre-commit hook.
    EXIT /B 1
)
ECHO ✅ Pre-commit hook installed.

REM Copy .env file for hooks
IF EXIST "%~dp0.env" (
    COPY /Y "%~dp0.env" "%GIT_ROOT%\.git\hooks\.env" > NUL
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
FOR /F "tokens=1,2 delims==" %%A IN (%~dp0.env) DO (
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
"%SNYK_CMD%" config set api=%SNYK_TOKEN% > NUL 2>&1

REM Confirm token is set
FOR /F "tokens=*" %%A IN ('"%SNYK_CMD%" config get api') DO SET "CONFIGURED_TOKEN=%%A"

IF "%CONFIGURED_TOKEN%"=="%SNYK_TOKEN%" (
    ECHO ✅ Snyk CLI authenticated successfully!
    ECHO ✅ Git hooks installed successfully!
    EXIT /B 0
) ELSE (
    ECHO ❌ Authentication failed. Token not set correctly.
    EXIT /B 1
)
