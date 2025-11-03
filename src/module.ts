import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { exampleNode } from "./nodes/exampleNode";
import { signalApi } from "./nodes/signalApi";

/* import all connections */
import { cxoneBasicAuth } from "./connections/cxoneBasicAuth";
import { cxoneAppCredentials } from "./connections/cxoneAppCredentials";

export default createExtension({
	nodes: [
		exampleNode,
		signalApi
	],

	connections: [
		cxoneBasicAuth,
		cxoneAppCredentials
	],

	options: {
		label: "CXone Extensions"
	}
});
