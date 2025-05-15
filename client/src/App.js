import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import InvoiceHistory from "./pages/InvoiceHistory";
import ManageUsers from "./pages/ManageUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// API base URL configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path
  : 'http://localhost:5000/api';  // In development, use local server

const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideLayout = ["/auth", "/forgot-password", "/reset"].some(path =>
    location.pathname.startsWith(path)
  );
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user && !["/auth", "/forgot-password", "/reset"].some(path => location.pathname.startsWith(path))) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {!hideLayout && <Sidebar />}
      {!hideLayout && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Auth and Password Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />

          {/* Main App Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/invoices" element={<InvoiceHistory />} />

          {/* Admin Protected Routes */}
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
