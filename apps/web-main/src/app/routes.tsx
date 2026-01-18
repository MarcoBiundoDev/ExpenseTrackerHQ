import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ExpensesPage } from "@/pages/ExpensesPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}