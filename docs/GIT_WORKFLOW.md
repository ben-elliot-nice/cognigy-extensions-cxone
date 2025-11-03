# Git Workflow Guide

This project uses a standard git flow with automated CI/CD via GitHub Actions.

## Branch Structure

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Production releases only, tagged | Yes |
| `develop` | Integration branch, builds run here | Yes |
| `feature/*` | Feature development branches | No |

## GitHub Actions Workflows

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| **version-check.yml** | PR to `develop` | Validates version was bumped, runs lint |
| **build.yml** | Push to `develop` | Builds extension, uploads artifacts |
| **release.yml** | Push to `main` | Creates GitHub release, deploys to Cognigy |

## Standard Development Workflow

### Adding a Feature

```bash
# 1. Start from develop
git checkout develop
git pull

# 2. Create feature branch
git checkout -b feature/my-feature-name

# 3. Make your changes
# Edit files, add nodes, etc.

# 4. Test locally
npm run build

# 5. Commit code changes FIRST
git add src/
git commit -m "Add my feature

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Bump version (creates separate commit)
npm version patch  # or minor/major

# 7. Push feature branch
git push -u origin feature/my-feature-name

# 8. Create PR to develop
gh pr create --base develop --head feature/my-feature-name \
  --title "Add my feature" \
  --body "Description of changes"

# 9. Wait for CI checks to pass, then merge PR
# This triggers build workflow on develop

# 10. When ready to release: PR develop -> main
git checkout develop
git pull
gh pr create --base main --head develop \
  --title "Release v0.0.X" \
  --body "Release notes here"

# 11. Merge to main
# This triggers release workflow and deploys to Cognigy
```

## Version Bumping

**IMPORTANT:** Always commit code changes BEFORE running `npm version`

`npm version` requires a clean working directory and creates its own commit.

| Command | Use Case | Version Change |
|---------|----------|----------------|
| `npm version patch` | Bug fixes | 0.0.1 → 0.0.2 |
| `npm version minor` | New features | 0.0.1 → 0.1.0 |
| `npm version major` | Breaking changes | 0.0.1 → 1.0.0 |

### Why Version Bumping is Required

The `version-check.yml` workflow enforces that every PR to `develop` includes a version bump. This ensures:
- Every feature/fix is tracked with a version
- Release notes can be generated automatically
- Deployments are versioned correctly

## Quick Reference Commands

```bash
# Build
npm run build

# Version bumping
npm version patch
npm version minor
npm version major

# Create PR to develop
gh pr create --base develop --head feature/xyz --title "..." --body "..."

# Create PR to main (release)
gh pr create --base main --head develop --title "Release v0.0.X" --body "..."
```

## Important Rules

- ✅ **Always** commit code before running `npm version`
- ✅ **Always** bump version for every PR to develop
- ✅ **Never** force push to `main` or `develop`
- ✅ **Test** locally with `npm run build` before pushing
- ❌ **Don't** skip the version bump - CI will fail

## Troubleshooting

### "Version has not been bumped"

You forgot to run `npm version patch/minor/major` before creating the PR.

**Fix:**
```bash
npm version patch
git push
```

### "npm version failed - Git working directory not clean"

You have uncommitted changes.

**Fix:**
```bash
git add .
git commit -m "Your changes"
# Now run npm version
npm version patch
```

### Build fails on develop

Check the **Actions** tab on GitHub for error details. Common issues:
- TypeScript compilation errors
- Linting errors
- Missing dependencies

**Fix locally:**
```bash
npm run build  # See the errors
# Fix the errors
git add .
git commit -m "Fix build errors"
git push
```
