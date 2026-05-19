import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, FileText, BarChart3, Shield, Settings, LogOut, Menu, X
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
  pageTitle: string;
}

const navItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'المستخدمين', icon: Users, path: '/users' },
  { label: 'المواد', icon: BookOpen, path: '/subjects' },
  { label: 'التقارير', icon: FileText, path: '/reports' },
  { label: 'الإحصائيات', icon: BarChart3, path: '/analytics' },
  { label: 'إدارة الموقع', icon: Shield, path: '/site-management' },
  { label: 'الإعدادات', icon: Settings, path: '/settings' },
];

export default function DashboardLayout({ children, pageTitle }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-[#8A1538] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-cairo font-bold text-lg">{pageTitle}</h1>
        </div>
        <Link to="/" className="flex items-center gap-2">
          <img src="/pwa-icon-192.png" alt="logo" className="w-8 h-8 rounded-full" />
          <span className="font-cairo font-bold text-sm hidden sm:inline">ارتقاء</span>
        </Link>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 right-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} pt-16 lg:pt-0`}>
          <nav className="p-4 space-y-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-cairo text-sm font-bold transition-all ${location.pathname === item.path ? 'bg-[#8A1538] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-cairo text-sm font-bold text-red-600 hover:bg-red-50 transition-all mt-4">
              <LogOut size={18} /> تسجيل خروج
            </button>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
