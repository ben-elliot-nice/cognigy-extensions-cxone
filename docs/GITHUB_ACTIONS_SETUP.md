# GitHub Actions Setup Guide

This template includes automated workflows for building, versioning, and deploying your Cognigy extension.

## Prerequisites

- A Cognigy.AI project
- Cognigy API credentials (API Key and Management URL)
- GitHub repository with this template

## Initial Setup

### Step 1: Create Deployment Configuration

Copy the example configuration:

```bash
cp .github/cognigy-deployments.yml.example .github/cognigy-deployments.yml
```

Edit `.github/cognigy-deployments.yml` and update with your details:

```yaml
deployments:
  - name: "My Environment"
    environment: "CSA_INT"
    projectId: "your-actual-project-id"
    releaseTypes: ["major", "minor", "patch"]
    enabled: true
```

**Getting your Project ID:**
1. Open your project in Cognigy.AI
2. Check the browser URL: `.../projects/{projectId}/...`
3. Copy the project ID

### Step 2: Add GitHub Secrets

For each environment in your config, add secrets to GitHub:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**For environment: "CSA_INT"**, create these secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `COGNIGY_CSA_INT_API_KEY` | Your Cognigy API key | Cognigy.AI → My Profile → API Keys |
| `COGNIGY_CSA_INT_URL` | Cognigy API base URL | See table below |

**Common Cognigy API URLs:**

| Environment | URL |
|-------------|-----|
| Trial (US) | `https://api-trial.cognigy.ai` |
| Trial (EU) | `https://api-trial.cognigy.eu` |
| Enterprise | Ask your Cognigy administrator |

⚠️ **Important:** No trailing slash on URLs

### Step 3: Update Workflow File (REQUIRED)

**This is a critical step!** You must explicitly declare your secrets in the workflow file.

Edit `.github/workflows/release.yml`:

Find the `Deploy to Cognigy environments` step (around line 180) and add your secrets to the `env:` block:

```yaml
- name: Deploy to Cognigy environments
  if: steps.parse_config.outputs.count != '0'
  env:
    FAIL_FAST: ${{ vars.COGNIGY_FAIL_FAST || 'false' }}
    VERSION: ${{ steps.version_info.outputs.version }}
    PACKAGE_NAME: ${{ steps.package_name.outputs.name }}
    # Add your secrets here ↓
    COGNIGY_CSA_INT_API_KEY: ${{ secrets.COGNIGY_CSA_INT_API_KEY }}
    COGNIGY_CSA_INT_URL: ${{ secrets.COGNIGY_CSA_INT_URL }}
```

**Pattern:** `COGNIGY_{ENVIRONMENT}_{TYPE}` where:
- `{ENVIRONMENT}` matches the `environment` field in your config
- `{TYPE}` is either `API_KEY` or `URL`

### Step 4: Commit and Push

```bash
git add .github/cognigy-deployments.yml .github/workflows/release.yml
git commit -m "Configure Cognigy deployments"
git push
```

## How It Works

### Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **version-check.yml** | PR to `develop` | Validates version was bumped |
| **build.yml** | Push to `develop` | Builds extension, uploads artifacts |
| **release.yml** | Push to `main` | Creates GitHub release + deploys to Cognigy |

### Release Types

The workflow automatically determines release type from version changes:

- **Patch** (0.0.X): Bug fixes → Use `npm version patch`
- **Minor** (0.X.0): New features → Use `npm version minor`
- **Major** (X.0.0): Breaking changes → Use `npm version major`

Control which release types deploy to each environment:

```yaml
releaseTypes: ["major", "minor", "patch"]  # All releases
releaseTypes: ["major", "minor"]           # Major and minor only
releaseTypes: ["major"]                    # Major releases only
```

### Deployment Flow

When you merge to `main`:

1. ✅ Checks if GitHub release exists for current version
2. 🏗️ If new: Builds extension and creates GitHub release with `.tar.gz`
3. 📋 Reads `.github/cognigy-deployments.yml`
4. 🚀 For each enabled environment matching the release type:
   - Checks if extension exists in Cognigy project
   - **Updates** existing extension OR **Uploads** new extension
   - Uses GitHub release download URL as source

## Adding Additional Environments

### Example: Adding Production Environment

**1. Update Config** (`.github/cognigy-deployments.yml`):

