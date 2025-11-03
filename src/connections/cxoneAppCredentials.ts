import { IConnectionSchema } from "@cognigy/extension-tools";

/**
 * Connection schema for CXone Application Credentials
 *
 * Used in the token request payload for username/password grant type.
 * These credentials are sent in the request body.
 */
export const cxoneAppCredentials: IConnectionSchema = {
	type: "cxone-app-credentials",
	label: "CXone Application Credentials",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};
