# Cognigy Extension Development Guide

This guide explains how to create and structure Cognigy.AI extensions.

## Project Overview

This is a Cognigy.AI Extension project that creates custom nodes for Cognigy.AI 4.0+. Extensions are TypeScript projects that compile to tarballs and get uploaded to Cognigy.AI.

## Repository Structure

```
.
├── .github/
│   ├── workflows/              # GitHub Actions CI/CD
│   └── cognigy-deployments.yml # Deployment configuration
├── docs/                       # Documentation
├── src/
│   ├── nodes/                  # Node implementations
│   │   └── exampleNode.ts
│   ├── connections/            # Connection schemas (optional)
│   └── module.ts               # Extension entry point
├── package.json                # Version and dependencies
├── tsconfig.json               # TypeScript configuration
├── tslint.json                 # Linting rules
└── icon.png                    # Extension icon (64x64)
```

## Creating a Node

### Basic Node Structure

```typescript
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IMyNodeParams extends INodeFunctionBaseParams {
	config: {
		fieldName: string;
	};
}

export const myNode = createNodeDescriptor({
	type: "myNodeType",
	defaultLabel: "My Node Label",
	summary: "Brief description of what this node does",
	fields: [
		{
			key: "fieldName",
			label: "Field Label",
			type: "cognigyText",
			defaultValue: "default value",
			description: "Help text shown to users"
		}
	],
	preview: {
		type: "text",
		key: "fieldName"
	},
	function: async ({ cognigy, config }: IMyNodeParams) => {
		const { api, context } = cognigy;
		const { fieldName } = config;

		// Your node logic here
		context.myOutput = fieldName;
		api.output("Message to user");
	}
});
```

### Available Field Types

| Type | Description | Use Case |
|------|-------------|----------|
| `cognigyText` | Text with CognigyScript support | User input, dynamic text |
| `say` | Full Say control | Complex output with data/galleries |
| `json` | JSON editor | Structured data input |
| `number` | Number input | Numeric values |
| `slider` | Number slider | Ranged numeric values |
| `toggle` | Boolean toggle | On/off settings |
| `checkbox` | Checkbox | Boolean flags |
| `select` | Dropdown select | Pick from options |
| `chipInput` | Tag/chip input | Multiple text values |
| `textArray` | Array of text inputs | List of strings |
| `date` | Date picker | Date selection |
| `datetime` | Date and time picker | Timestamp selection |
| `daterange` | Date range picker | Time periods |
| `time` | Time picker | Time of day |
| `connection` | Connection reference | API credentials |
| `adaptivecard` | Adaptive Card editor | Adaptive Cards |
| `xml` | XML editor | XML content |

### Field Configuration Example

```typescript
fields: [
	// Simple text input
	{
		key: "message",
		label: "Message",
		type: "cognigyText",
		defaultValue: "Hello!",
		description: "The message to display"
	},

	// Dropdown select
	{
		key: "priority",
		label: "Priority",
		type: "select",
		defaultValue: "medium",
		params: {
			options: [
				{ label: "Low", value: "low" },
				{ label: "Medium", value: "medium" },
				{ label: "High", value: "high" }
			],
			required: true
		}
	},

	// Number input with constraints
	{
		key: "timeout",
		label: "Timeout (seconds)",
		type: "number",
		defaultValue: 30,
		params: {
			min: 1,
			max: 300,
			required: true
		}
	},

	// Connection reference
	{
		key: "connection",
		label: "API Connection",
		type: "connection",
		params: {
			connectionType: "my-api-connection",
			required: true
		}
	}
]
```

### Using Cognigy API Methods

