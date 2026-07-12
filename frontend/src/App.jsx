import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OrgSetupPage from './pages/OrgSetupPage';
import AssetsPage from './pages/AssetsPage';
import AllocationsPage from './pages/AllocationsPage';
import BookingsPage from './pages/BookingsPage';
import MaintenancePage from './pages/MaintenancePage';
import AuditsPage from './pages/AuditsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import './App.css';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading AssetFlow...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />

      {/* Protected routes wrapped in Layout */}
      <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><Layout><AssetsPage /></Layout></ProtectedRoute>} />
      <Route path="/allocations" element={<ProtectedRoute><Layout><AllocationsPage /></Layout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Layout><BookingsPage /></Layout></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><Layout><MaintenancePage /></Layout></ProtectedRoute>} />
      <Route path="/audits" element={<ProtectedRoute roles={['Admin', 'AssetManager']}><Layout><AuditsPage /></Layout></ProtectedRoute>} />
      <Route path="/org-setup" element={<ProtectedRoute roles={['Admin']}><Layout><OrgSetupPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['Admin', 'AssetManager']}><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
      <Route path="/activity-logs" element={<ProtectedRoute roles={['Admin']}><Layout><ActivityLogsPage /></Layout></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
