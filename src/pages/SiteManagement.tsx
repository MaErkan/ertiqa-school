import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Plus, Trash2, Edit2, Save, X, Search,
  KeyRound, UserPlus, AlertTriangle, CheckCircle,
  Download, Archive, BookOpen, Calendar, Filter, School
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════
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

interface Criterion {
  id: string;
  label: string;
  active: boolean;
}

interface ArchivedYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  visitsCount: number;
  status: 'active' | 'archived';
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SiteManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'criteria' | 'years'>('users');
  const [toast, setToast] = useState<string | null>(null);

  // ── Users ──
  const [users, setUsers] = useState<UserRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_users') || '[]'); }
    catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);

  // ── Criteria ──
  const [criteria, setCriteria] = useState<Criterion[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_criteria') || '[]'); }
    catch {
      return [
        { id: 'scoreObjectives', label: 'الأهداف معروضة وواضحة', active: true },
        { id: 'scoreStudentEngagement', label: 'الطلبة متفاعلون', active: true },
        { id: 'scoreDiscipline', label: 'مدى الانضباط والنظام داخل الصف', active: true },
        { id: 'scoreTeacherEngagement', label: 'المعلم متفاعل مع الطلاب', active: true },
        { id: 'scoreEnvironment', label: 'يوفر المعلم بيئة صفية آمنة ومنظمة ومحفزة', active: true },
      ];
    }
  });
  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);

  // ── Archive Years ──
  const [years, setYears] = useState<ArchivedYear[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_years') || '[]'); }
    catch {
      return [
        { id: 'year-2025-2026', name: 'العام الدراسي 2025-2026', startDate: '2025-09-01', endDate: '2026-06-30', visitsCount: 156, status: 'archived' },
        { id: 'year-2026-2027', name: 'العام الدراسي 2026-2027', startDate: '2026-09-01', endDate: '2027-06-30', visitsCount: 89, status: 'active' },
      ];
    }
  });

  // ── Form states ──
  const [formData, setFormData] = useState<Partial<UserRecord>>({
    name: '', email: '', role: 'coordinator', subjectName: '', active: true, password: 'admin123'
  });
  const [passwordData, setPasswordData] = useState({ new: '', confirm: '' });
  const [criterionForm, setCriterionForm] = useState({ label: '' });

  // ═══════════════════════════════════════════════════════════════
  // PERSIST
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => { localStorage.setItem('ertiqa_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('ertiqa_criteria', JSON.stringify(criteria)); }, [criteria]);
  useEffect(() => { localStorage.setItem('ertiqa_years', JSON.stringify(years)); }, [years]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ═══════════════════════════════════════════════════════════════
  // USERS CRUD
  // ═══════════════════════════════════════════════════════════════
  const handleAddUser = () => {
    if (!formData.name || !formData.email) { showToast('املء الاسم والبريد'); return; }
    const roleLabel = roleOptions.find(r => r.value === formData.role)?.label || '';
    const newUser: UserRecord = {
      id: `user_${Date.now()}`, name: formData.name, email: formData.email,
      role: formData.role || 'coordinator', roleLabel,
      subjectName: formData.role === 'coordinator' ? formData.subjectName : undefined,
      active: true, password: formData.password || 'admin123',
    };
    setUsers([newUser, ...users]);
    setShowAddForm(false);
    setFormData({ name: '', email: '', role: 'coordinator', subjectName: '', active: true, password: 'admin123' });
    showToast(`تم إضافة ${newUser.name}`);
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    const roleLabel = roleOptions.find(r => r.value === editingUser.role)?.label || '';
    setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, roleLabel } : u));
    setEditingUser(null);
    showToast('تم التحديث');
  };

  const handleDeleteUser = (id: string) => { setUsers(users.filter(u => u.id !== id)); setShowDeleteConfirm(null); showToast('تم الحذف'); };
  const handleChangePassword = (userId: string) => {
    if (passwordData.new !== passwordData.confirm) { showToast('كلمة المرور غير متطابقة'); return; }
    setUsers(users.map(u => u.id === userId ? { ...u, password: passwordData.new } : u));
    setShowPasswordModal(null); setPasswordData({ new: '', confirm: '' });
    showToast('تم تغيير كلمة المرور');
  };
  const toggleActive = (id: string) => setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));

  const filteredUsers = users.filter(u =>
    u.name.includes(searchQuery) || u.email.includes(searchQuery) || u.roleLabel.includes(searchQuery)
  );

  // ═══════════════════════════════════════════════════════════════
  // CRITERIA CRUD
  // ═══════════════════════════════════════════════════════════════
  const handleAddCriterion = () => {
    if (!criterionForm.label.trim()) { showToast('أدخل نص البند'); return; }
    const newCriterion: Criterion = {
      id: `score_${Date.now()}`, label: criterionForm.label.trim(), active: true
    };
    setCriteria([...criteria, newCriterion]);
    setCriterionForm({ label: '' }); setShowAddCriterion(false);
    showToast('تم إضافة البند');
  };

  const handleEditCriterion = () => {
    if (!editingCriterion || !editingCriterion.label.trim()) return;
    setCriteria(criteria.map(c => c.id === editingCriterion.id ? editingCriterion : c));
    setEditingCriterion(null);
    showToast('تم تعديل البند');
  };

  const handleDeleteCriterion = (id: string) => {
    if (criteria.length <= 2) { showToast('يجب أن يكون هناك بندان على الأقل'); return; }
    setCriteria(criteria.filter(c => c.id !== id));
    showToast('تم حذف البند');
  };

  const toggleCriterionActive = (id: string) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  // ═══════════════════════════════════════════════════════════════
  // YEARS CRUD
  // ═══════════════════════════════════════════════════════════════
  const handleToggleYearStatus = (id: string) => {
    setYears(years.map(y => y.id === id ? { ...y, status: y.status === 'active' ? 'archived' : 'active' } : y));
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <DashboardLayout pageTitle="إدارة الموقع">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#1B3A5C] text-white px-4 py-2 rounded-xl shadow-lg font-cairo text-sm flex items-center gap-2">
            <CheckCircle size={16} className="text-[#D4AF37]" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'users', label: 'المستخدمين', icon: Users, count: users.length },
          { key: 'criteria', label: 'بنود التقييم', icon: BookOpen, count: criteria.filter(c => c.active).length },
          { key: 'years', label: 'أرشيف السنوات', icon: Calendar, count: years.length },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-xl font-cairo font-bold text-sm flex items-center gap-2 transition-all ${activeTab === t.key ? 'bg-[#8A1538] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <t.icon size={16} /> {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* USERS TAB */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
            </div>
            <button onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2 hover:bg-[#6B1029] transition-all shadow-md">
              <UserPlus size={16} /> إضافة
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <h3 className="font-cairo font-bold text-base text-[#1B3A5C] mb-3">إضافة مستخدم</h3>
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
                      placeholder="كلمة المرور" type="text" className="px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddUser} className="px-4 py-2 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2"><Save size={14} /> حفظ</button>
                    <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center gap-2"><X size={14} /> إلغاء</button>
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
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">الحالة</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${!u.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-tajawal text-sm font-bold">{u.name}</td>
                      <td className="px-4 py-3 font-tajawal text-xs text-gray-500">{u.email}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg text-xs font-cairo font-bold" style={{ background: u.role === 'manager' ? '#8A1538' : '#D4AF37', color: 'white' }}>{u.roleLabel}</span></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleActive(u.id)} className={`w-10 h-5 rounded-full transition-all relative ${u.active ? 'bg-[#22C55E]' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${u.active ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setEditingUser({ ...u })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="تعديل"><Edit2 size={14} /></button>
                          <button onClick={() => setShowPasswordModal(u.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="كلمة السر"><KeyRound size={14} /></button>
                          <button onClick={() => setShowDeleteConfirm(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="حذف"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* CRITERIA TAB */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'criteria' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="font-cairo text-sm text-gray-500">بنود التقييم المعتمدة في زيارات الصف</p>
            <button onClick={() => setShowAddCriterion(true)}
              className="px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2 hover:bg-[#6B1029] transition-all shadow-md">
              <Plus size={16} /> إضافة بند
            </button>
          </div>

          <AnimatePresence>
            {showAddCriterion && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <h3 className="font-cairo font-bold text-base text-[#1B3A5C] mb-3">بند تقييم جديد</h3>
                  <input value={criterionForm.label} onChange={e => setCriterionForm({ label: e.target.value })}
                    placeholder="نص البند (مثال: الأهداف واضحة ومعلنة)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#8A1538]/30" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddCriterion} className="px-4 py-2 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2"><Save size={14} /> حفظ</button>
                    <button onClick={() => setShowAddCriterion(false)} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center gap-2"><X size={14} /> إلغاء</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" dir="rtl">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1B3A5C] to-[#122942] text-white">
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">#</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-right">البند</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">نشط</th>
                    <th className="px-4 py-3 font-cairo text-xs font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${!c.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-cairo font-bold text-sm">{i + 1}</td>
                      <td className="px-4 py-3 font-tajawal text-sm font-bold">{c.label}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleCriterionActive(c.id)} className={`w-10 h-5 rounded-full transition-all relative ${c.active ? 'bg-[#22C55E]' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${c.active ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setEditingCriterion({ ...c })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="تعديل"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteCriterion(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="حذف"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* YEARS TAB */}
      {/* ════════════════════════════════════════════════════════ */}
      {activeTab === 'years' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="font-cairo text-sm text-gray-500">أرشيف السنوات الدراسية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {years.map(y => (
              <div key={y.id} className={`bg-white rounded-2xl p-5 shadow-md border transition-all ${y.status === 'active' ? 'border-[#8A1538]/30' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${y.status === 'active' ? 'bg-[#8A1538]/10' : 'bg-gray-100'}`}>
                      <School size={24} className={y.status === 'active' ? 'text-[#8A1538]' : 'text-gray-400'} />
                    </div>
                    <div>
                      <h3 className="font-cairo font-bold text-base">{y.name}</h3>
                      <p className="font-tajawal text-xs text-gray-500">{y.startDate} إلى {y.endDate}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-cairo font-bold ${y.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {y.status === 'active' ? 'نشط' : 'مؤرشف'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Archive size={16} className="text-[#D4AF37]" />
                    <span className="font-tajawal text-sm"><strong>{y.visitsCount}</strong> زيارة</span>
                  </div>
                </div>

                <button onClick={() => handleToggleYearStatus(y.id)}
                  className={`w-full py-2 rounded-xl font-cairo font-bold text-sm transition-all ${y.status === 'active'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-[#8A1538] text-white hover:bg-[#6B1029]'
                  }`}>
                  {y.status === 'active' ? 'أرشفة السنة' : 'تفعيل السنة'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ════════════════════════════════════════════════════════ */}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-4">تعديل مستخدم</h3>
              <div className="space-y-3">
                <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" placeholder="الاسم" />
                <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" placeholder="البريد" />
                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm">
                  {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleEditUser} className="flex-1 px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center justify-center gap-2"><Save size={14} /> حفظ</button>
                <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center justify-center gap-2"><X size={14} /> إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-4 flex items-center gap-2"><KeyRound size={18} className="text-[#D4AF37]" /> تغيير كلمة المرور</h3>
              <div className="space-y-3">
                <input value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} type="text" placeholder="كلمة المرور الجديدة" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" />
                <input value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} type="text" placeholder="تأكيد" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleChangePassword(showPasswordModal)} className="flex-1 px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm"><Save size={14} /> حفظ</button>
                <button onClick={() => setShowPasswordModal(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm"><X size={14} /> إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
              <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-2">تأكيد الحذف</h3>
              <p className="font-tajawal text-sm text-gray-500 mb-4">هل أنت متأكد؟</p>
              <div className="flex gap-2">
                <button onClick={() => handleDeleteUser(showDeleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-cairo font-bold text-sm">نعم، حذف</button>
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm">إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Criterion Modal */}
      <AnimatePresence>
        {editingCriterion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-4">تعديل بند التقييم</h3>
              <input value={editingCriterion.label} onChange={e => setEditingCriterion({ ...editingCriterion, label: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-tajawal text-sm" />
              <div className="flex gap-2 mt-4">
                <button onClick={handleEditCriterion} className="flex-1 px-4 py-2.5 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center justify-center gap-2"><Save size={14} /> حفظ</button>
                <button onClick={() => setEditingCriterion(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-cairo font-bold text-sm flex items-center justify-center gap-2"><X size={14} /> إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
