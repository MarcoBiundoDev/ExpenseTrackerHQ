import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { HomePage } from "@/pages/HomePage";
import { ExpensesPage } from "@/pages/ExpensesPage";

export function AppRoutes() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/expenses"
        element={
          isAuthenticated ? (
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