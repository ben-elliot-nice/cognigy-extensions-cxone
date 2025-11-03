import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

/**
 * CXone Signal API Node
 *
 * This node performs the complete authentication and Signal API call flow:
 * 1. Check cached token validity
 * 2. Get OpenID configuration (if token invalid/missing)
 * 3. Retrieve access token
 * 4. Decode token and extract tenant ID
 * 5. Get API endpoints from discovery API
 * 6. Call Signal API with parameters
 * 7. Store response in context or input
 */

// Type for signal cache in context
interface ISignalCache {
	token?: string;
	tenantId?: string;
	apiEndpoint?: string;
	tokenEndpoint?: string;
	error?: {
		step: string;
		message: string;
		details: any;
	};
}

export interface ISignalApiParams extends INodeFunctionBaseParams {
	config: {
		basicAuthConnection: {
			username: string;
			password: string;
		};
		appCredentialsConnection: {
			username: string;
			password: string;
		};
		contactId: string;
		parameters: string[];
		storageType: string;
		storageKey: string;
	};
}

// Helper function to decode JWT token
function decodeJWT(token: string): any {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new Error('Invalid JWT format');
		}
		const payload = parts[1];
		const decoded = Buffer.from(payload, 'base64').toString('utf8');
		return JSON.parse(decoded);
	} catch (error) {
		throw new Error(`Failed to decode JWT: ${error.message}`);
	}
}

// Helper function to check if token is expired
function isTokenExpired(decodedToken: any): boolean {
	if (!decodedToken.exp) {
		return true;
	}
	const currentTime = Math.floor(Date.now() / 1000);
	// Add 60 second buffer to account for clock skew
	return decodedToken.exp < (currentTime + 60);
}

