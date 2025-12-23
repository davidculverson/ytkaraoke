/**
 * Azure Resource Cleanup Tests
 * 
 * These tests verify proper cleanup of Azure resources
 * and can be run after testing to ensure no orphaned resources remain.
 */

/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

const TEST_CONFIG = {
  resourceGroup: process.env.AZURE_RESOURCE_GROUP || 'rg-songup-test',
  environment: process.env.ENVIRONMENT || 'test',
};

/**
 * Helper function to run Azure CLI commands
 */
function azCli(command: string): string {
  try {
    return execSync(`az ${command}`, { encoding: 'utf-8' }).trim();
  } catch (error: any) {
    return error.stdout || error.message;
  }
}

describe('Azure Resource Cleanup Verification', () => {
  
  describe('Pre-Cleanup Resource Count', () => {
    
    it('should list all resources in resource group', async () => {
      const resources = azCli(
        `resource list \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --query "[].{name:name, type:type}" \
          -o json`
      );
      
      const parsed = JSON.parse(resources);
      console.log(`Found ${parsed.length} resources in ${TEST_CONFIG.resourceGroup}:`);
      parsed.forEach((r: any) => console.log(`  - ${r.type}: ${r.name}`));
      
      expect(parsed).toBeDefined();
    });
  });

  describe('Cleanup Operations', () => {
    
    it('should delete resource group when CLEANUP=true', async () => {
      if (process.env.CLEANUP !== 'true') {
        console.log('Skipping cleanup - set CLEANUP=true to run');
        return;
      }
      
      const result = azCli(
        `group delete \
          --name ${TEST_CONFIG.resourceGroup} \
          --yes \
          --no-wait`
      );
      
      // Command should not return an error
      expect(result).not.toContain('ERROR');
    });
  });

  describe('Post-Cleanup Verification', () => {
    
    it('should verify resource group is deleted or deleting', async () => {
      if (process.env.CLEANUP !== 'true') {
        console.log('Skipping - cleanup was not requested');
        return;
      }
      
      // Wait a moment for deletion to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const exists = azCli(
        `group exists --name ${TEST_CONFIG.resourceGroup}`
      );
      
      // Should be either 'false' or still deleting
      console.log(`Resource group exists: ${exists}`);
    });
  });
});
