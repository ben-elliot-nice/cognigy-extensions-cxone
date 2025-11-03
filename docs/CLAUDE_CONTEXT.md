# Claude Context: Cognigy Extension Development

This file provides context for Claude Code (AI assistant) when helping with this Cognigy extension project.

## Project Type

This is a Cognigy.AI Extension project that creates custom nodes for Cognigy.AI 4.0+. Extensions are TypeScript projects that compile to tarballs (`.tar.gz`) and get uploaded to Cognigy.AI.

## Key Files and Their Purpose

| File/Directory | Purpose |
|----------------|---------|
| `src/nodes/*.ts` | Node implementations (custom flow nodes) |
| `src/module.ts` | Extension entry point - exports all nodes and connections |
| `src/connections/*.ts` | Connection schemas for API credentials (optional) |
| `package.json` | **Critical** - Version must be bumped for every change |
| `tsconfig.json` | TypeScript config (includes `src/**/*`, excludes `docs`, `build`, `node_modules`) |
| `.github/workflows/` | GitHub Actions for CI/CD automation |
| `.github/cognigy-deployments.yml` | Deployment targets configuration |

## Standard Workflow for Adding Features

When the user asks you to create or modify a node, follow this workflow:

```bash
# 1. Start from develop
git checkout develop
git pull

# 2. Create feature branch
git checkout -b feature/descriptive-name

# 3. Create the node implementation
# - Create/edit files in src/nodes/
# - Update src/module.ts to import and export the node

# 4. Test build locally
npm run build

# 5. Commit code changes FIRST (before version bump)
git add src/
git commit -m "Add feature description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Bump version (creates separate commit automatically)
npm version patch  # or minor/major based on change significance

# 7. Push feature branch
git push -u origin feature/descriptive-name

# 8. Create PR to develop
gh pr create --base develop --head feature/descriptive-name \
  --title "Descriptive title" \
  --body "Description of changes"
```

## Critical Rules

1. **ALWAYS commit code changes BEFORE running `npm version`**
   - `npm version` requires a clean working directory
   - It creates its own commit with the version bump

2. **Version must be bumped for EVERY PR to develop**
   - The `version-check.yml` workflow will fail otherwise
   - Use `npm version patch` for most changes
   - Use `npm version minor` for new features
   - Use `npm version major` for breaking changes

3. **Test locally before pushing**
   - Always run `npm run build` before committing
   - Fix any TypeScript or linting errors

4. **Follow the git flow**
   - All work happens on `feature/*` branches
   - Merge to `develop` via PR (triggers build)
   - Merge `develop` to `main` for releases (triggers deployment)

## Node Development Pattern

When creating a new node:

1. Create file in `src/nodes/newNode.ts`
2. Follow the pattern in `src/nodes/exampleNode.ts` or `docs/example/src/nodes/`
3. Define TypeScript interface for config
4. Use `createNodeDescriptor()` with:
   - Descriptive `type` and `defaultLabel`
   - Clear field definitions with types and descriptions
   - Async function with proper error handling
5. Import and export node in `src/module.ts`
6. Test with `npm run build`

## Common Field Types

- `cognigyText` - Text with CognigyScript support (most common)
- `say` - Full Say control for rich output
- `json` - JSON editor for structured data
- `number`, `select`, `toggle` - Standard form inputs
- `connection` - Reference to connection schema
- `textArray` - Array of text values

See `docs/DEVELOPMENT_GUIDE.md` for complete field type reference.

## Build Commands

- `npm run transpile` - TypeScript → JavaScript
- `npm run lint` - Run linting
- `npm run zip` - Create tarball
- `npm run build` - All of the above

## Expected Behavior

When helping with this project:

1. **Be proactive** - If user asks to create a node, execute the full workflow
2. **Follow git flow** - Don't skip steps like version bumping
3. **Test before committing** - Run `npm run build` to catch errors
4. **Write clean code** - Follow TypeScript best practices
5. **Add documentation** - Update README if adding significant features
6. **Handle errors** - Use try/catch in node functions
7. **Use proper commit messages** - Include Claude Code attribution

## What NOT to Do

- ❌ Don't run `npm version` before committing code changes
- ❌ Don't skip version bumping (CI will fail)
- ❌ Don't commit without testing locally
- ❌ Don't push directly to `main` or `develop`
- ❌ Don't modify `.github/workflows/` without understanding impact
- ❌ Don't commit sensitive data (API keys, credentials)

## Troubleshooting Hints

If build fails:
- Check TypeScript errors with `npm run transpile`
- Check linting errors with `npm run lint`
- Verify all imports are correct in `module.ts`

If version-check workflow fails:
- Version wasn't bumped in `package.json`
- Run `npm version patch` and push

If deployment fails:
- Check GitHub Secrets are configured
- Verify `.github/cognigy-deployments.yml` is correct
- See `docs/GITHUB_ACTIONS_SETUP.md` for troubleshooting

## Reference Documentation

Direct user to these docs for detailed information:
- `docs/GIT_WORKFLOW.md` - Git flow and branching strategy
- `docs/DEVELOPMENT_GUIDE.md` - How to create nodes and extensions
- `docs/GITHUB_ACTIONS_SETUP.md` - CI/CD and deployment setup
- `docs/example/` - Working code examples
