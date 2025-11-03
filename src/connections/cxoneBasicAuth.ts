import { IConnectionSchema } from "@cognigy/extension-tools";

/**
 * Connection schema for CXone Basic Authentication
 *
 * Used for the Authorization header in token requests.
 * This connection provides the client ID and secret for Basic Auth.
 */
export const cxoneBasicAuth: IConnectionSchema = {
	type: "cxone-basic-auth",
	label: "CXone Basic Authentication",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};