```yaml
deployments:
  - name: "Development"
    environment: "CSA_INT"
    projectId: "dev-project-id"
    releaseTypes: ["major", "minor", "patch"]
    enabled: true

  # New production environment
  - name: "Production"
    environment: "PROD"
    projectId: "prod-project-id"
    releaseTypes: ["major"]  # Only major versions
    enabled: true
```

**2. Add GitHub Secrets:**

- `COGNIGY_PROD_API_KEY`
- `COGNIGY_PROD_URL`

**3. Update Workflow** (`.github/workflows/release.yml`):

```yaml
env:
  FAIL_FAST: ${{ vars.COGNIGY_FAIL_FAST || 'false' }}
  VERSION: ${{ steps.version_info.outputs.version }}
  PACKAGE_NAME: ${{ steps.package_name.outputs.name }}
  COGNIGY_CSA_INT_API_KEY: ${{ secrets.COGNIGY_CSA_INT_API_KEY }}
  COGNIGY_CSA_INT_URL: ${{ secrets.COGNIGY_CSA_INT_URL }}
  # Add production secrets ↓
  COGNIGY_PROD_API_KEY: ${{ secrets.COGNIGY_PROD_API_KEY }}
  COGNIGY_PROD_URL: ${{ secrets.COGNIGY_PROD_URL }}
```

**4. Commit and merge to `main`**

## Optional Configuration

### Fail Fast Mode

By default, if one deployment fails, others continue. To stop on first failure:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable**
3. Name: `COGNIGY_FAIL_FAST`
4. Value: `true`

## Troubleshooting

### ❌ "Missing secret: COGNIGY_XXX_API_KEY"

**Cause:** Secret not found or not declared in workflow

**Fix:**
1. Verify secret exists in **Settings → Secrets and variables → Actions**
2. Check secret name exactly matches pattern: `COGNIGY_{ENVIRONMENT}_{TYPE}`
3. Ensure secret is added to workflow's `env:` block in `release.yml`

### ❌ Deployment fails with HTTP 401/403

**Cause:** Invalid API key or insufficient permissions

**Fix:**
1. Verify API key is correct
2. Check API key has permissions for the project
3. Regenerate API key in Cognigy.AI if needed

### ❌ Deployment fails with HTTP 404

**Cause:** Invalid API URL or project ID

**Fix:**
1. Verify API URL is correct (no trailing slash)
2. Confirm project ID exists and is accessible
3. Check you're using the correct Cognigy instance URL

### ⚠️ "Tag already exists. Skipping release creation."

**This is normal!** The workflow won't create duplicate releases.

**To create a new release:**
```bash
npm version patch  # or minor/major
git push
```

## Testing Your Setup

Follow this workflow to test end-to-end:

```bash
# 1. Create feature branch
git checkout develop
git pull
git checkout -b feature/test-deployment

# 2. Make a small change (e.g., update README)
echo "Test" >> README.md

# 3. Commit changes
git add .
git commit -m "Test deployment setup"

# 4. Bump version
npm version patch

# 5. Push and create PR to develop
git push -u origin feature/test-deployment
gh pr create --base develop --title "Test deployment" --body "Testing setup"

# 6. Merge PR (triggers build workflow)

# 7. Create PR from develop to main
gh pr create --base main --head develop --title "Release" --body "Test release"

# 8. Merge to main (triggers release + deployment)
```

**Verify:**
1. Check **Actions** tab on GitHub for workflow status
2. Check **Releases** for new GitHub release
3. Check Cognigy.AI project for deployed extension

## Security Best Practices

- ✅ Never commit API keys to repository
- ✅ Use separate API keys for each environment
- ✅ Rotate API keys periodically
- ✅ Limit API key permissions to only what's needed
- ✅ Consider adding `.github/cognigy-deployments.yml` to `.gitignore` if project IDs are sensitive

## Why Secrets Must Be Hardcoded in Workflow

GitHub Actions requires secrets to be explicitly declared in the workflow file's `env:` block. You cannot dynamically reference secrets at runtime.

**How it works:**
1. The `environment` field in config (e.g., `"CSA_INT"`) determines the naming pattern
2. Workflow constructs variable names: `COGNIGY_{ENVIRONMENT}_API_KEY`
3. Bash variable indirection looks up the value: `${!API_KEY_VAR}`
4. But secrets must still be declared in workflow YAML first

This is a GitHub Actions security limitation, not a bug in the workflow.
