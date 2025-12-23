// Azure Infrastructure for SongUp
// Deploys: App Service (Next.js), Function App (Flask API), CDN, DNS

@description('The environment name (dev, staging, prod)')
param environment string = 'dev'

@description('The custom domain name for the application')
param customDomain string = ''

@description('The Azure region for resources')
param location string = resourceGroup().location

@description('The Convex deployment URL')
@secure()
param convexUrl string

@description('The Convex deploy key')
@secure()
param convexDeployKey string = ''

var appName = 'songup-${environment}'
var appServicePlanName = '${appName}-plan'
var webAppName = '${appName}-web'
var functionAppName = '${appName}-api'
var storageAccountName = replace('${appName}storage', '-', '')
var cdnProfileName = '${appName}-cdn'
var cdnEndpointName = '${appName}-endpoint'

// App Service Plan for Next.js
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: environment == 'prod' ? 'P1v3' : 'B1'
    tier: environment == 'prod' ? 'PremiumV3' : 'Basic'
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
          name: 'CONVEX_DEPLOY_KEY'
          value: convexDeployKey
        }
        {
          name: 'NODE_ENV'
          value: environment == 'prod' ? 'production' : 'development'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      alwaysOn: environment == 'prod'
      http20Enabled: true
      minTlsVersion: '1.2'
    }
    httpsOnly: true
  }
}

// Storage Account for Function App
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// App Service Plan for Function App (Flask API)
resource functionAppPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${functionAppName}-plan'
  location: location
  sku: {
    name: environment == 'prod' ? 'EP1' : 'Y1'
    tier: environment == 'prod' ? 'ElasticPremium' : 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: true
  }
}

// Function App for Flask API
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: functionAppPlan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${az.environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
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
          customDomain != '' ? 'https://${customDomain}' : ''
        ]
      }
    }
    httpsOnly: true
  }
}

// CDN Profile
resource cdnProfile 'Microsoft.Cdn/profiles@2022-11-01-preview' = if (environment == 'prod') {
  name: cdnProfileName
  location: 'global'
  sku: {
    name: 'Standard_Microsoft'
  }
}

// CDN Endpoint
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2022-11-01-preview' = if (environment == 'prod') {
  parent: cdnProfile
  name: cdnEndpointName
  location: 'global'
  properties: {
    originHostHeader: webApp.properties.defaultHostName
    isHttpAllowed: false
    isHttpsAllowed: true
    origins: [
      {
        name: 'webapp-origin'
        properties: {
          hostName: webApp.properties.defaultHostName
          httpPort: 80
          httpsPort: 443
          originHostHeader: webApp.properties.defaultHostName
          priority: 1
          weight: 1000
        }
      }
    ]
  }
}

// Custom domain for Web App (if provided)
resource customHostname 'Microsoft.Web/sites/hostNameBindings@2022-09-01' = if (customDomain != '') {
  parent: webApp
  name: customDomain
  properties: {
    siteName: webApp.name
    hostNameType: 'Verified'
    sslState: 'SniEnabled'
  }
}

// Outputs
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output cdnEndpointUrl string = environment == 'prod' ? 'https://${cdnEndpoint.properties.hostName}' : ''
output webAppName string = webApp.name
output functionAppName string = functionApp.name
