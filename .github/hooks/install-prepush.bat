@ECHO OFF
SETLOCAL ENABLEEXTENSIONS

ECHO 🔧 Installing pre-push Git hook...

REM Detect Git root directory
FOR /F "delims=" %%D IN ('git rev-parse --show-toplevel 2^>NUL') DO SET "GIT_ROOT=%%D"

IF NOT DEFINED GIT_ROOT (
    ECHO ❌ Error: .git directory not found. Please run this script inside a Git repository.
    EXIT /B 1
)

REM Set Snyk token
SET "SNYK_TOKEN=7dbc5585-8fea-46fe-b80a-8af40fa7366b"

REM Copy hook
COPY /Y "%~dp0pre-push" "%GIT_ROOT%\.git\hooks\pre-push" > NUL
IF ERRORLEVEL 1 (
    ECHO ❌ Failed to copy pre-push hook.
    EXIT /B 1
)

ECHO 📋 Pre-push hook copied.

REM Check if Snyk CLI exists
ECHO 🔍 Checking Snyk CLI...
WHERE snyk >NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO ❌ Snyk CLI not found. Please install it from https://docs.snyk.io/install
    EXIT /B 1
)

REM Authenticate Snyk CLI
ECHO 🔐 Authenticating Snyk CLI using token...
snyk config set api=%SNYK_TOKEN% > NUL 2>&1

REM Confirm token is set
FOR /F "tokens=*" %%A IN ('snyk config get api') DO SET "CONFIGURED_TOKEN=%%A"

IF "%CONFIGURED_TOKEN%"=="%SNYK_TOKEN%" (
    ECHO ✅ Snyk CLI authenticated successfully!
    ECHO ✅ Pre-push Git hook installed successfully!
    EXIT /B 0
) ELSE (
    ECHO ❌ Authentication failed. Token not set correctly.
    EXIT /B 1
)
