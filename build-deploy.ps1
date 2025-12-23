$env:NEXT_PUBLIC_CONVEX_URL = "https://grand-leopard-173.convex.cloud"
Set-Location c:\Code\songup\songup

Write-Host "Building with Convex URL: $env:NEXT_PUBLIC_CONVEX_URL"
.\.node\npm.cmd run build

Write-Host "Copying static files..."
Copy-Item -Path ".next\static" -Destination ".next\standalone\.next\static" -Recurse -Force
Copy-Item -Path "public" -Destination ".next\standalone\public" -Recurse -Force

Write-Host "Creating deploy package..."
Remove-Item deploy.zip -Force -ErrorAction SilentlyContinue
Compress-Archive -Path ".next\standalone\*" -DestinationPath deploy.zip -Force

Write-Host "Deploying to Azure..."
az webapp config appsettings set --name songup-karaoke-eltbyspbfuopy --resource-group rg-karaoke-aueast --settings NEXT_PUBLIC_CONVEX_URL=https://grand-leopard-173.convex.cloud CONVEX_SITE_URL=https://grand-leopard-173.convex.site
az webapp deploy --name songup-karaoke-eltbyspbfuopy --resource-group rg-karaoke-aueast --src-path deploy.zip --type zip

Write-Host "Done!"
