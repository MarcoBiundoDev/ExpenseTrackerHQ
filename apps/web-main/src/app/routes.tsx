import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { HomePage } from "@/pages/HomePage";
import { ExpensesPage } from "@/pages/ExpensesPage";
export function AppRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
   const { inProgress } = useMsal();
  const msalReady = inProgress === InteractionStatus.None;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/expenses"
        element={
          !msalReady ? (
            <div className="min-h-screen bg-background text-foreground" />
          ) : isAuthenticated ? (
            <ExpensesPage />
          ) : (
            <Navigate to="/" replace state={{ from: location }} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}