```typescript
function: async ({ cognigy, config }: IMyNodeParams) => {
	const { api, context, input } = cognigy;

	// Store data in context
	api.addToContext("key", { data: "value" }, "simple");

	// Store data in input (conversation state)
	// @ts-ignore
	api.addToInput("key", { data: "value" });

	// Output text to user
	api.output("Hello!");

	// Output using Say (rich content)
	api.say("Hello!", { key: "value" });

	// Log messages (visible in logs)
	api.log("info", "Processing...");
	api.log("error", "Something went wrong");

	// Access context and input
	const userId = context.userId;
	const userInput = input.text;
}
```

### Organizing Fields with Sections

For complex nodes with many fields, use sections:

```typescript
sections: [
	{
		key: "apiSettings",
		label: "API Settings",
		defaultCollapsed: true,
		fields: ["endpoint", "timeout", "retries"]
	},
	{
		key: "outputSettings",
		label: "Output Settings",
		defaultCollapsed: false,
		fields: ["storeLocation", "contextKey"]
	}
],
form: [
	{ type: "field", key: "connection" },
	{ type: "section", key: "apiSettings" },
	{ type: "section", key: "outputSettings" }
]
```

## Registering Nodes

Edit `src/module.ts` to register your nodes:

```typescript
import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { myNode } from "./nodes/myNode";
import { anotherNode } from "./nodes/anotherNode";

export default createExtension({
	nodes: [
		myNode,
		anotherNode
	],

	connections: [],

	options: {
		label: "My Extension"
	}
});
```

## Creating Connections

For extensions that need API credentials, create a connection schema:

```typescript
// src/connections/myApiConnection.ts
import { IConnectionSchema } from "@cognigy/extension-tools";

export const myApiConnection: IConnectionSchema = {
	type: "my-api-connection",
	label: "My API Connection",
	fields: [
		{
			fieldName: "apiKey"
		},
		{
			fieldName: "apiUrl"
		}
	]
};
```

Register in `module.ts`:

```typescript
import { myApiConnection } from "./connections/myApiConnection";

export default createExtension({
	nodes: [...],
	connections: [myApiConnection],
	options: { label: "My Extension" }
});
```

Use in a node:

```typescript
fields: [
	{
		key: "connection",
		label: "API Connection",
		type: "connection",
		params: {
			connectionType: "my-api-connection",
			required: true
		}
	}
]

// Access in function
function: async ({ cognigy, config }) => {
	const { connection } = config;
	const apiKey = connection.apiKey;
	const apiUrl = connection.apiUrl;
	// Use credentials...
}
```

## Build Process

| Command | What It Does |
|---------|--------------|
| `npm run transpile` | Compiles TypeScript to `build/` |
| `npm run lint` | Runs tslint checks |
| `npm run zip` | Creates `.tar.gz` package |
| `npm run build` | Runs all three in sequence |

**Build Output:**
- `build/` - Compiled JavaScript
- `{package-name}-{version}.tar.gz` - Uploadable package containing:
  - `build/*`
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - `icon.png`

## Best Practices

- ✅ Add clear descriptions to all fields
- ✅ Provide sensible default values
- ✅ Use TypeScript interfaces for type safety
- ✅ Handle errors gracefully
- ✅ Log important operations with `api.log()`
- ✅ Store results in context/input for use in other nodes
- ✅ Test locally with `npm run build` before committing
- ✅ Follow existing code patterns in `docs/example/`

## Examples

See `docs/example/src/nodes/` for complete working examples:
- `fullExample.ts` - Comprehensive node with multiple field types
- `reverseSay.ts` - Simple text manipulation
- `randomPath.ts` - Node with multiple output paths
- `executeCognigyApiRequest.ts` - External API call example

## Troubleshooting

### TypeScript Errors

```bash
npm run transpile
# Fix errors shown
```

### Linting Errors

```bash
npm run lint
# Fix issues or suppress with // tslint:disable-next-line
```

### Extension Not Appearing in Cognigy

- Check that node is exported in `module.ts`
- Verify `npm run build` succeeds
- Ensure `.tar.gz` was uploaded correctly
- Check Cognigy logs for extension loading errors
