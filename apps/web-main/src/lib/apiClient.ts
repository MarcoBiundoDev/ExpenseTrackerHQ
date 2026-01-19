import axios, { AxiosHeaders } from "axios";
import { msalInstance } from "@/auth/msalConfig";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const apiScope = import.meta.env.VITE_API_SCOPE as string | undefined;

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (!apiScope) return config;

    const active = msalInstance.getActiveAccount();
    const account = active ?? msalInstance.getAllAccounts()[0];
    if (!account) return config;

    if (!active) msalInstance.setActiveAccount(account);

    try {
      const tokenResult = await msalInstance.acquireTokenSilent({
        account,
        scopes: [apiScope],
      });

      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers);

      headers.set("Authorization", `Bearer ${tokenResult.accessToken}`);
      config.headers = headers;
    } catch {
      // allow 401
    }

    return config;
  },
  (error) => Promise.reject(error)
);