# Azure Deployment Tests

This directory contains test cases for deploying SongUp to Azure with custom domain support.

## Test Files

| File | Description |
|------|-------------|
| [deployment.test.ts](deployment.test.ts) | Infrastructure deployment tests - validates Bicep templates, resource creation, and configuration |
| [custom-domain.test.ts](custom-domain.test.ts) | Custom domain tests - validates DNS, SSL certificates, and domain bindings |
| [e2e.test.ts](e2e.test.ts) | End-to-end tests - validates application functionality after deployment |
| [cleanup.test.ts](cleanup.test.ts) | Resource cleanup tests - verifies proper cleanup of Azure resources |

## Prerequisites

1. **Azure CLI** installed and authenticated
2. **Node.js 22.x** installed
3. **Valid Azure subscription** with permissions to create resources
4. **Custom domain** with DNS access (for custom domain tests)

## Environment Variables

```bash
# Required
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_RESOURCE_GROUP="rg-songup-test"
export CONVEX_URL="https://your-deployment.convex.cloud"

# Optional
export AZURE_LOCATION="eastus"
export CUSTOM_DOMAIN="test.songup.tv"
export ENVIRONMENT="test"  # test, staging, or prod
export CLEANUP="false"     # Set to "true" to cleanup after tests
```

## Running Tests

### Run All Tests
```bash
npx vitest run --config tests/azure/vitest.config.ts
```

### Run Specific Test Suite
```bash
# Deployment tests only
npx vitest run --config tests/azure/vitest.config.ts tests/azure/deployment.test.ts

# Custom domain tests only
npx vitest run --config tests/azure/vitest.config.ts tests/azure/custom-domain.test.ts

# E2E tests only
npx vitest run --config tests/azure/vitest.config.ts tests/azure/e2e.test.ts
```

### Run with Cleanup
```bash
CLEANUP=true npx vitest run --config tests/azure/vitest.config.ts
```

## GitHub Actions

The tests are integrated into the CI/CD pipeline via `.github/workflows/azure-tests.yml`.

### Manual Trigger

You can manually trigger the workflow with custom parameters:
1. Go to Actions → Azure Deployment Tests
2. Click "Run workflow"
3. Select environment (test/staging/prod)
4. Optionally specify a custom domain
5. Choose whether to cleanup after tests

### Required Secrets

Configure these secrets in your GitHub repository:
- `AZURE_CREDENTIALS` - Azure service principal credentials (JSON)
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `CONVEX_URL` - Convex deployment URL

## Infrastructure

The infrastructure is defined in Bicep templates under `/infra`:

- [main.bicep](../../infra/main.bicep) - Main infrastructure template
- [parameters.dev.json](../../infra/parameters.dev.json) - Development parameters
- [parameters.prod.json](../../infra/parameters.prod.json) - Production parameters

### Resources Created

| Resource | Purpose |
|----------|---------|
| App Service Plan | Hosts the Next.js application |
| Web App | Next.js frontend |
| Function App Plan | Hosts the Flask API |
| Function App | Flask API (YouTube Music search) |
| Storage Account | Required for Function App |
| CDN Profile | Content delivery (prod only) |
| CDN Endpoint | CDN distribution (prod only) |

## Custom Domain Setup

To configure a custom domain:

1. **Add DNS Records**
   ```
   CNAME: your-domain.com → songup-prod-web.azurewebsites.net
   TXT: asuid.your-domain.com → <verification-id>
   ```

2. **Deploy with Custom Domain**
   ```bash
   az deployment group create \
     --resource-group rg-songup-prod \
     --template-file infra/main.bicep \
     --parameters environment=prod \
     --parameters customDomain=your-domain.com \
     --parameters convexUrl=$CONVEX_URL
   ```

3. **Run Custom Domain Tests**
   ```bash
   CUSTOM_DOMAIN=your-domain.com npx vitest run tests/azure/custom-domain.test.ts
   ```

## Troubleshooting

### Tests Timing Out
Increase the timeout in `vitest.config.ts` or use `--test-timeout` flag.

### DNS Tests Failing
DNS propagation can take up to 48 hours. Use `dig` or `nslookup` to verify DNS records.

### SSL Certificate Issues
Azure managed certificates can take 15-60 minutes to provision. Wait and retry.

### CORS Errors
Verify the Function App CORS settings include your custom domain.
