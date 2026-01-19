import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AUTH_CLIENT_ID as string;
const authority = import.meta.env.VITE_AUTH_AUTHORITY as string;
const redirectUri = import.meta.env.VITE_AUTH_REDIRECT_URI as string;

export const msalConfig: Configuration = {
  auth: { clientId, authority, redirectUri },
  cache: { cacheLocation: "localStorage" },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};