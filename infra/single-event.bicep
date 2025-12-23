// Azure Infrastructure for SongUp - Single Event / Low-Cost Version
// Optimized for easy deployment and decommissioning
// Estimated cost: ~$0-5 for a single event (few hours/days)

@description('The custom domain name (optional)')
param customDomain string = ''

@description('The Azure region for resources')
param location string = resourceGroup().location

@description('The Convex deployment URL')
@secure()
param convexUrl string

var appName = 'songup-karaoke'
var appServicePlanName = '${appName}-plan'
var webAppName = '${appName}-${uniqueString(resourceGroup().id)}'
var functionAppName = '${appName}-api-${uniqueString(resourceGroup().id)}'
var storageAccountName = 'songup${uniqueString(resourceGroup().id)}'

// App Service Plan - FREE tier (F1)
// No VM quota needed, runs on shared infrastructure
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'F1'  // Free tier - no custom domain SSL but no quota issues
    tier: 'Free'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Web App for Next.js frontend
resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appSettings: [
        {
          name: 'NEXT_PUBLIC_CONVEX_URL'
          value: convexUrl
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      alwaysOn: false  // Save costs - app will cold start
      http20Enabled: true
      minTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}

// Storage Account for Function App (minimal settings)
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'  // Cheapest option
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Function App - Consumption plan (pay per execution, essentially free for low usage)
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    reserved: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'python'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://${webApp.properties.defaultHostName}'
          customDomain != '' ? 'https://${customDomain}' : 'https://${webApp.properties.defaultHostName}'
        ]
      }
    }
    httpsOnly: true
  }
}

// Consumption plan for Functions (serverless, pay-per-use)
resource functionAppPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${functionAppName}-plan'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: true
  }
}

// Custom domain binding (if provided)
resource customHostname 'Microsoft.Web/sites/hostNameBindings@2022-09-01' = if (customDomain != '') {
  parent: webApp
  name: customDomain
  properties: {
    siteName: webApp.name
    hostNameType: 'Verified'
  }
}

// Outputs
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppName string = webApp.name
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppName string = functionApp.name
output resourceGroup string = resourceGroup().name

// Instructions output
output instructions string = '''
Deployment complete! 

Next steps:
1. Deploy the Next.js app code to the web app
2. Deploy the Flask API to the function app  
3. Configure custom domain DNS (if using)

To delete everything when done:
  az group delete --name ${resourceGroup().name} --yes --no-wait
'''
