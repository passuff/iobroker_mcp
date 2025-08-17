@echo off
echo Installing ioBroker MCP Server (Standalone)...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your ioBroker settings!
    echo.
)

REM Build the project
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build project!
    pause
    exit /b 1
)

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Edit .env file with your ioBroker connection details
echo 2. Run 'test-server.bat' to test the connection
echo 3. Add to Cursor using the path: %CD%\dist\index.js
echo.
pause 