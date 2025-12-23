<#
.SYNOPSIS
    Destroy SongUp deployment after the event
.DESCRIPTION
    Removes all Azure resources created by deploy.ps1
    This will permanently delete all data!
#>

param(
    [string]$ResourceGroup = "",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "  SongUp Karaoke - DESTROY Deployment" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

# Try to load deployment info
$deploymentInfo = $null
if (Test-Path ".deployment-info.json") {
    $deploymentInfo = Get-Content ".deployment-info.json" | ConvertFrom-Json
    if (-not $ResourceGroup) {
        $ResourceGroup = $deploymentInfo.ResourceGroup
    }
    Write-Host "Found deployment from: $($deploymentInfo.DeployedAt)" -ForegroundColor Gray
    Write-Host "URL: $($deploymentInfo.WebAppUrl)" -ForegroundColor Gray
}

if (-not $ResourceGroup) {
    $ResourceGroup = "rg-karaoke-event"
}

Write-Host "`nThis will DELETE the resource group: $ResourceGroup" -ForegroundColor Yellow
Write-Host "All resources and data will be permanently removed!`n" -ForegroundColor Yellow

# Confirm unless -Force is specified
if (-not $Force) {
    $confirm = Read-Host "Are you sure? Type 'DELETE' to confirm"
    if ($confirm -ne "DELETE") {
        Write-Host "`nAborted. Nothing was deleted." -ForegroundColor Green
        exit 0
    }
}

# Check if resource group exists
Write-Host "`nChecking resource group..." -ForegroundColor Yellow
$exists = az group exists --name $ResourceGroup
if ($exists -eq "false") {
    Write-Host "Resource group '$ResourceGroup' does not exist." -ForegroundColor Yellow
    Write-Host "Nothing to delete." -ForegroundColor Green
    exit 0
}

# List resources being deleted
Write-Host "`nResources to be deleted:" -ForegroundColor Yellow
az resource list --resource-group $ResourceGroup --query "[].{Name:name, Type:type}" -o table

# Delete resource group
Write-Host "`nDeleting resource group (this may take a few minutes)..." -ForegroundColor Yellow
az group delete --name $ResourceGroup --yes --no-wait

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deletion Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nThe resource group is being deleted in the background." -ForegroundColor Gray
Write-Host "This typically takes 2-5 minutes to complete." -ForegroundColor Gray
Write-Host "`nYou can check status with:" -ForegroundColor Yellow
Write-Host "  az group show --name $ResourceGroup --query properties.provisioningState -o tsv" -ForegroundColor White
Write-Host "`nOr verify deletion with:" -ForegroundColor Yellow
Write-Host "  az group exists --name $ResourceGroup" -ForegroundColor White

# Clean up local deployment info
if (Test-Path ".deployment-info.json") {
    Remove-Item ".deployment-info.json"
    Write-Host "`nCleaned up local deployment info." -ForegroundColor Gray
}

Write-Host "`nThank you for using SongUp! 🎤`n" -ForegroundColor Cyan
