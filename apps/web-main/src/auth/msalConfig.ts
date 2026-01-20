import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AUTH_CLIENT_ID as string;
const authority = import.meta.env.VITE_AUTH_AUTHORITY as string;

// In Static Web Apps, env vars are baked at build time. If a setting is missing,
// fall back to the current site origin to avoid MSAL crashing at runtime.
const redirectUri =
  (import.meta.env.VITE_AUTH_REDIRECT_URI as string | undefined) ||
  `${window.location.origin}/`;

if (!clientId || !authority) {
  // Make misconfiguration obvious in the console instead of failing mysteriously.
  // (MSAL will still fail to auth if these are empty.)
  console.error(
    "Missing MSAL config. Ensure VITE_AUTH_CLIENT_ID and VITE_AUTH_AUTHORITY are set at build time.",
    { clientId, authority, redirectUri }
  );
}

export const msalConfig: Configuration = {
  auth: { clientId, authority, redirectUri },
  cache: { cacheLocation: "localStorage" },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};