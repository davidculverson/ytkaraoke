/**
 * Custom Domain Configuration Tests for SongUp
 * 
 * These tests validate the custom domain setup, SSL certificates,
 * and DNS configuration for the Azure deployment.
 */

/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import * as dns from 'node:dns';
import { promisify } from 'node:util';
import * as https from 'node:https';
import * as tls from 'node:tls';
import type { IncomingMessage } from 'node:http';

const resolveCname = promisify(dns.resolveCname);
const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);

const TEST_CONFIG = {
  customDomain: process.env.CUSTOM_DOMAIN || 'karaoke.culverson.me',
  azureWebAppHostname: process.env.AZURE_WEBAPP_HOSTNAME || '',
  resourceGroup: process.env.AZURE_RESOURCE_GROUP || 'rg-songup-test',
  expectedTxtRecord: process.env.AZURE_VERIFICATION_ID || '',
};

/**
 * Helper function to run Azure CLI commands
 */
function azCli(command: string): string {
  return execSync(`az ${command}`, { encoding: 'utf-8' }).trim();
}

/**
 * Helper function to check SSL certificate
 */
async function checkSslCertificate(hostname: string): Promise<{
  valid: boolean;
  issuer: string;
  expiresAt: Date;
  subject: string;
}> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, hostname, { servername: hostname }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      
      resolve({
        valid: socket.authorized,
        issuer: cert.issuer?.O || 'Unknown',
        expiresAt: new Date(cert.valid_to),
        subject: cert.subject?.CN || hostname,
      });
    });
    
    socket.on('error', reject);
  });
}

/**
 * Helper function to make HTTPS request
 */
async function httpsGet(url: string): Promise<{ 
  statusCode: number; 
  headers: Record<string, string | string[] | undefined>;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    https.get(url, (res: IncomingMessage) => {
      let body = '';
      res.on('data', (chunk: Buffer) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body,
        });
      });
    }).on('error', reject);
  });
}

