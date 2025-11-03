import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/**
 * Example node - demonstrates basic Cognigy extension node structure
 *
 * This is a starter node that you can use as a template for building your own nodes.
 * Replace or delete this file with your own node implementations.
 */

export interface IExampleNodeParams extends INodeFunctionBaseParams {
	config: {
		message: string;
	};
}

export const exampleNode = createNodeDescriptor({
	type: "exampleNode",
	defaultLabel: "Example Node",
	summary: "A simple example node to get you started",
	fields: [
		{
			key: "message",
			label: "Message",
			type: "cognigyText",
			defaultValue: "Hello from my extension!",
			description: "Enter a message to store in the context"
		}
	],
	preview: {
		type: "text",
		key: "message"
	},
	function: async ({ cognigy, config }: IExampleNodeParams) => {
		const { api } = cognigy;
		const { message } = config;

		// Store the message in the context
		api.addToContext("exampleOutput", {
			message,
			timestamp: new Date().toISOString()
		}, "simple");

		// Output feedback to the user
		api.output(message);
	}
});
