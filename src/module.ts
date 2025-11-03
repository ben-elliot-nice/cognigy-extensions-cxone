import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { exampleNode } from "./nodes/exampleNode";

export default createExtension({
	nodes: [
		exampleNode
	],

	connections: [],

	options: {
		label: "My Extension"
	}
});