describe('Custom Domain Configuration Tests', () => {

  describe('1. DNS Configuration Validation', () => {
    
    it('should have correct CNAME record pointing to Azure', async () => {
      try {
        const cnameRecords = await resolveCname(TEST_CONFIG.customDomain);
        
        expect(cnameRecords).toBeDefined();
        expect(cnameRecords.length).toBeGreaterThan(0);
        
        // CNAME should point to Azure App Service
        const hasAzureCname = cnameRecords.some(
          (record: string) => record.includes('.azurewebsites.net') || 
                    record.includes('.azure-api.net') ||
                    record.includes('.azureedge.net')
        );
        
        expect(hasAzureCname).toBe(true);
      } catch (error: any) {
        // If CNAME doesn't exist, check for A record (might use Azure Front Door)
        if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
          const aRecords = await resolve4(TEST_CONFIG.customDomain);
          expect(aRecords.length).toBeGreaterThan(0);
        } else {
          throw error;
        }
      }
    });

    it('should have domain verification TXT record', async () => {
      if (!TEST_CONFIG.expectedTxtRecord) {
        console.log('Skipping TXT record test - no verification ID provided');
        return;
      }
      
      const txtRecords = await resolveTxt(`asuid.${TEST_CONFIG.customDomain}`);
      const flatRecords = txtRecords.flat();
      
      expect(flatRecords).toContain(TEST_CONFIG.expectedTxtRecord);
    });

    it('should resolve custom domain to valid IP', async () => {
      const result = await new Promise<string>((resolve, reject) => {
        dns.lookup(TEST_CONFIG.customDomain, (err: NodeJS.ErrnoException | null, address: string) => {
          if (err) reject(err);
          else resolve(address);
        });
      });
      
      expect(result).toBeTruthy();
      // Should be a valid IPv4 or IPv6 address
      expect(result).toMatch(/^(\d{1,3}\.){3}\d{1,3}$|^([a-f0-9:]+)$/i);
    });
  });

  describe('2. SSL/TLS Certificate Validation', () => {
    
    it('should have valid SSL certificate for custom domain', async () => {
      const cert = await checkSslCertificate(TEST_CONFIG.customDomain);
      
      expect(cert.valid).toBe(true);
      expect(cert.subject).toBe(TEST_CONFIG.customDomain);
    });

    it('should have certificate not expiring within 30 days', async () => {
      const cert = await checkSslCertificate(TEST_CONFIG.customDomain);
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      expect(cert.expiresAt.getTime()).toBeGreaterThan(thirtyDaysFromNow.getTime());
    });

    it('should use TLS 1.2 or higher', async () => {
      const result = await new Promise<string>((resolve, reject) => {
        const socket = tls.connect(443, TEST_CONFIG.customDomain, {
          servername: TEST_CONFIG.customDomain,
          minVersion: 'TLSv1.2',
        }, () => {
          resolve(socket.getProtocol() || 'unknown');
          socket.end();
        });
        socket.on('error', reject);
      });
      
      expect(['TLSv1.2', 'TLSv1.3']).toContain(result);
    });

    it('should reject TLS 1.0 connections', async () => {
      await expect(
        new Promise((resolve, reject) => {
          const socket = tls.connect(443, TEST_CONFIG.customDomain, {
            servername: TEST_CONFIG.customDomain,
            maxVersion: 'TLSv1',
          }, () => {
            socket.end();
            resolve('connected');
          });
          socket.on('error', reject);
        })
      ).rejects.toThrow();
    });
  });

  describe('3. Azure Custom Domain Binding', () => {
    
    it('should have custom domain bound in Azure', async () => {
      const hostnames = azCli(
        `webapp show \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --name songup-${process.env.ENVIRONMENT || 'test'}-web \
          --query "hostNames" -o json`
      );
      
      const parsed = JSON.parse(hostnames);
      expect(parsed).toContain(TEST_CONFIG.customDomain);
    });

    it('should have SSL binding for custom domain', async () => {
      const sslState = azCli(
        `webapp config hostname list \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --webapp-name songup-${process.env.ENVIRONMENT || 'test'}-web \
          --query "[?name=='${TEST_CONFIG.customDomain}'].sslState" -o tsv`
      );
      
      expect(sslState).toBe('SniEnabled');
    });

    it('should have managed certificate or uploaded certificate', async () => {
      const thumbprint = azCli(
        `webapp config hostname list \
          --resource-group ${TEST_CONFIG.resourceGroup} \
          --webapp-name songup-${process.env.ENVIRONMENT || 'test'}-web \
          --query "[?name=='${TEST_CONFIG.customDomain}'].thumbprint" -o tsv`
      );
      
      expect(thumbprint).toBeTruthy();
      expect(thumbprint.length).toBe(40); // SHA1 thumbprint length
    });
  });

  describe('4. HTTP to HTTPS Redirect', () => {
    
    it('should redirect HTTP to HTTPS', async () => {
      // Note: This test uses http module for the initial request
      const http = await import('node:http');
      
      const result = await new Promise<{ statusCode: number; location: string }>((resolve, reject) => {
        http.get(`http://${TEST_CONFIG.customDomain}`, (res: IncomingMessage) => {
          resolve({
            statusCode: res.statusCode || 0,
            location: res.headers.location || '',
          });
        }).on('error', reject);
      });
      
      expect([301, 302, 307, 308]).toContain(result.statusCode);
      expect(result.location).toContain('https://');
    });

    it('should have HSTS header enabled', async () => {
      const response = await httpsGet(`https://${TEST_CONFIG.customDomain}`);
      
      const hstsHeader = response.headers['strict-transport-security'];
      expect(hstsHeader).toBeTruthy();
      expect(hstsHeader).toContain('max-age=');
    });
  });

  describe('5. Custom Domain Accessibility', () => {
    
    it('should serve homepage on custom domain', async () => {
      const response = await httpsGet(`https://${TEST_CONFIG.customDomain}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('SongUp');
    });

    it('should serve correct content-type header', async () => {
      const response = await httpsGet(`https://${TEST_CONFIG.customDomain}`);
      
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should have correct cache headers', async () => {
      const response = await httpsGet(`https://${TEST_CONFIG.customDomain}`);
      
      // Homepage should have cache control
      expect(response.headers['cache-control']).toBeTruthy();
    });

    it('should respond within acceptable time', async () => {
      const start = Date.now();
      await httpsGet(`https://${TEST_CONFIG.customDomain}`);
      const duration = Date.now() - start;
      
      // Should respond within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});
