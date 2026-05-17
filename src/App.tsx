import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CloudSyncProvider } from '@/contexts/CloudSyncContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import CoordinatorDashboard from '@/pages/CoordinatorDashboard';
import SystemAdminDashboard from '@/pages/SystemAdminDashboard';
import VisitForm from '@/pages/VisitForm';
import ReportsPage from '@/pages/ReportsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SubjectTree from '@/pages/SubjectTree';
import SiteManagement from '@/pages/SiteManagement';
import './App.css';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'coordinator') return <Navigate to="/coordinator" replace />;
    if (user.role === 'sysadmin') return <Navigate to="/sysadmin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'coordinator' ? '/coordinator' : user?.role === 'sysadmin' ? '/sysadmin' : '/dashboard'} replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['manager', 'academic_vp', 'admin_vp']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/coordinator" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
      <Route path="/sysadmin" element={<ProtectedRoute allowedRoles={['sysadmin']}><SystemAdminDashboard /></ProtectedRoute>} />
      <Route path="/visit/new" element={<ProtectedRoute allowedRoles={['manager', 'academic_vp', 'admin_vp', 'coordinator']}><VisitForm /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><SubjectTree /></ProtectedRoute>} />
      <Route path="/site-management" element={<ProtectedRoute allowedRoles={['sysadmin']}><SiteManagement /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CloudSyncProvider>
          <AppRoutes />
        </CloudSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
