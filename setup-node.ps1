<# 
.SYNOPSIS
    Downloads and sets up a local Node.js installation for this project.
.DESCRIPTION
    This script downloads a portable Node.js installation to the .node folder
    so the project can run without requiring a global Node.js installation.
#>

$ErrorActionPreference = "Stop"

$NODE_VERSION = "22.12.0"
$NODE_DIR = Join-Path $PSScriptRoot ".node"
$NODE_ZIP = Join-Path $PSScriptRoot "node.zip"
$NODE_URL = "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-win-x64.zip"

# Check if Node.js is already installed locally
if (Test-Path (Join-Path $NODE_DIR "node.exe")) {
    Write-Host "Node.js is already installed locally." -ForegroundColor Green
    Write-Host "Version: $(& (Join-Path $NODE_DIR 'node.exe') --version)"
    exit 0
}

Write-Host "Downloading Node.js v$NODE_VERSION..." -ForegroundColor Cyan

# Create .node directory
if (-not (Test-Path $NODE_DIR)) {
    New-Item -ItemType Directory -Path $NODE_DIR | Out-Null
}

# Download Node.js
try {
    $ProgressPreference = 'SilentlyContinue'  # Speeds up download
    Invoke-WebRequest -Uri $NODE_URL -OutFile $NODE_ZIP -UseBasicParsing
    Write-Host "Download complete." -ForegroundColor Green
} catch {
    Write-Host "Failed to download Node.js: $_" -ForegroundColor Red
    exit 1
}

# Extract Node.js
Write-Host "Extracting Node.js..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $NODE_ZIP -DestinationPath $PSScriptRoot -Force
    
    # Move contents from nested folder to .node
    $extractedFolder = Join-Path $PSScriptRoot "node-v$NODE_VERSION-win-x64"
    Get-ChildItem -Path $extractedFolder | Move-Item -Destination $NODE_DIR -Force
    
    # Cleanup
    Remove-Item -Path $extractedFolder -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $NODE_ZIP -Force -ErrorAction SilentlyContinue
    
    Write-Host "Node.js v$NODE_VERSION installed successfully!" -ForegroundColor Green
    Write-Host "Location: $NODE_DIR" -ForegroundColor Gray
} catch {
    Write-Host "Failed to extract Node.js: $_" -ForegroundColor Red
    Remove-Item -Path $NODE_ZIP -Force -ErrorAction SilentlyContinue
    exit 1
}

# Verify installation
$nodeExe = Join-Path $NODE_DIR "node.exe"
if (Test-Path $nodeExe) {
    Write-Host "`nVerifying installation..." -ForegroundColor Cyan
    Write-Host "Node.js version: $(& $nodeExe --version)" -ForegroundColor Green
    Write-Host "npm version: $(& (Join-Path $NODE_DIR 'npm.cmd') --version)" -ForegroundColor Green
    Write-Host "`nRun '.\node.cmd <args>' to use Node.js" -ForegroundColor Yellow
    Write-Host "Run '.\npm.cmd <args>' to use npm" -ForegroundColor Yellow
} else {
    Write-Host "Installation verification failed!" -ForegroundColor Red
    exit 1
}
