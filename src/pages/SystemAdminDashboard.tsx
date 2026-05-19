import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, BookOpen, FileText, Download, Trash2, Edit2,
  Plus, X, CheckCircle, Search,
  Settings, Cloud, CloudOff, RefreshCw, Eye, UserX
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { subjects, monthlyVisitData } from '@/data/demoData';

type Tab = 'overview' | 'users' | 'visits' | 'subjects' | 'settings';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  subjectName?: string;
  active: boolean;
}

const roleOptions = [
  { value: 'manager', label: 'مدير المدرسة' },
  { value: 'academic_vp', label: 'النائب الأكاديمي' },
  { value: 'admin_vp', label: 'النائب الإداري' },
  { value: 'coordinator', label: 'منسق مادة' },
  { value: 'sysadmin', label: 'مسؤول النظام' },
];

function loadUsers(): UserRecord[] {
  try {
    const stored = localStorage.getItem('ertiqa_users');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Default users
  const defaults: UserRecord[] = [
    { id: 'admin-1', name: 'يوسف إبراهيم يوسف جاسم الجاسم', email: 'y.al-jassim0101@education.qa', role: 'manager', roleLabel: 'مدير المدرسة', active: true },
    { id: 'admin-2', name: 'أحمد محمد رمضان محمد', email: 'a.mohamed2211@education.qa', role: 'academic_vp', roleLabel: 'النائب الأكاديمي', active: true },
    { id: 'admin-3', name: 'حمد هادي محمد الغفراني المري', email: 'h.almarri23103@education.qa', role: 'admin_vp', roleLabel: 'النائب الإداري', active: true },
    { id: 'coord-1', name: 'عبدالله الشافعي محمد نعسان السيد', email: 'a.alsayed0101@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'التربية الإسلامية', active: true },
    { id: 'coord-2', name: 'أحمد حسين عموش', email: 'a.amooush0503@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'اللغة العربية', active: true },
    { id: 'coord-3', name: 'محمد حامد عبدالفتاح محمد عبدالله', email: 'm.abdallah0108@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'اللغة الإنجليزية', active: true },
    { id: 'coord-4', name: 'شريف عبدالمنعم عبدالحي البرلسي', email: 'coordinator-math@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'الرياضيات', active: true },
    { id: 'coord-5', name: 'أشرف السيد جودة السيد محمد', email: 'coordinator-physics@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'الفيزياء', active: true },
    { id: 'coord-6', name: 'حسام محمد أبو النصر محمد الزياتي', email: 'coordinator-chem@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'الكيمياء', active: true },
    { id: 'coord-7', name: 'أحمد عبدالحميد أحمد عبدالمحسن', email: 'coordinator-bio@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'الأحياء', active: true },
    { id: 'coord-8', name: 'علاء معوض إبراهيم حمودة', email: 'coordinator-social@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'الدراسات الاجتماعية', active: true },
    { id: 'coord-9', name: 'محمد فتحي إبراهيم فريج', email: 'coordinator-it@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'تكنولوجيا المعلومات', active: true },
    { id: 'coord-10', name: 'محمد جواد علي أكبر محمد جواد لاري', email: 'coordinator-pe@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'التربية البدنية', active: true },
    { id: 'coord-11', name: 'هيثم محمد محمد أحمد الشامي', email: 'coordinator-el@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'التعليم الإلكتروني', active: true },
    { id: 'sys-1', name: 'الأستاذ يوسف الجاسم', email: 'sysadmin1@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام', active: true },
    { id: 'sys-2', name: 'الدكتور أحمد رمضان', email: 'sysadmin2@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام', active: true },
  ];
  localStorage.setItem('ertiqa_users', JSON.stringify(defaults));
  return defaults;
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem('ertiqa_users', JSON.stringify(users));
}

/* ═══════════════════════════════════════════
   MAIN SYSTEM ADMIN DASHBOARD
   ═══════════════════════════════════════════ */
export default function SystemAdminDashboard() {
  const { visits, lastSyncTime, syncStatus, pushToCloud, pullFromCloud, exportData } = useCloudSync();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<UserRecord[]>(loadUsers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [toast, setToast] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('coordinator');
  const [formSubject, setFormSubject] = useState('');

  // Filtered
  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.includes(search) || u.email.includes(search));
  }, [users, search]);

  const activeCount = users.filter(u => u.active).length;
  const inactiveCount = users.filter(u => !u.active).length;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function openAdd() {
    setEditingUser(null);
    setFormName(''); setFormEmail(''); setFormRole('coordinator'); setFormSubject('');
    setShowModal(true);
  }

  function openEdit(u: UserRecord) {
    setEditingUser(u);
    setFormName(u.name); setFormEmail(u.email); setFormRole(u.role); setFormSubject(u.subjectName || '');
    setShowModal(true);
  }

  function handleSave() {
    if (!formName || !formEmail) return;
    const roleLabel = roleOptions.find(r => r.value === formRole)?.label || formRole;
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id
        ? { ...u, name: formName, email: formEmail, role: formRole, roleLabel, subjectName: formSubject || undefined }
        : u);
      setUsers(updated);
      saveUsers(updated);
      showToast('تم تحديث المستخدم بنجاح');
    } else {
      const newUser: UserRecord = {
        id: `user_${Date.now()}`, name: formName, email: formEmail,
        role: formRole, roleLabel, subjectName: formSubject || undefined, active: true,
      };
      const updated = [...users, newUser];
      setUsers(updated);
      saveUsers(updated);
      showToast('تم إضافة المستخدم بنجاح');
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    showToast('تم حذف المستخدم');
  }

  function handleToggleActive(id: string) {
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    setUsers(updated);
    saveUsers(updated);
    showToast('تم تحديث الحالة');
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'نظرة عامة', icon: Shield },
    { id: 'users' as Tab, label: 'المستخدمون', icon: Users },
    { id: 'visits' as Tab, label: 'الزيارات', icon: FileText },
    { id: 'subjects' as Tab, label: 'المواد', icon: BookOpen },
    { id: 'settings' as Tab, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <DashboardLayout pageTitle="لوحة تحكم مسؤول النظام">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-5 py-3 rounded-2xl font-cairo font-bold text-sm text-white shadow-xl"
            style={{ background: 'linear-gradient(135deg, #2E7D5A, #4CAF50)' }}
          >
            <CheckCircle size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-8 text-white"
        style={{ background: 'linear-gradient(135deg, #6B1029, #8A1538, #A91D48)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4AF37, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4AF37, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-cairo text-3xl font-extrabold mb-1">لوحة تحكم مسؤول النظام</h2>
            <p className="font-tajawal text-sm opacity-80">إدارة كاملة للمنصة — المستخدمين والزيارات والمواد والإعدادات</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cairo" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
            {syncStatus === 'online' ? <Cloud size={16} /> : <CloudOff size={16} />}
            {syncStatus === 'online' ? 'متصل بالسحابة' : 'غير متصل'}
            {lastSyncTime && `· ${lastSyncTime}`}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-cairo font-bold text-sm transition-all whitespace-nowrap"
            style={activeTab === tab.id
              ? { background: 'var(--qatar-maroon)', color: 'white', boxShadow: '0 4px 15px rgba(138,21,56,0.3)' }
              : { background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--gray-200)' }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Users, label: 'إجمالي المستخدمين', value: users.length, color: '#8A1538' },
              { icon: CheckCircle, label: 'نشطين', value: activeCount, color: '#2E7D5A' },
              { icon: UserX, label: 'معطلين', value: inactiveCount, color: '#C62828' },
              { icon: FileText, label: 'الزيارات', value: visits.length, color: '#D4AF37' },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                    <kpi.icon size={20} style={{ color: kpi.color }} />
                  </div>
                </div>
                <p className="font-ibm text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{kpi.value}</p>
                <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-cairo font-bold text-lg mb-4">زيارات شهرياً</h3>
              <div className="space-y-3">
                {monthlyVisitData.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-tajawal text-xs w-14">{m.month}</span>
                    <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: 'var(--gray-100)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(m.visits / 30) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-lg"
                        style={{ background: 'linear-gradient(90deg, #8A1538, #D4AF37)' }}
                      />
                    </div>
                    <span className="font-ibm text-xs w-6">{m.visits}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-cairo font-bold text-lg mb-4">توزيع الأدوار</h3>
              <div className="space-y-3">
                {roleOptions.map(role => {
                  const count = users.filter(u => u.role === role.value).length;
                  return (
                    <div key={role.value} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--off-white)' }}>
                      <span className="font-tajawal text-sm">{role.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--gray-200)' }}>
                          <div className="h-full rounded-full" style={{ width: `${(count / users.length) * 100}%`, background: 'var(--qatar-maroon)' }} />
                        </div>
                        <span className="font-ibm font-bold text-sm">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ USERS TAB ═══ */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث..."
                className="input-field pr-9 w-full"
              />
            </div>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> مستخدم جديد
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--gray-200)', background: 'var(--off-white)' }}>
                    <th className="text-right font-cairo text-xs p-4">الاسم</th>
                    <th className="text-right font-cairo text-xs p-4">البريد</th>
                    <th className="text-right font-cairo text-xs p-4">الدور</th>
                    <th className="text-center font-cairo text-xs p-4">الحالة</th>
                    <th className="text-center font-cairo text-xs p-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--gray-100)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-cairo font-bold text-xs text-white" style={{ background: u.active ? 'var(--qatar-maroon)' : 'var(--gray-400)' }}>
                            {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="font-cairo font-semibold text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-ibm text-xs" dir="ltr">{u.email}</td>
                      <td className="p-4">
                        <span className="badge text-xs" style={{ background: `${u.role === 'manager' ? '#8A1538' : u.role === 'sysadmin' ? '#4A7FB5' : u.role === 'coordinator' ? '#D4AF37' : '#2E7D5A'}15`, color: u.role === 'manager' ? '#8A1538' : u.role === 'sysadmin' ? '#4A7FB5' : u.role === 'coordinator' ? '#D4AF37' : '#2E7D5A' }}>
                          {u.roleLabel}
                        </span>
                        {u.subjectName && <span className="block font-tajawal text-[10px] mt-1" style={{ color: 'var(--gray-500)' }}>{u.subjectName}</span>}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleToggleActive(u.id)} className="px-3 py-1 rounded-full text-xs font-cairo font-bold transition-colors" style={{ background: u.active ? 'var(--success-light)' : 'var(--error-light)', color: u.active ? 'var(--success)' : 'var(--error)' }}>
                          {u.active ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="تعديل"><Edit2 size={14} style={{ color: 'var(--qatar-maroon)' }} /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="حذف"><Trash2 size={14} style={{ color: 'var(--error)' }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ VISITS TAB ═══ */}
      {activeTab === 'visits' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--gray-100)' }}>
              <h3 className="font-cairo font-bold text-lg">جميع الزيارات</h3>
              <span className="font-ibm text-sm" style={{ color: 'var(--text-secondary)' }}>{visits.length} زيارة</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--gray-200)', background: 'var(--off-white)' }}>
                    <th className="text-right font-cairo text-xs p-4">المعلم</th>
                    <th className="text-right font-cairo text-xs p-4">الزائر</th>
                    <th className="text-right font-cairo text-xs p-4">المادة</th>
                    <th className="text-right font-cairo text-xs p-4">الصف</th>
                    <th className="text-right font-cairo text-xs p-4">التاريخ</th>
                    <th className="text-center font-cairo text-xs p-4">المجموع</th>
                    <th className="text-center font-cairo text-xs p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map(v => (
                    <tr key={v.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--gray-100)' }}>
                      <td className="p-4 font-cairo font-semibold text-sm">{v.teacherName}</td>
                      <td className="p-4 font-tajawal text-sm">{v.visitorName}</td>
                      <td className="p-4 font-tajawal text-xs">{v.subjectName}</td>
                      <td className="p-4 font-ibm text-xs">{v.className}</td>
                      <td className="p-4 font-ibm text-xs">{v.visitDate}</td>
                      <td className="p-4 text-center">
                        <span className="font-ibm font-bold text-sm" style={{ color: Number(v.scoreTotal) >= 4 ? 'var(--success)' : Number(v.scoreTotal) >= 3 ? 'var(--warning)' : 'var(--error)' }}>
                          {Number(v.scoreTotal).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><Eye size={14} style={{ color: 'var(--gray-500)' }} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ SUBJECTS TAB ═══ */}
      {activeTab === 'subjects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h4 className="font-cairo font-bold text-sm">{s.name}</h4>
                  <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>{s.teachers.length} معلم · منسق: {s.coordinatorName}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--qatar-maroon-light)' }}>
                  <BookOpen size={18} style={{ color: 'var(--qatar-maroon)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ SETTINGS TAB ═══ */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {/* Cloud sync */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {syncStatus === 'online' ? <Cloud size={24} style={{ color: 'var(--success)' }} /> : <CloudOff size={24} style={{ color: 'var(--error)' }} />}
                <div>
                  <h3 className="font-cairo font-bold text-sm">مزامنة السحابة</h3>
                  <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>{syncStatus === 'online' ? 'متصل' : 'غير متصل'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={pushToCloud} className="flex-1 py-2 rounded-xl font-cairo font-bold text-sm btn-primary text-xs justify-center">
                  <RefreshCw size={14} /> رفع البيانات
                </button>
                <button onClick={pullFromCloud} className="flex-1 py-2 rounded-xl font-cairo font-bold text-sm btn-outline text-xs justify-center">
                  <RefreshCw size={14} /> سحب البيانات
                </button>
              </div>
            </div>

            {/* Export */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Download size={24} style={{ color: 'var(--qatar-maroon)' }} />
                <div>
                  <h3 className="font-cairo font-bold text-sm">تصدير البيانات</h3>
                  <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>حفظ نسخة احتياطية</p>
                </div>
              </div>
              <button onClick={() => { const json = exportData(); const blob = new Blob([json], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `ertiqa-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); }} className="w-full py-2 rounded-xl font-cairo font-bold text-sm btn-primary text-xs justify-center">
                <Download size={14} /> تصدير JSON
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ ADD/EDIT MODAL ═══ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-cairo text-xl font-extrabold">{editingUser ? 'تعديل مستخدم' : 'مستخدم جديد'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-cairo font-semibold text-sm mb-2">الاسم الكامل</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="input-field w-full" placeholder="محمد أحمد" />
                </div>
                <div>
                  <label className="block font-cairo font-semibold text-sm mb-2">البريد الإلكتروني</label>
                  <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input-field w-full" dir="ltr" placeholder="email@education.qa" />
                </div>
                <div>
                  <label className="block font-cairo font-semibold text-sm mb-2">الدور الوظيفي</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value)} className="input-field w-full">
                    {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                {formRole === 'coordinator' && (
                  <div>
                    <label className="block font-cairo font-semibold text-sm mb-2">المادة</label>
                    <select value={formSubject} onChange={e => setFormSubject(e.target.value)} className="input-field w-full">
                      <option value="">اختر المادة</option>
                      {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={handleSave} className="btn-primary w-full justify-center mt-4">
                  <CheckCircle size={18} /> {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
