import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import CoordinatorDashboard from '@/pages/CoordinatorDashboard';
import SystemAdminDashboard from '@/pages/SystemAdminDashboard';
import SiteManagement from '@/pages/SiteManagement';
import ProfessionalReport from '@/pages/ProfessionalReport';
import VisitForm from '@/pages/VisitForm';
import ReportsPage from '@/pages/ReportsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SubjectTree from '@/pages/SubjectTree';
import NotFoundPage from '@/pages/NotFoundPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { CloudSyncProvider } from '@/contexts/CloudSyncContext';

/* ═══════════════════════════════════════════
   Update Toast — shows when new version is available
   ═══════════════════════════════════════════ */
function UpdateToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setMessage(e.detail?.message || 'تحديث جديد متاح!');
      setShow(true);
    };
    window.addEventListener('ertiqa:update', handleUpdate);
    return () => window.removeEventListener('ertiqa:update', handleUpdate);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-in">
      <div className="rounded-xl shadow-xl border px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-[#1B3A5C] to-[#8A1538] border-[#D4AF37]/30">
        <RefreshCw size={20} className="text-[#D4AF37] animate-spin" />
        <p className="font-cairo text-sm font-bold text-white">{message}</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/coordinator" element={<CoordinatorDashboard />} />
      <Route path="/sysadmin" element={<SystemAdminDashboard />} />
      <Route path="/site-management" element={<SiteManagement />} />
      <Route path="/professional-report" element={<ProfessionalReport />} />
      <Route path="/visit/new" element={<VisitForm />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/subjects" element={<SubjectTree />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CloudSyncProvider>
        <UpdateToast />
        <AppRoutes />
      </CloudSyncProvider>
    </AuthProvider>
  );
}
