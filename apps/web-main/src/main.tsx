import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

// Minimal MSAL config (kept inline for now so we don't touch other files)
const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID as string,
    authority: import.meta.env.VITE_AUTH_AUTHORITY as string,
    redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI as string,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

async function bootstrap() {
  // MSAL v3+ requires explicit async initialization.
  await msalInstance.initialize();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MsalProvider>
    </React.StrictMode>
  );
}

bootstrap();