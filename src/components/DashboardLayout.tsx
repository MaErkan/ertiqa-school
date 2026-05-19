import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import {
  LayoutDashboard, FileCheck, FileText, BarChart3,
  Bell, LogOut, Menu, X, ChevronLeft, Search, TreePine, Download, Cloud, CloudOff, Shield
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const adminNavItems: NavItem[] = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'زيارة صفية جديدة', icon: FileCheck, path: '/visit/new' },
  { label: 'المعلمون والمواد', icon: TreePine, path: '/subjects' },
  { label: 'التقارير', icon: FileText, path: '/reports' },
  { label: 'الإحصائيات', icon: BarChart3, path: '/analytics' },
];

const coordinatorNavItems: NavItem[] = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/coordinator' },
  { label: 'زيارة صفية جديدة', icon: FileCheck, path: '/visit/new' },
  { label: 'معلمو المادة', icon: TreePine, path: '/subjects' },
  { label: 'تقارير المادة', icon: FileText, path: '/reports' },
  { label: 'إحصائيات المادة', icon: BarChart3, path: '/analytics' },
];

const sysadminNavItems: NavItem[] = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/sysadmin' },
  { label: 'إدارة الموقع', icon: Shield, path: '/site-management' },
  { label: 'التقارير الاحترافية', icon: FileText, path: '/professional-report' },
  { label: 'المواد والمعلمون', icon: TreePine, path: '/subjects' },
  { label: 'التقارير والتصدير', icon: Download, path: '/reports' },
  { label: 'الإحصائيات', icon: BarChart3, path: '/analytics' },
];

export default function DashboardLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { myNotifications, unreadCount, lastSyncTime, syncStatus, markNotificationRead, markAllRead, cloudEnabled, toast, clearToast } = useCloudSync();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = user?.role === 'coordinator' ? coordinatorNavItems
    : user?.role === 'sysadmin' ? sysadminNavItems
    : adminNavItems;

  const isActive = (path: string) => location.pathname === path;

  const syncDotColor = syncStatus === 'online' ? 'var(--success)' : syncStatus === 'syncing' ? 'var(--warning)' : 'var(--error)';
  const SyncIcon = cloudEnabled ? Cloud : CloudOff;

  return (
    <div className="min-h-screen" style={{ background: 'var(--off-white)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-[99] lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar lg:translate-x-0 ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/assets/logo.jpg" alt="شعار ارتقاء" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-sm" style={{ color: 'var(--text-primary)' }}>نظام ارتقاء</h3>
              <p className="font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>للمتابعة الصفية الذكية</p>
            </div>
            <button className="mr-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} style={{ color: 'var(--gray-500)' }} />
            </button>
          </div>
        </div>

        <nav className="p-3 mt-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.path + item.label}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`sidebar-item w-full text-right ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--gray-200)' }}>
          {/* Sync status */}
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg" style={{ background: syncStatus === 'online' ? 'var(--success-light)' : syncStatus === 'syncing' ? 'var(--warning-light)' : 'var(--error-light)' }}>
            <SyncIcon size={14} style={{ color: syncDotColor }} />
            <span className="font-tajawal text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              {syncStatus === 'online' ? '☁️ متصل' : syncStatus === 'syncing' ? '⏳ مزامنة...' : '📱 محلي'}
              {' · '}{lastSyncTime}
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-cairo font-bold text-xs text-white flex-shrink-0" style={{ background: 'var(--qatar-maroon)' }}>
                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-cairo font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="font-tajawal text-[11px] truncate" style={{ color: 'var(--gray-500)' }}>{user.roleLabel}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg font-cairo font-semibold text-sm transition-colors"
            style={{ color: 'var(--error)', background: 'var(--error-light)' }}
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="topbar flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg" style={{ background: 'var(--gray-100)' }}>
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <ChevronLeft size={14} style={{ color: 'var(--gray-500)' }} />
            <span className="font-cairo font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{pageTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--gray-100)' }}>
            <Search size={16} style={{ color: 'var(--gray-500)' }} />
            <input type="text" placeholder="بحث..." className="bg-transparent border-none outline-none font-tajawal text-sm w-40" style={{ color: 'var(--text-primary)' }} />
          </div>

          {/* Cloud indicator */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg" style={{ background: cloudEnabled ? 'var(--success-light)' : 'var(--gray-100)' }}>
            <SyncIcon size={14} style={{ color: cloudEnabled ? 'var(--success)' : 'var(--gray-500)' }} />
            <span className="font-tajawal text-[10px]" style={{ color: cloudEnabled ? 'var(--success)' : 'var(--gray-500)' }}>
              {cloudEnabled ? 'سحابي' : 'محلي'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl transition-colors"
              style={{ background: 'var(--gray-100)' }}
            >
              <Bell size={18} style={{ color: 'var(--gray-700)' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: 'var(--qatar-maroon)' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute left-0 top-12 w-80 bg-white rounded-xl shadow-lg border p-3 z-[200] max-h-96 overflow-y-auto" style={{ borderColor: 'var(--gray-200)' }}>
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="font-cairo font-bold text-sm">الإشعارات ({myNotifications.length})</span>
                  <button onClick={markAllRead} className="text-xs font-tajawal" style={{ color: 'var(--qatar-maroon)' }}>قراءة الكل</button>
                </div>
                {myNotifications.length === 0 ? (
                  <p className="text-center py-4 font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>لا توجد إشعارات جديدة</p>
                ) : (
                  myNotifications.slice(0, 10).map(n => (
                    <div key={n.id} className="p-2 rounded-lg cursor-pointer transition-colors" style={{ background: n.read ? 'transparent' : 'rgba(138,21,56,0.03)' }} onClick={() => markNotificationRead(n.id)}>
                      <div className="flex items-center gap-2">
                        {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--qatar-maroon)' }} />}
                        <p className="font-cairo text-xs font-bold flex-1">{n.title}</p>
                      </div>
                      <p className="font-tajawal text-[11px] mr-4" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <span className="hidden md:block font-ibm text-xs" style={{ color: 'var(--gray-500)' }}>
            {new Date().toLocaleDateString('ar-QA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* ═══ Toast Notification ═══ */}
      {toast && toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[90%] animate-bounce-in">
          <div className={`rounded-xl shadow-xl border px-4 py-3 flex items-center gap-3 ${
            toast.type === 'visit' ? 'bg-[#8A1538]/95 border-[#D4AF37]/30' :
            toast.type === 'sync' ? 'bg-[#1B3A5C]/95 border-[#D4AF37]/30' :
            'bg-white/95 border-gray-200'
          }`}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-cairo text-sm font-bold truncate ${toast.type === 'visit' || toast.type === 'sync' ? 'text-white' : 'text-gray-900'}`}>
                {toast.type === 'visit' ? 'زيارة جديدة!' : toast.type === 'sync' ? 'تزامن!' : 'إشعار'}
              </p>
              <p className={`font-tajawal text-xs truncate ${toast.type === 'visit' || toast.type === 'sync' ? 'text-white/80' : 'text-gray-600'}`}>
                {toast.message}
              </p>
            </div>
            <button onClick={clearToast} className={`p-1 rounded-lg hover:bg-white/20 flex-shrink-0 ${toast.type === 'visit' || toast.type === 'sync' ? 'text-white/70' : 'text-gray-400'}`}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
