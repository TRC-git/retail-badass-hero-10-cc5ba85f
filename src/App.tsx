import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner";

// Import pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import POS from "@/pages/POS";
import Inventory from "@/pages/Inventory";
import Settings from "@/pages/Settings";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import HighlevelOAuthCallback from "@/components/settings/HighlevelOAuthCallback";

// Temporary placeholder pages for components not yet implemented
const Register = () => <div className="p-8 text-lg">Register Page</div>;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Root component for layout with toaster
function Root() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  console.log("App rendering with standard Routes");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Root />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route index element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="pos" element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            } />
            <Route path="clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="clients/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
            <Route path="transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="settings/crm/oauth/callback" element={
              <ProtectedRoute>
                <HighlevelOAuthCallback />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;
