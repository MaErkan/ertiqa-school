import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CloudSyncProvider } from '@/contexts/CloudSyncContext';
import SiteManagement from '@/pages/SiteManagement';

export default function App() {
  return (
    <AuthProvider>
      <CloudSyncProvider>
        <Routes>
          <Route path="/site-management" element={<SiteManagement />} />
          <Route path="*" element={<SiteManagement />} />
        </Routes>
      </CloudSyncProvider>
    </AuthProvider>
  );
}
