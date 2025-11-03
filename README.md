# Cognigy Extension Template

Quick start template for creating Cognigy.AI extensions with automated CI/CD workflows.

## Getting Started

After creating a repository from this template:

### 1. Update package.json

- Change `name` to your extension name (e.g., "my-awesome-extension")
- Update `description` with what your extension does
- Update `author` with your name
- Update `license` if needed (default: ISC)

### 2. Add an icon

Add `icon.png` (64x64) to the root directory. This will be included in your extension package.

### 3. Customize your extension

- Edit `src/nodes/exampleNode.ts` or create new node files in `src/nodes/`
- Update `src/module.ts` to import and export your nodes
- Update the `options.label` in `src/module.ts` to match your extension name

### 4. Set up git flow

Initialize the develop branch and push it:

```bash
git checkout -b develop
git push -u origin develop
```

### 5. Start building

Install dependencies and build:

```bash
npm install
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Run linting checks
- Create a `.tar.gz` package ready for upload to Cognigy.AI

### 6. Configure Automated Deployments (Optional)

To enable automated deployments to Cognigy when you create releases:

**See `docs/GITHUB_ACTIONS_SETUP.md` for detailed instructions.**

Quick steps:
1. Copy `.github/cognigy-deployments.yml.example` to `.github/cognigy-deployments.yml`
2. Add GitHub Secrets for your Cognigy API credentials
3. Update `.github/workflows/release.yml` with your secrets
4. Commit and push

## What's Included

✅ **GitHub Actions Workflows**
- `version-check.yml` - Validates version bumps on PRs to develop
- `build.yml` - Builds extension on push to develop
- `release.yml` - Creates GitHub releases on push to main

✅ **TypeScript Configuration**
- Pre-configured `tsconfig.json` for Cognigy extensions
- Linting with `tslint.json`

✅ **Documentation**
- `docs/GIT_WORKFLOW.md` - Git flow and branching strategy
- `docs/DEVELOPMENT_GUIDE.md` - How to create nodes and extensions
- `docs/GITHUB_ACTIONS_SETUP.md` - CI/CD and deployment setup
- `docs/example/` - Working code examples

✅ **Starter Code**
- Example node in `src/nodes/exampleNode.ts`
- Extension module setup in `src/module.ts`

## Development Workflow

See `docs/GIT_WORKFLOW.md` for the complete workflow. Quick summary:

1. Create feature branch from `develop`
2. Make your changes (edit nodes, update module.ts)
3. Test locally with `npm run build`
4. Commit your code changes
5. Bump version with `npm version patch` (or minor/major)
6. Push and create PR to `develop`
7. Merge to `develop` (triggers automated build)
8. When ready for release, merge `develop` to `main` (creates GitHub release and deploys)

## Project Structure

```
.
├── .github/
│   ├── workflows/                    # GitHub Actions CI/CD
│   └── cognigy-deployments.yml       # Deployment configuration
├── docs/
│   ├── GIT_WORKFLOW.md              # Git flow guide
│   ├── DEVELOPMENT_GUIDE.md         # Extension development guide
│   ├── GITHUB_ACTIONS_SETUP.md      # CI/CD setup instructions
│   ├── CLAUDE_CONTEXT.md            # Context for Claude Code AI
│   └── example/                     # Working code examples
├── src/
│   ├── nodes/                       # Your extension nodes
│   └── module.ts                    # Extension entry point
├── package.json                     # Update with your details
├── tsconfig.json                    # TypeScript configuration
├── tslint.json                      # Linting rules
└── icon.png                         # Extension icon (64x64)
```

## Available Scripts

- `npm run transpile` - Compile TypeScript to JavaScript
- `npm run lint` - Run linting checks
- `npm run zip` - Create tarball package
- `npm run build` - Run all of the above

## Documentation

- **[Cognigy Extension Documentation](https://docs.cognigy.com/)** - Official Cognigy docs
- **`docs/GIT_WORKFLOW.md`** - Git flow, branching strategy, and PR process
- **`docs/DEVELOPMENT_GUIDE.md`** - How to create nodes, use field types, and structure extensions
- **`docs/GITHUB_ACTIONS_SETUP.md`** - CI/CD setup and automated Cognigy deployments
- **`docs/example/`** - Working code examples and patterns
