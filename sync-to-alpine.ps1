# Sync script for Alpine VM deployment
# Only copies files that have been modified

$vmIP = "10.100.2.205"
$remotePath = "/opt/karaoke/app"
$localPath = "."

# Excludes
$excludeDirs = @(
    "node_modules",
    ".next",
    "logs",
    "logs2",
    "logs3",
    "logs4",
    "logs5",
    "logs6",
    "test-results",
    "playwright-report",
    "convex-bundle"
)

Write-Host "Syncing updated files to Alpine VM..." -ForegroundColor Cyan

# Use scp with tar for efficient transfer of changed files
# Create archive excluding large directories
$excludeArgs = $excludeDirs | ForEach-Object { "--exclude='$_'" }
$tarCmd = "tar $($excludeArgs -join ' ') -czf - . | ssh root@$vmIP 'cd $remotePath && tar -xzf -'"

Write-Host "Command: $tarCmd" -ForegroundColor Yellow
Invoke-Expression $tarCmd

Write-Host "`nSync complete!" -ForegroundColor Green
