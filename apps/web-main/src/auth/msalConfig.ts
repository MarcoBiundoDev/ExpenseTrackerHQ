import type { Configuration } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AUTH_CLIENT_ID as string;
const authority = import.meta.env.VITE_AUTH_AUTHORITY as string;
const redirectUri = import.meta.env.VITE_AUTH_REDIRECT_URI as string;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
    // If you later see a post-login redirect loop, we can add:
    // navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};