export const signalApi = createNodeDescriptor({
	type: "signalApi",
	defaultLabel: "CXone Signal API",
	summary: "Call CXone Signal API with automatic authentication and token management",
	fields: [
		{
			key: "basicAuthConnection",
			label: "Basic Auth Connection",
			type: "connection",
			params: {
				connectionType: "cxone-basic-auth",
				required: true
			},
			description: "Basic authentication credentials for token request"
		},
		{
			key: "appCredentialsConnection",
			label: "Application Credentials",
			type: "connection",
			params: {
				connectionType: "cxone-app-credentials",
				required: true
			},
			description: "Application username and password for token grant"
		},
		{
			key: "contactId",
			label: "Contact ID",
			type: "cognigyText",
			params: {
				required: true
			},
			description: "The contact/interaction ID for the Signal API call"
		},
		{
			key: "parameters",
			label: "Parameters (p1-p9)",
			type: "textArray",
			defaultValue: [],
			description: "Optional parameters to append as query params (p1, p2, p3...p9). Leave empty if not needed."
		},
		{
			key: "storageType",
			label: "Store Response In",
			type: "select",
			defaultValue: "context",
			params: {
				options: [
					{ label: "Context", value: "context" },
					{ label: "Input", value: "input" }
				],
				required: true
			},
			description: "Where to store the Signal API response"
		},
		{
			key: "storageKey",
			label: "Storage Key",
			type: "cognigyText",
			defaultValue: "signalResponse",
			params: {
				required: true
			},
			description: "The key name for storing the response"
		}
	],
	sections: [
		{
			key: "authentication",
			label: "Authentication",
			defaultCollapsed: false,
			fields: ["basicAuthConnection", "appCredentialsConnection"]
		},
		{
			key: "apiSettings",
			label: "API Settings",
			defaultCollapsed: false,
			fields: ["contactId", "parameters"]
		},
		{
			key: "storage",
			label: "Response Storage",
			defaultCollapsed: false,
			fields: ["storageType", "storageKey"]
		}
	],
	form: [
		{ type: "section", key: "authentication" },
		{ type: "section", key: "apiSettings" },
		{ type: "section", key: "storage" }
	],
	preview: {
		type: "text",
		key: "contactId"
	},
	function: async ({ cognigy, config }: ISignalApiParams) => {
		const { api, context, input } = cognigy;
		const {
			basicAuthConnection,
			appCredentialsConnection,
			contactId,
			parameters,
			storageType,
			storageKey
		} = config;

		const BASE_URL = "https://cxone.niceincontact.com";
		const API_VERSION = "v33.0";

		try {
			// Initialize signal context if not exists
			if (!context.signal) {
				context.signal = {} as ISignalCache;
			}

			const signalCache = context.signal as ISignalCache;
			let token = signalCache.token;
			let tenantId = signalCache.tenantId;
			let apiEndpoint = signalCache.apiEndpoint;
			let tokenEndpoint = signalCache.tokenEndpoint;

			// Step 1: Check if token exists and is valid
			let needNewToken = true;
			if (token) {
				try {
					const decodedToken = decodeJWT(token);
					if (!isTokenExpired(decodedToken)) {
						api.log("info", "Using cached valid token");
						needNewToken = false;
						tenantId = decodedToken.tenantId;
					} else {
						api.log("info", "Cached token expired, fetching new token");
					}
				} catch (error) {
					api.log("warn", `Token validation failed: ${error.message}`);
				}
			}

			// Step 2: Get OpenID Configuration (if needed)
			if (needNewToken && !tokenEndpoint) {
				api.log("info", "Fetching OpenID configuration");
				const openidConfigUrl = `${BASE_URL}/.well-known/openid-configuration`;

				const openidResponse = await axios.get(openidConfigUrl);

				if (!openidResponse.data || !openidResponse.data.token_endpoint) {
					throw new Error("Failed to retrieve token_endpoint from OpenID configuration");
				}

				tokenEndpoint = openidResponse.data.token_endpoint;
				signalCache.tokenEndpoint = tokenEndpoint;
				api.log("info", `Retrieved token endpoint: ${tokenEndpoint}`);
			}

			// Step 3: Get Access Token (if needed)
			if (needNewToken) {
				api.log("info", "Requesting access token");

				// Create Basic Auth header
				const basicAuthString = Buffer.from(
					`${basicAuthConnection.username}:${basicAuthConnection.password}`
				).toString('base64');

				// Prepare form data for token request
				const formData = new URLSearchParams();
				formData.append('grant_type', 'password');
				formData.append('username', appCredentialsConnection.username);
				formData.append('password', appCredentialsConnection.password);

				const tokenResponse = await axios.post(
					tokenEndpoint,
					formData.toString(),
					{
						headers: {
							"Authorization": `Basic ${basicAuthString}`,
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}
				);

				if (!tokenResponse.data || !tokenResponse.data.access_token) {
					throw new Error("Failed to retrieve access token from response");
				}

				token = tokenResponse.data.access_token;
				signalCache.token = token;
				api.log("info", "Access token retrieved successfully");

				// Step 4: Decode token and extract tenant ID
				const decodedToken = decodeJWT(token);
				tenantId = decodedToken.tenantId;
				signalCache.tenantId = tenantId;
				api.log("info", `Extracted tenant ID: ${tenantId}`);
			}

			// Step 5: Get API Endpoints (if not cached)
			if (!apiEndpoint) {
				api.log("info", "Fetching API endpoint from discovery service");
				const discoveryUrl = `${BASE_URL}/.well-known/cxone-configuration?tenantId=${tenantId}`;

				const discoveryResponse = await axios.get(discoveryUrl);

				if (!discoveryResponse.data || !discoveryResponse.data.api_endpoint) {
					throw new Error("Failed to retrieve api_endpoint from discovery service");
				}

				apiEndpoint = discoveryResponse.data.api_endpoint;
				signalCache.apiEndpoint = apiEndpoint;
				api.log("info", `Retrieved API endpoint: ${apiEndpoint}`);
			}

			// Step 6: Build Signal API URL with parameters
			let signalUrl = `${apiEndpoint}/incontactapi/services/${API_VERSION}/interactions/${contactId}/signal`;

			// Add query parameters if provided
			if (parameters && parameters.length > 0) {
				const queryParams = parameters
					.slice(0, 9) // Limit to 9 parameters (p1-p9)
					.map((value, index) => `p${index + 1}=${encodeURIComponent(value)}`)
					.join('&');
				signalUrl += `?${queryParams}`;
				api.log("info", `Added ${parameters.length} parameters to Signal API call`);
			}

			// Step 7: Call Signal API
			api.log("info", `Calling Signal API for contact ID: ${contactId}`);

			const signalResponse = await axios.post(
				signalUrl,
				{}, // Empty body for POST request
				{
					headers: {
						"Authorization": `Bearer ${token}`,
						"Accept": "application/json"
					}
				}
			);

			api.log("info", "Signal API call successful");

			// Step 8: Store response
			const responseData = signalResponse.data || signalResponse;

			if (storageType === "context") {
				context[storageKey] = responseData;
				api.log("info", `Response stored in context.${storageKey}`);
			} else {
				// @ts-ignore
				api.addToInput(storageKey, responseData);
				api.log("info", `Response stored in input.${storageKey}`);
			}

		} catch (error: any) {
			const errorMessage = error.message || String(error);
			const errorDetails = {
				step: error.step || "unknown",
				message: errorMessage,
				details: error.response?.data || error
			};

			// Store error in context
			if (!context.signal) {
				context.signal = {} as ISignalCache;
			}
			const signalCache = context.signal as ISignalCache;
			signalCache.error = errorDetails;

			// Log detailed error
			api.log("error", `Signal API Error: ${errorMessage}`);
			api.log("error", `Error details: ${JSON.stringify(errorDetails)}`);
		}
	}
});
