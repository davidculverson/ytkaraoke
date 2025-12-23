<#
.SYNOPSIS
    Deploy SongUp for a single event/party
.DESCRIPTION
    One-click deployment script for karaoke.culverson.me
.EXAMPLE
    .\deploy.ps1 -ConvexUrl "https://your-project.convex.cloud"
    .\deploy.ps1 -ConvexUrl "https://your-project.convex.cloud" -CustomDomain "karaoke.culverson.me"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ConvexUrl,
    
    [string]$CustomDomain = "",
    
    [string]$ResourceGroup = "rg-karaoke-event",
    
    [string]$Location = "eastus"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SongUp Karaoke - Event Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Azure CLI
Write-Host "Checking Azure CLI..." -ForegroundColor Yellow
try {
    $account = az account show --query name -o tsv 2>$null
    Write-Host "Logged in as: $account" -ForegroundColor Green
} catch {
    Write-Host "Please login to Azure first:" -ForegroundColor Red
    Write-Host "  az login" -ForegroundColor Yellow
    exit 1
}

# Create resource group
Write-Host "`nCreating resource group: $ResourceGroup..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
Write-Host "Resource group created." -ForegroundColor Green

# Deploy infrastructure
Write-Host "`nDeploying Azure infrastructure..." -ForegroundColor Yellow
Write-Host "(This takes 2-3 minutes)" -ForegroundColor Gray

$deployParams = @(
    "--resource-group", $ResourceGroup,
    "--template-file", "infra/single-event.bicep",
    "--parameters", "convexUrl=$ConvexUrl"
)

if ($CustomDomain) {
    $deployParams += "--parameters"
    $deployParams += "customDomain=$CustomDomain"
}

$deployment = az deployment group create @deployParams --query "properties.outputs" -o json | ConvertFrom-Json

$webAppName = $deployment.webAppName.value
$webAppUrl = $deployment.webAppUrl.value
$functionAppName = $deployment.functionAppName.value
$functionAppUrl = $deployment.functionAppUrl.value

Write-Host "Infrastructure deployed!" -ForegroundColor Green

# Build Next.js app
Write-Host "`nBuilding Next.js application..." -ForegroundColor Yellow
if (Test-Path ".\.node\node.exe") {
    $env:PATH = "$PWD\.node;$env:PATH"
}
npm run build

# Create deployment package
Write-Host "`nCreating deployment package..." -ForegroundColor Yellow
$zipPath = "deploy-package.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

# Compress for deployment
Compress-Archive -Path ".next", "package.json", "next.config.ts", "public", "node_modules" -DestinationPath $zipPath -Force

# Deploy to Azure
Write-Host "`nDeploying to Azure Web App..." -ForegroundColor Yellow
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --src $zipPath `
    --output none

# Clean up zip
Remove-Item $zipPath -ErrorAction SilentlyContinue

# Deploy Flask API
Write-Host "`nDeploying Flask API..." -ForegroundColor Yellow
Push-Location api/flask
$apiZip = "..\..\api-deploy.zip"
if (Test-Path $apiZip) { Remove-Item $apiZip }
Compress-Archive -Path "*" -DestinationPath $apiZip -Force
Pop-Location

az functionapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $functionAppName `
    --src $apiZip `
    --output none

Remove-Item $apiZip -ErrorAction SilentlyContinue

# Success message
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Your karaoke app is ready at:" -ForegroundColor Cyan
Write-Host "  $webAppUrl" -ForegroundColor White

if ($CustomDomain) {
    Write-Host "`nCustom domain: https://$CustomDomain" -ForegroundColor Cyan
    Write-Host "`nDNS Configuration Required:" -ForegroundColor Yellow
    Write-Host "  Add a CNAME record:" -ForegroundColor Gray
    Write-Host "    Name: $(($CustomDomain -split '\.')[0])" -ForegroundColor White
    Write-Host "    Value: $($webAppUrl -replace 'https://','')" -ForegroundColor White
    
    # Get verification ID
    $verificationId = az webapp show --resource-group $ResourceGroup --name $webAppName --query "customDomainVerificationId" -o tsv
    Write-Host "`n  Add a TXT record for verification:" -ForegroundColor Gray
    Write-Host "    Name: asuid.$(($CustomDomain -split '\.')[0])" -ForegroundColor White
    Write-Host "    Value: $verificationId" -ForegroundColor White
}

Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "When the event is over, run:" -ForegroundColor Yellow
Write-Host "  .\destroy.ps1" -ForegroundColor White
Write-Host "  (or: az group delete --name $ResourceGroup --yes)" -ForegroundColor Gray
Write-Host "----------------------------------------`n" -ForegroundColor Gray

# Save deployment info for destroy script
@{
    ResourceGroup = $ResourceGroup
    WebAppUrl = $webAppUrl
    DeployedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json | Out-File ".deployment-info.json"
