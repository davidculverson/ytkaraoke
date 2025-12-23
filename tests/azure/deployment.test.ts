/**
 * Azure Deployment Test Cases for SongUp
 * 
 * These tests validate the deployment of SongUp services to Azure
 * and verify the custom domain configuration works correctly.
 * 
 * Prerequisites:
 * - Azure CLI installed and authenticated
 * - Node.js 22.x installed
 * - Valid Azure subscription
 * - Custom domain with DNS access
 */

/// <reference types="node" />
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync, exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Configuration
const TEST_CONFIG = {
  subscriptionId: process.env.AZURE_SUBSCRIPTION_ID || '',
  resourceGroup: process.env.AZURE_RESOURCE_GROUP || 'rg-songup-test',
  location: process.env.AZURE_LOCATION || 'eastus',
  environment: 'test',
  customDomain: process.env.CUSTOM_DOMAIN || 'karaoke.culverson.me',
  convexUrl: process.env.CONVEX_URL || 'https://earnest-stork-764.convex.cloud',
};

interface DeploymentOutput {
  webAppUrl: string;
  functionAppUrl: string;
  cdnEndpointUrl: string;
  webAppName: string;
  functionAppName: string;
}

let deploymentOutputs: DeploymentOutput | null = null;

/**
 * Helper function to run Azure CLI commands
 */
async function azCli(command: string): Promise<string> {
  const { stdout } = await execAsync(`az ${command}`);
  return stdout.trim();
}

/**
 * Helper function to make HTTP requests with retry
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retries = 3, 
  delay = 5000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || i === retries - 1) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

describe('Azure Infrastructure Deployment Tests', () => {
  
  beforeAll(async () => {
    // Verify Azure CLI is authenticated
    const account = await azCli('account show --query id -o tsv');
    expect(account).toBeTruthy();
  }, 30000);

  describe('1. Resource Group Setup', () => {
    
    it('should create resource group if it does not exist', async () => {
      const result = await azCli(
        `group create --name ${TEST_CONFIG.resourceGroup} --location ${TEST_CONFIG.location} -o json`
      );
      const rg = JSON.parse(result);
      
      expect(rg.properties.provisioningState).toBe('Succeeded');
      expect(rg.location).toBe(TEST_CONFIG.location);
    }, 60000);

    it('should verify resource group exists', async () => {
      const exists = await azCli(
        `group exists --name ${TEST_CONFIG.resourceGroup}`
      );
      expect(exists).toBe('true');
    });
  });

  describe('2. Bicep Template Validation', () => {
    
    it('should validate Bicep template syntax', async () => {
      const result = await azCli(
        `bicep build --file infra/main.bicep --stdout 2>&1 || echo "BUILD_FAILED"`
      );
      expect(result).not.toContain('BUILD_FAILED');
      expect(result).not.toContain('Error');
    });

    it('should validate deployment what-if', async () => {
      const result = await azCli(
        `deployment group what-if \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --template-file infra/main.bicep \
          --parameters environment=${TEST_CONFIG.environment} \
          --parameters convexUrl=${TEST_CONFIG.convexUrl} \
          --query "status" -o tsv`
      );
      expect(result).not.toContain('Failed');
    }, 120000);
  });

  describe('3. Infrastructure Deployment', () => {
    
    it('should deploy Azure resources successfully', async () => {
      const result = await azCli(
        `deployment group create \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --template-file infra/main.bicep \
          --parameters environment=${TEST_CONFIG.environment} \
          --parameters convexUrl=${TEST_CONFIG.convexUrl} \
          --query "properties.provisioningState" -o tsv`
      );
      
      expect(result).toBe('Succeeded');
    }, 600000); // 10 minutes timeout for deployment

    it('should retrieve deployment outputs', async () => {
      const outputs = await azCli(
        `deployment group show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name main \
          --query "properties.outputs" -o json`
      );
      
      const parsed = JSON.parse(outputs);
      deploymentOutputs = {
        webAppUrl: parsed.webAppUrl.value,
        functionAppUrl: parsed.functionAppUrl.value,
        cdnEndpointUrl: parsed.cdnEndpointUrl?.value || '',
        webAppName: parsed.webAppName.value,
        functionAppName: parsed.functionAppName.value,
      };
      
      expect(deploymentOutputs.webAppUrl).toContain('https://');
      expect(deploymentOutputs.functionAppUrl).toContain('https://');
    });
  });

  describe('4. App Service Validation', () => {
    
    it('should verify web app is running', async () => {
      expect(deploymentOutputs).not.toBeNull();
      
      const state = await azCli(
        `webapp show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.webAppName} \
          --query "state" -o tsv`
      );
      
      expect(state).toBe('Running');
    });

    it('should verify web app has correct Node.js version', async () => {
      const config = await azCli(
        `webapp config show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.webAppName} \
          --query "linuxFxVersion" -o tsv`
      );
      
      expect(config).toContain('NODE|22');
    });

    it('should verify HTTPS is enforced', async () => {
      const httpsOnly = await azCli(
        `webapp show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.webAppName} \
          --query "httpsOnly" -o tsv`
      );
      
      expect(httpsOnly).toBe('true');
    });

    it('should verify app settings are configured', async () => {
      const settings = await azCli(
        `webapp config appsettings list \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.webAppName} \
          --query "[?name=='NEXT_PUBLIC_CONVEX_URL'].value" -o tsv`
      );
      
      expect(settings).toBeTruthy();
    });
  });

  describe('5. Function App Validation', () => {
    
    it('should verify function app is running', async () => {
      expect(deploymentOutputs).not.toBeNull();
      
      const state = await azCli(
        `functionapp show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.functionAppName} \
          --query "state" -o tsv`
      );
      
      expect(state).toBe('Running');
    });

    it('should verify function app has Python runtime', async () => {
      const config = await azCli(
        `functionapp config show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.functionAppName} \
          --query "linuxFxVersion" -o tsv`
      );
      
      expect(config).toContain('PYTHON');
    });

    it('should verify CORS is configured correctly', async () => {
      const cors = await azCli(
        `functionapp cors show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name ${deploymentOutputs!.functionAppName} \
          --query "allowedOrigins" -o json`
      );
      
      const origins = JSON.parse(cors);
      expect(origins).toContain(deploymentOutputs!.webAppUrl.replace('https://', 'https://'));
    });
  });
});
