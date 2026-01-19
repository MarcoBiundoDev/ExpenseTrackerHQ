import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import type { AuthenticationResult } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/auth/msalConfig";

async function bootstrap() {
  await msalInstance.initialize();

  try {
    const result: AuthenticationResult | null =
      await msalInstance.handleRedirectPromise();

    if (result?.account) {
      msalInstance.setActiveAccount(result.account);
    } else {
      const all = msalInstance.getAllAccounts();
      if (!msalInstance.getActiveAccount() && all.length > 0) {
        msalInstance.setActiveAccount(all[0]);
      }
    }
  } catch {
    const all = msalInstance.getAllAccounts();
    if (!msalInstance.getActiveAccount() && all.length > 0) {
      msalInstance.setActiveAccount(all[0]);
    }
  }

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