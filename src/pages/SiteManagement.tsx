import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Edit3, Trash2, Crown, Plus,
  BookOpen, GraduationCap, Save, X, Search,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { subjects, type Subject, type Teacher } from '@/data/demoData';

/* ─── Types ─── */
interface SiteUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'academic_vp' | 'admin_vp' | 'coordinator' | 'sysadmin';
  roleLabel: string;
  subjectId?: string;
}

/* ─── Helpers ─── */
function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

const roleOptions: { value: SiteUser['role']; label: string }[] = [
  { value: 'manager', label: 'مدير المدرسة' },
  { value: 'academic_vp', label: 'النائب الأكاديمي' },
  { value: 'admin_vp', label: 'النائب الإداري' },
  { value: 'coordinator', label: 'منسق المادة' },
  { value: 'sysadmin', label: 'مسؤول النظام' },
];

/* ─── Modal ─── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="font-cairo font-bold text-lg" style={{ color: 'var(--qatar-maroon)' }}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} style={{ color: 'var(--gray-500)' }} /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/*  SITE MANAGEMENT PAGE                        */
/* ════════════════════════════════════════════ */
export default function SiteManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'subjects' | 'teachers' | 'coordinators'>('users');

  /* ─── Users State ─── */
  const [users, setUsers] = useState<SiteUser[]>([
    { id: 'u1', name: 'يوسف إبراهيم يوسف جاسم الجاسم', email: 'y.al-jassim0101@education.qa', role: 'manager', roleLabel: 'مدير المدرسة' },
    { id: 'u2', name: 'أحمد محمد رمضان محمد', email: 'a.mohamed2211@education.qa', role: 'academic_vp', roleLabel: 'النائب الأكاديمي' },
    { id: 'u3', name: 'حمد هادي محمد الغفراني المري', email: 'h.almarri23103@education.qa', role: 'admin_vp', roleLabel: 'النائب الإداري' },
    { id: 'u4', name: 'عبدالله الشافعي محمد نعسان السيد', email: 'a.alsayed0101@education.qa', role: 'coordinator', roleLabel: 'منسق التربية الإسلامية', subjectId: 's1' },
    { id: 'u5', name: 'أحمد حسين عموش', email: 'a.amooush0503@education.qa', role: 'coordinator', roleLabel: 'منسق اللغة العربية', subjectId: 's2' },
    { id: 'u6', name: 'محمد حامد عبدالفتاح محمد عبدالله', email: 'm.abdallah0108@education.qa', role: 'coordinator', roleLabel: 'منسق اللغة الإنجليزية', subjectId: 's3' },
    { id: 'u7', name: 'شريف عبدالمنعم عبدالحي البرلسي', email: 'sh.alberlasy@education.qa', role: 'coordinator', roleLabel: 'منسق الرياضيات', subjectId: 's4' },
    { id: 'u8', name: 'أشرف السيد جودة السيد محمد', email: 'a.gouda@education.qa', role: 'coordinator', roleLabel: 'منسق الفيزياء', subjectId: 's5' },
    { id: 'u9', name: 'حسام محمد أبو النصر محمد الزياتي', email: 'h.zayaty@education.qa', role: 'coordinator', roleLabel: 'منسق الكيمياء', subjectId: 's6' },
    { id: 'u10', name: 'أحمد عبدالحميد أحمد عبدالمحسن', email: 'a.abdelmohsen@education.qa', role: 'coordinator', roleLabel: 'منسق الأحياء', subjectId: 's7' },
    { id: 'u11', name: 'علاء معوض إبراهيم حمودة', email: 'a.hamouda@education.qa', role: 'coordinator', roleLabel: 'منسق الدراسات الاجتماعية', subjectId: 's8' },
    { id: 'u12', name: 'محمد فتحي إبراهيم فريج', email: 'm.fareej@education.qa', role: 'coordinator', roleLabel: 'منسق تكنولوجيا المعلومات', subjectId: 's9' },
    { id: 'u13', name: 'محمد جواد علي أكبر محمد جواد لاري', email: 'm.lari@education.qa', role: 'coordinator', roleLabel: 'منسق التربية البدنية', subjectId: 's10' },
    { id: 'u14', name: 'هيثم محمد محمد أحمد الشامي', email: 'h.alshami@education.qa', role: 'coordinator', roleLabel: 'منسق التعليم الإلكتروني', subjectId: 's11' },
    { id: 'u15', name: 'الأستاذ يوسف الجاسم', email: 'sysadmin1@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام' },
    { id: 'u16', name: 'الدكتور أحمد رمضان', email: 'sysadmin2@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام' },
  ]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userModal, setUserModal] = useState<{ open: boolean; editing: SiteUser | null }>({ open: false, editing: null });
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'coordinator' as SiteUser['role'], subjectId: '' });

  /* ─── Subjects State ─── */
  const [subjectsList, setSubjectsList] = useState<Subject[]>(JSON.parse(JSON.stringify(subjects)));
  const [subjectModal, setSubjectModal] = useState<{ open: boolean; editing: Subject | null }>({ open: false, editing: null });
  const [subjectForm, setSubjectForm] = useState({ name: '', coordinatorName: '' });

  /* ─── Teachers State ─── */
  const [teacherModal, setTeacherModal] = useState<{ open: boolean; subjectId: string; editing: Teacher | null }>({ open: false, subjectId: '', editing: null });
  const [teacherForm, setTeacherForm] = useState({ name: '' });

  /* ─── Delete Confirm ─── */
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  /* ═══════ STATS ═══════ */
  const stats = [
    { label: 'المستخدمون', value: users.length, icon: Users, color: '#8A1538' },
    { label: 'المواد', value: subjectsList.length, icon: BookOpen, color: '#2E7D5A' },
    { label: 'المعلمون', value: subjectsList.reduce((s, sub) => s + sub.teachers.length, 0), icon: GraduationCap, color: '#4A7FB5' },
    { label: 'المنسقون', value: subjectsList.length, icon: Crown, color: '#D4AF37' },
  ];

  /* ═══════ USERS CRUD ═══════ */
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (userSearch && !u.name.includes(userSearch) && !u.email.includes(userSearch)) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, userSearch, roleFilter]);

  const handleSaveUser = () => {
    const roleLabel = roleOptions.find(r => r.value === userForm.role)?.label || '';
    if (userModal.editing) {
      setUsers(prev => prev.map(u => u.id === userModal.editing!.id ? { ...u, ...userForm, roleLabel } : u));
    } else {
      const newUser: SiteUser = { id: genId('u'), ...userForm, roleLabel };
      setUsers(prev => [...prev, newUser]);
    }
    setUserModal({ open: false, editing: null });
    setUserForm({ name: '', email: '', role: 'coordinator', subjectId: '' });
  };

  const handleDeleteUser = (id: string) => { setUsers(prev => prev.filter(u => u.id !== id)); setDeleteConfirm(null); };

  /* ═══════ SUBJECTS CRUD ═══════ */
  const handleSaveSubject = () => {
    if (subjectModal.editing) {
      setSubjectsList(prev => prev.map(s => s.id === subjectModal.editing!.id ? { ...s, ...subjectForm } : s));
    } else {
      const newSubject: Subject = { id: genId('s'), coordinatorId: '', teachers: [], ...subjectForm };
      setSubjectsList(prev => [...prev, newSubject]);
    }
    setSubjectModal({ open: false, editing: null });
    setSubjectForm({ name: '', coordinatorName: '' });
  };

  const handleDeleteSubject = (id: string) => { setSubjectsList(prev => prev.filter(s => s.id !== id)); setDeleteConfirm(null); };

  /* ═══════ TEACHERS CRUD ═══════ */
  const handleSaveTeacher = () => {
    const { subjectId, editing } = teacherModal;
    if (editing) {
      setSubjectsList(prev => prev.map(s => s.id !== subjectId ? s : { ...s, teachers: s.teachers.map(t => t.id === editing.id ? { ...t, name: teacherForm.name } : t) }));
    } else {
      const newTeacher: Teacher = { id: genId('t'), name: teacherForm.name, subjectId };
      setSubjectsList(prev => prev.map(s => s.id === subjectId ? { ...s, teachers: [...s.teachers, newTeacher] } : s));
    }
    setTeacherModal({ open: false, subjectId: '', editing: null });
    setTeacherForm({ name: '' });
  };

  const handleDeleteTeacher = (subjectId: string, teacherId: string) => {
    setSubjectsList(prev => prev.map(s => s.id !== subjectId ? s : { ...s, teachers: s.teachers.filter(t => t.id !== teacherId) }));
    setDeleteConfirm(null);
  };

  const tabs = [
    { id: 'users' as const, label: 'المستخدمون', icon: Users },
    { id: 'subjects' as const, label: 'المواد والمعلمون', icon: BookOpen },
    { id: 'teachers' as const, label: 'المعلمون', icon: GraduationCap },
    { id: 'coordinators' as const, label: 'المنسقون', icon: Crown },
  ];

  return (
    <DashboardLayout pageTitle="إدارة الموقع">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <span className="font-ibm font-bold text-2xl block" style={{ color: s.color }}>{s.value}</span>
              <span className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-cairo font-semibold text-sm transition-all whitespace-nowrap"
            style={{ background: activeTab === tab.id ? 'var(--qatar-maroon)' : 'white', color: activeTab === tab.id ? 'white' : 'var(--text-secondary)', boxShadow: activeTab === tab.id ? '0 2px 12px rgba(138,21,56,0.2)' : 'none' }}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═════════ USERS TAB ═════════ */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={() => { setUserForm({ name: '', email: '', role: 'coordinator', subjectId: '' }); setUserModal({ open: true, editing: null }); }}
              className="btn-primary flex items-center gap-2 text-sm"><UserPlus size={16} /> إضافة مستخدم</button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-sm flex-1 min-w-[200px]">
              <Search size={16} style={{ color: 'var(--gray-500)' }} />
              <input type="text" placeholder="بحث بالاسم أو البريد..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="bg-transparent border-none outline-none font-tajawal text-sm flex-1" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-auto">
              <option value="">كل الأدوار</option>
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الدور</th><th>المادة</th><th>إجراءات</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td className="font-cairo font-bold text-sm">{u.name}</td>
                      <td className="font-ibm text-sm" dir="ltr">{u.email}</td>
                      <td><span className="badge badge-maroon text-xs">{u.roleLabel}</span></td>
                      <td className="font-tajawal text-sm">{u.subjectId ? subjectsList.find(s => s.id === u.subjectId)?.name || '—' : '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => { setUserForm({ name: u.name, email: u.email, role: u.role, subjectId: u.subjectId || '' }); setUserModal({ open: true, editing: u }); }}
                            className="p-2 rounded-lg hover:bg-blue-50 transition-colors" title="تعديل"><Edit3 size={16} style={{ color: 'var(--info)' }} /></button>
                          <button onClick={() => setDeleteConfirm({ type: 'user', id: u.id, name: u.name })}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="حذف"><Trash2 size={16} style={{ color: 'var(--error)' }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 font-tajawal" style={{ color: 'var(--gray-500)' }}>لا يوجد مستخدمون مطابقون</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═════════ SUBJECTS + TEACHERS TAB ═════════ */}
      {activeTab === 'subjects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <button onClick={() => { setSubjectForm({ name: '', coordinatorName: '' }); setSubjectModal({ open: true, editing: null }); }}
            className="btn-primary flex items-center gap-2 text-sm mb-4"><Plus size={16} /> إضافة مادة جديدة</button>

          {subjectsList.map((subject, idx) => (
            <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(138,21,56,0.03) 0%, rgba(212,175,55,0.03) 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(138,21,56,0.1)' }}>
                    <BookOpen size={20} style={{ color: 'var(--qatar-maroon)' }} />
                  </div>
                  <div>
                    <h4 className="font-cairo font-bold text-base" style={{ color: 'var(--qatar-maroon)' }}>{subject.name}</h4>
                    <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>المنسق: {subject.coordinatorName} · {subject.teachers.length} معلم</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSubjectForm({ name: subject.name, coordinatorName: subject.coordinatorName }); setSubjectModal({ open: true, editing: subject }); }}
                    className="p-2 rounded-lg hover:bg-white/80" title="تعديل"><Edit3 size={16} style={{ color: 'var(--info)' }} /></button>
                  <button onClick={() => setDeleteConfirm({ type: 'subject', id: subject.id, name: subject.name })}
                    className="p-2 rounded-lg hover:bg-white/80" title="حذف"><Trash2 size={16} style={{ color: 'var(--error)' }} /></button>
                  <button onClick={() => { setTeacherForm({ name: '' }); setTeacherModal({ open: true, subjectId: subject.id, editing: null }); }}
                    className="p-2 rounded-lg hover:bg-white/80" title="إضافة معلم"><UserPlus size={16} style={{ color: 'var(--success)' }} /></button>
                </div>
              </div>
              {subject.teachers.length > 0 && (
                <div className="px-5 pb-4">
                  <table className="w-full">
                    <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <th className="text-right py-2 font-cairo text-xs" style={{ color: 'var(--gray-500)' }}>#</th>
                      <th className="text-right py-2 font-cairo text-xs" style={{ color: 'var(--gray-500)' }}>المعلم</th>
                      <th className="text-right py-2 font-cairo text-xs" style={{ color: 'var(--gray-500)' }}>إجراءات</th>
                    </tr></thead>
                    <tbody>
                      {subject.teachers.map((teacher, i) => (
                        <tr key={teacher.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td className="py-2 font-ibm text-xs" style={{ color: 'var(--gray-500)' }}>{i + 1}</td>
                          <td className="py-2 font-cairo font-semibold text-sm">{teacher.name}</td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              <button onClick={() => { setTeacherForm({ name: teacher.name }); setTeacherModal({ open: true, subjectId: subject.id, editing: teacher }); }}
                                className="p-1.5 rounded hover:bg-gray-100"><Edit3 size={14} style={{ color: 'var(--info)' }} /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'teacher', id: `${subject.id}|${teacher.id}`, name: teacher.name })}
                                className="p-1.5 rounded hover:bg-gray-100"><Trash2 size={14} style={{ color: 'var(--error)' }} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ═════════ ALL TEACHERS TAB ═════════ */}
      {activeTab === 'teachers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>#</th><th>المعلم</th><th>المادة</th><th>المنسق</th><th>إجراءات</th></tr></thead>
                <tbody>
                  {subjectsList.flatMap((s, si) => s.teachers.map((t, ti) => (
                    <tr key={t.id}>
                      <td className="font-ibm text-xs">{si + 1}-{ti + 1}</td>
                      <td className="font-cairo font-semibold text-sm">{t.name}</td>
                      <td><span className="badge badge-maroon text-[10px]">{s.name}</span></td>
                      <td className="font-tajawal text-xs">{s.coordinatorName}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => { setTeacherForm({ name: t.name }); setTeacherModal({ open: true, subjectId: s.id, editing: t }); }}
                            className="p-2 rounded-lg hover:bg-blue-50"><Edit3 size={14} style={{ color: 'var(--info)' }} /></button>
                          <button onClick={() => setDeleteConfirm({ type: 'teacher', id: `${s.id}|${t.id}`, name: t.name })}
                            className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={14} style={{ color: 'var(--error)' }} /></button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═════════ COORDINATORS TAB ═════════ */}
      {activeTab === 'coordinators' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>#</th><th>المنسق</th><th>المادة</th><th>عدد المعلمين</th><th>إجراءات</th></tr></thead>
                <tbody>
                  {subjectsList.map((s, i) => (
                    <tr key={s.id}>
                      <td className="font-ibm text-xs">{i + 1}</td>
                      <td className="font-cairo font-bold text-sm">{s.coordinatorName}</td>
                      <td><span className="badge badge-gold text-xs">{s.name}</span></td>
                      <td className="font-ibm text-sm">{s.teachers.length}</td>
                      <td>
                        <button onClick={() => { setSubjectForm({ name: s.name, coordinatorName: s.coordinatorName }); setSubjectModal({ open: true, editing: s }); }}
                          className="p-2 rounded-lg hover:bg-blue-50"><Edit3 size={16} style={{ color: 'var(--info)' }} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═════════ USER MODAL ═════════ */}
      <Modal open={userModal.open} onClose={() => setUserModal({ open: false, editing: null })} title={userModal.editing ? 'تعديل مستخدم' : 'إضافة مستخدم'}>
        <div className="space-y-4">
          <div>
            <label className="block font-cairo font-semibold text-sm mb-1">الاسم الكامل</label>
            <input type="text" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} placeholder="محمد أحمد" className="input-field" />
          </div>
          <div>
            <label className="block font-cairo font-semibold text-sm mb-1">البريد الإلكتروني</label>
            <input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="email@education.qa" className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="block font-cairo font-semibold text-sm mb-1">الدور</label>
            <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value as SiteUser['role'] }))} className="input-field">
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {userForm.role === 'coordinator' && (
            <div>
              <label className="block font-cairo font-semibold text-sm mb-1">المادة</label>
              <select value={userForm.subjectId} onChange={e => setUserForm(p => ({ ...p, subjectId: e.target.value }))} className="input-field">
                <option value="">اختر المادة</option>
                {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveUser} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={16} /> حفظ</button>
            <button onClick={() => setUserModal({ open: false, editing: null })} className="btn-outline flex-1">إلغاء</button>
          </div>
        </div>
      </Modal>

      {/* ═════════ SUBJECT MODAL ═════════ */}
      <Modal open={subjectModal.open} onClose={() => setSubjectModal({ open: false, editing: null })} title={subjectModal.editing ? 'تعديل مادة' : 'إضافة مادة'}>
        <div className="space-y-4">
          <div>
            <label className="block font-cairo font-semibold text-sm mb-1">اسم المادة</label>
            <input type="text" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} placeholder="اللغة العربية" className="input-field" />
          </div>
          <div>
            <label className="block font-cairo font-semibold text-sm mb-1">اسم المنسق</label>
            <input type="text" value={subjectForm.coordinatorName} onChange={e => setSubjectForm(p => ({ ...p, coordinatorName: e.target.value }))} placeholder="أحمد حسين عموش" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveSubject} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={16} /> حفظ</button>
            <button onClick={() => setSubjectModal({ open: false, editing: null })} className="btn-outline flex-1">إلغاء</button>
          </div>
        </div>
      </Modal>

      {/* ═════════ TEACHER MODAL ═════════ */}
      <Modal open={teacherModal.open} onClose={() => setTeacherModal({ open: false, subjectId: '', editing: null })} title={teacherModal.editing ? 'تعديل معلم' : 'إضافة معلم'}>
        <div className="space-y-4">
          <div>
            <label className="block font-cairo font-semibold text-sm mb-1">اسم المعلم</label>
            <input type="text" value={teacherForm.name} onChange={e => setTeacherForm(p => ({ ...p, name: e.target.value }))} placeholder="محمد أحمد" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveTeacher} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={16} /> حفظ</button>
            <button onClick={() => setTeacherModal({ open: false, subjectId: '', editing: null })} className="btn-outline flex-1">إلغاء</button>
          </div>
        </div>
      </Modal>

      {/* ═════════ DELETE CONFIRMATION ═════════ */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--error-light)' }}>
            <AlertTriangle size={28} style={{ color: 'var(--error)' }} />
          </div>
          <h4 className="font-cairo font-bold text-lg mb-2">هل أنت متأكد من الحذف؟</h4>
          <p className="font-tajawal text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            سيتم حذف <strong>{deleteConfirm?.name}</strong> نهائياً ولا يمكن استرجاعه.
          </p>
          <div className="flex gap-3">
            <button onClick={() => {
              if (!deleteConfirm) return;
              if (deleteConfirm.type === 'user') handleDeleteUser(deleteConfirm.id);
              else if (deleteConfirm.type === 'subject') handleDeleteSubject(deleteConfirm.id);
              else if (deleteConfirm.type === 'teacher') { const [sid, tid] = deleteConfirm.id.split('|'); handleDeleteTeacher(sid, tid); }
            }} className="flex-1 py-3 rounded-xl font-cairo font-bold text-white text-sm transition-all hover:opacity-90" style={{ background: 'var(--error)' }}>
              <Trash2 size={16} className="inline ml-1" /> نعم، احذف
            </button>
            <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 text-sm">إلغاء</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
