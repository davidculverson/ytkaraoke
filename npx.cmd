@echo off
REM Wrapper script to run npx from local installation
setlocal

set "NODE_DIR=%~dp0.node"
set "PATH=%NODE_DIR%;%PATH%"

if not exist "%NODE_DIR%\npx.cmd" (
    echo Node.js not found. Run setup-node.ps1 first.
    echo   powershell -ExecutionPolicy Bypass -File setup-node.ps1
    exit /b 1
)

"%NODE_DIR%\npx.cmd" %*
