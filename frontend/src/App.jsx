import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { AssetDetails } from './pages/AssetDetails';
import { Inventory } from './pages/Inventory';
import { StockTransactions } from './pages/StockTransactions';
import { IssueReturn } from './pages/IssueReturn';
import { Maintenance } from './pages/Maintenance';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { AuditLogs } from './pages/AuditLogs';
import { Users } from './pages/Users';

// Role Guard Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Main Application Layout */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="assets/:id" element={<AssetDetails />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="stock-transactions" element={<StockTransactions />} />
              <Route path="issues" element={<IssueReturn />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />

              {/* Admin Only Routes */}
              <Route
                path="audit-logs"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <AuditLogs />
                  </RoleRoute>
                }
              />
              <Route
                path="users"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <Users />
                  </RoleRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
