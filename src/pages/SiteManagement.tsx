import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Plus, Trash2, Edit2, Save, X, Search,
  KeyRound, UserPlus, UserX, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Filter, Download
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  subjectName?: string;
  active: boolean;
  password?: string;
}

const roleOptions = [
  { value: 'manager', label: 'مدير المدرسة' },
  { value: 'academic_vp', label: 'النائب الأكاديمي' },
  { value: 'admin_vp', label: 'النائب الإداري' },
  { value: 'coordinator', label: 'منسق مادة' },
  { value: 'sysadmin', label: 'مسؤول النظام' },
];

const subjectOptions = [
  'التربية الإسلامية', 'اللغة العربية', 'اللغة الإنجليزية', 'الرياضيات',
  'الفيزياء', 'الكيمياء', 'الأحياء', 'الدراسات الاجتماعية',
  'تكنولوجيا المعلومات', 'التربية البدنية', 'التعليم الإلكتروني',
  'اللغة الفرنسية', 'اللغة الألمانية', 'اللغة اليابانية', 'المهارات الحياتية', 'فنون بصرية'
];

export default function SiteManagement() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'evaluations'>('users');
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<UserRecord>>({
    name: '', email: '', role: 'coordinator', subjectName: '', active: true, password: 'admin123'
  });
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('ertiqa_users');
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        // Default users
        const defaults: UserRecord[] = [
          { id: 'admin-1', name: 'يوسف إبراهيم يوسف جاسم الجاسم', email: 'y.al-jassim0101@education.qa', role: 'manager', roleLabel: 'مدير المدرسة', active: true },
          { id: 'admin-2', name: 'أحمد محمد رمضان محمد', email: 'a.mohamed2211@education.qa', role: 'academic_vp', roleLabel: 'النائب الأكاديمي', active: true },
          { id: 'admin-3', name: 'حمد هادي محمد الغفراني المري', email: 'h.almarri23103@education.qa', role: 'admin_vp', roleLabel: 'النائب الإداري', active: true },
          { id: 'coord-1', name: 'عبدالله الشافعي محمد نعسان السيد', email: 'a.alsayed0101@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'التربية الإسلامية', active: true },
          { id: 'coord-2', name: 'أحمد حسين عموش', email: 'a.amooush0503@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'اللغة العربية', active: true },
          { id: 'coord-3', name: 'محمد حامد عبدالفتاح محمد عبدالله', email: 'm.abdallah0108@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectName: 'اللغة الإنجليزية', active: true },
          { id: 'sys-1', name: 'الأستاذ يوسف الجاسم', email: 'sysadmin1@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام', active: true },
          { id: 'sys-2', name: 'الدكتور أحمد رمضان', email: 'sysadmin2@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام', active: true },
        ];
        setUsers(defaults);
        localStorage.setItem('ertiqa_users', JSON.stringify(defaults));
      }
    } catch { /* */ }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveUsers = (newUsers: UserRecord[]) => {
    setUsers(newUsers);
    localStorage.setItem('ertiqa_users', JSON.stringify(newUsers));
  };

  // Add user
  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      showToast('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const roleLabel = roleOptions.find(r => r.value === formData.role)?.label || '';
    const newUser: UserRecord = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role || 'coordinator',
      roleLabel,
      subjectName: formData.role === 'coordinator' ? formData.subjectName : undefined,
      active: true,
      password: formData.password || 'admin123',
    };
    saveUsers([newUser, ...users]);
    setShowAddForm(false);
    setFormData({ name: '', email: '', role: 'coordinator', subjectName: '', active: true, password: 'admin123' });
    showToast(`تم إضافة ${newUser.name} بنجاح`);
  };

  // Edit user
  const handleEditUser = () => {
    if (!editingUser) return;
    const roleLabel = roleOptions.find(r => r.value === editingUser.role)?.label || '';
    const updated = users.map(u => u.id === editingUser.id ? { ...editingUser, roleLabel } : u);
    saveUsers(updated);
    setEditingUser(null);
    showToast('تم تحديث البيانات بنجاح');
  };

  // Delete user
  const handleDeleteUser = (id: string) => {
    saveUsers(users.filter(u => u.id !== id));
    setShowDeleteConfirm(null);
    showToast('تم حذف المستخدم بنجاح');
  };

  // Change password
  const handleChangePassword = (userId: string) => {
    if (passwordData.new !== passwordData.confirm) {
      showToast('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (!passwordData.new || passwordData.new.length < 4) {
      showToast('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }
    const updated = users.map(u => u.id === userId ? { ...u, password: passwordData.new } : u);
    saveUsers(updated);
    setShowPasswordModal(null);
    setPasswordData({ old: '', new: '', confirm: '' });
    showToast('تم تغيير كلمة المرور بنجاح');
  };

  // Toggle active
  const toggleActive = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    saveUsers(updated);
  };

  const filteredUsers = users.filter(u =>
    u.name.includes(searchQuery) ||
    u.email.includes(searchQuery) ||
    u.roleLabel.includes(searchQuery) ||
    u.subjectName?.includes(searchQuery)
  );

  // ─── Evaluation Reports ───
  const [visits, setVisits] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_visits') || '[]'); }
    catch { return []; }
  });
  const [editingVisit, setEditingVisit] = useState<any | null>(null);

  const handleUpdateVisit = () => {
    if (!editingVisit) return;
    const updated = visits.map(v => v.id === editingVisit.id ? editingVisit : v);
    setVisits(updated);
    localStorage.setItem('ertiqa_visits', JSON.stringify(updated));
    setEditingVisit(null);
    showToast('تم تعديل التقرير بنجاح');
  };

  const handleDeleteVisit = (id: string) => {
    const updated = visits.filter(v => v.id !== id);
    setVisits(updated);
    localStorage.setItem('ertiqa_visits', JSON.stringify(updated));
    showToast('تم حذف التقرير بنجاح');
  };

  return (
    <DashboardLayout pageTitle="إدارة الموقع">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#1B3A5C] text-white px-4 py-2 rounded-xl shadow-lg font-cairo text-sm flex items-center gap-2">
            <CheckCircle size={16} className="text-[#D4AF37]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-cairo font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-[#8A1538] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <Users size={16} /> إدارة المستخدمين ({users.length})
        </button>
        <button onClick={() => setActiveTab('evaluations')}
          className={`px-4 py-2 rounded-xl font-cairo font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'evaluations' ? 'bg-[#8A1538] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <Shield size={16} /> إدارة التقارير ({visits.length})
        </button>
      </div>

      {/* ═══ Users Tab ═══ */}
      {activeTab === 'users' && (
        <div>
          {/* Search + Add */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث باسم، بريد، دور..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
            </div>
            <button onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2 hover:bg-[#6B1029] transition-all shadow-md">
              <UserPlus size={16} /> إضافة مستخدم
            </button>
            <button onClick={() => {
              const dataStr = JSON.stringify(users, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = `users-${new Date().toISOString().split('T')[0]}.json`; a.click();
            }} className="px-4 py-2.5 rounded-xl bg-[#1B3A5C] text-white font-cairo font-bold text-sm flex items-center gap-2 hover:bg-[#122942] transition-all shadow-md">
              <Download size={16} /> تصدير
            </button>
          </div>

          {/* Add User Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4">
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <h3 className="font-cairo font-bold text-base text-[#1B3A5C] mb-3">إضافة مستخدم جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="الاسم الكامل *" className="px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
                    <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="البريد الإلكتروني *" className="px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30">
                      {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    {formData.role === 'coordinator' && (
                      <select value={formData.subjectName} onChange={e => setFormData({ ...formData, subjectName: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30">
                        <option value="">اختر المادة</option>
                        {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    <input value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="كلمة المرور (افتراضي: admin123)" type="text"
                      className="px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddUser}
                      className="px-4 py-2 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2">
                      <Save size={14} /> حفظ
                    </button>
                    <button onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center gap-2">
                      <X size={14} /> إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" dir="rtl">
                <thead>
                  <tr className="bg-gradient-to-r from-[#8A1538] to-[#6B1029] text-white">
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">الاسم</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">البريد</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">الدور</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">المادة</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">الحالة</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${!u.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#8A1538]/10 flex items-center justify-center">
                            <span className="font-cairo font-bold text-xs text-[#8A1538]">{u.name.charAt(0)}</span>
                          </div>
                          <span className="font-tajawal text-sm font-bold">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-tajawal text-xs text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-xs font-cairo font-bold" style={{
                          background: u.role === 'manager' ? '#8A1538' : u.role === 'sysadmin' ? '#1B3A5C' : '#D4AF37',
                          color: 'white'
                        }}>{u.roleLabel}</span>
                      </td>
                      <td className="px-4 py-3 font-tajawal text-xs">{u.subjectName || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleActive(u.id)}
                          className={`w-10 h-5 rounded-full transition-all relative ${u.active ? 'bg-[#22C55E]' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${u.active ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setEditingUser({ ...u }); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-all" title="تعديل">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setShowPasswordModal(u.id)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-all" title="تغيير كلمة السر">
                            <KeyRound size={14} />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(u.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all" title="حذف">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center font-cairo text-gray-400 text-sm">لا يوجد مستخدمين</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Evaluations Tab ═══ */}
      {activeTab === 'evaluations' && (
        <div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" dir="rtl">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1B3A5C] to-[#122942] text-white">
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">الزائر</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">المعلم</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">المادة</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">الدرجة</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">التاريخ</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map(v => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3 font-tajawal text-sm font-bold">{v.visitorName}</td>
                      <td className="px-4 py-3 font-tajawal text-sm">{v.teacherName}</td>
                      <td className="px-4 py-3 font-tajawal text-xs">{v.subjectName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-cairo font-bold ${
                          v.scoreTotal >= 4 ? 'bg-green-100 text-green-700' :
                          v.scoreTotal >= 2.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>{v.scoreTotal}/5</span>
                      </td>
                      <td className="px-4 py-3 font-tajawal text-xs text-center text-gray-500">{v.visitDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setEditingVisit({ ...v })}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-all" title="تعديل">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteVisit(v.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all" title="حذف">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visits.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center font-cairo text-gray-400 text-sm">لا يوجد تقارير</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Edit User Modal ═══ */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-4">تعديل بيانات المستخدم</h3>
              <div className="space-y-3">
                <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" placeholder="الاسم" />
                <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" placeholder="البريد" />
                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm">
                  {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {editingUser.role === 'coordinator' && (
                  <select value={editingUser.subjectName || ''} onChange={e => setEditingUser({ ...editingUser, subjectName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm">
                    {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleEditUser} className="flex-1 px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center justify-center gap-2">
                  <Save size={14} /> حفظ
                </button>
                <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center justify-center gap-2">
                  <X size={14} /> إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Password Modal ═══ */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-4 flex items-center gap-2">
                <KeyRound size={18} className="text-[#D4AF37]" /> تغيير كلمة المرور
              </h3>
              <div className="space-y-3">
                <input value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                  type="text" placeholder="كلمة المرور الجديدة" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" />
                <input value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  type="text" placeholder="تأكيد كلمة المرور" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleChangePassword(showPasswordModal)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center justify-center gap-2">
                  <Save size={14} /> حفظ
                </button>
                <button onClick={() => { setShowPasswordModal(null); setPasswordData({ old: '', new: '', confirm: '' }); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center justify-center gap-2">
                  <X size={14} /> إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Delete Confirm ═══ */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
              <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-2">تأكيد الحذف</h3>
              <p className="font-tajawal text-sm text-gray-500 mb-4">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع.</p>
              <div className="flex gap-2">
                <button onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-cairo font-bold text-sm">
                  نعم، حذف
                </button>
                <button onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
