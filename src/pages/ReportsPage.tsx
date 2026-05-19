import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, Printer, Eye, BarChart3, TrendingUp, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { subjects, teachers, monthlyVisitData, visitDistributionData } from '@/data/demoData';

const COLORS = ['#8A1538', '#D4AF37', '#4A7FB5', '#2E7D5A', '#C9892E', '#6B4C9A', '#E67E22'];

export default function ReportsPage() {
  const { visits } = useCloudSync();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'visits' | 'teachers' | 'subjects'>('visits');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<typeof visits[0] | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Coordinator sees only their subject's visits
  const baseVisits = useMemo(() => {
    if (!user || user.role !== 'coordinator' || !user.subjectId) return visits;
    return visits.filter(v => v.subjectId === user.subjectId);
  }, [visits, user]);

  const filteredVisits = baseVisits.filter(v => {
    if (dateFrom && v.visitDate < dateFrom) return false;
    if (dateTo && v.visitDate > dateTo) return false;
    if (subjectFilter && String(v.subjectId) !== subjectFilter) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'var(--success)';
    if (score >= 3.5) return 'var(--warning)';
    return 'var(--error)';
  };

  const printReport = () => {
    if (reportRef.current) {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html dir="rtl"><head><title>تقرير نظام ارتقاء</title><style>body{font-family:'Cairo',sans-serif;padding:40px;} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#8A1538;color:#fff} .header{text-align:center;margin-bottom:30px} .logo{width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:10px} h1{color:#8A1538} .section{margin-bottom:30px} .kpi{display:flex;gap:20px;margin-bottom:20px} .kpi-item{background:#f8f8f8;padding:15px;border-radius:10px;text-align:center;flex:1} .kpi-value{font-size:24px;font-weight:bold;color:#8A1538}</style></head><body>${reportRef.current.innerHTML}</body></html>`);
        w.document.close();
        w.print();
      }
    }
  };

  const exportCSV = () => {
    const BOM = '\uFEFF';
    let csv = BOM;
    csv += 'تقرير نظام ارتقاء\n';
    csv += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-QA')}\n\n`;
    csv += '═══ الزيارات ═══\n';
    csv += 'الزائر,المعلم,المادة,الصف,التاريخ,الوقت,الأهداف,الطلبة,الانضباط,المعلم,البيئة,المجموع\n';
    filteredVisits.forEach(v => {
      csv += `${v.visitorName},${v.teacherName},${v.subjectName},${v.className},${v.visitDate},${v.visitTime},${v.scoreObjectives || 0},${v.scoreStudentEngagement || 0},${v.scoreDiscipline || 0},${v.scoreTeacherEngagement || 0},${v.scoreEnvironment || 0},${v.scoreTotal}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير-ارتقاء-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Coordinator restrictions applied to data
  const visibleSubjects = user?.role === 'coordinator' && user.subjectId
    ? subjects.filter(s => s.id === user.subjectId)
    : subjects;
  const visibleTeachers = user?.role === 'coordinator' && user.subjectId
    ? teachers.filter(t => t.subjectId === user.subjectId)
    : teachers;

  const kpi = {
    totalVisits: filteredVisits.length,
    avgScore: filteredVisits.length > 0 ? (filteredVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / filteredVisits.length).toFixed(1) : '0',
    totalTeachers: visibleTeachers.length,
    totalSubjects: visibleSubjects.length,
  };

  return (
    <DashboardLayout pageTitle="تقارير الزيارات الصفية الداعمة">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div><h2 className="font-cairo text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>تقارير الزيارات الصفية الداعمة</h2></div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={printReport} className="btn-outline text-sm flex items-center gap-1"><Printer size={14} /> طباعة</button>
            <button onClick={exportCSV} className="btn-outline text-sm flex items-center gap-1"><FileSpreadsheet size={14} /> تصدير CSV</button>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: FileText, label: 'إجمالي الزيارات', value: String(kpi.totalVisits), color: '#8A1538' },
            { icon: TrendingUp, label: 'متوسط الأداء', value: String(kpi.avgScore), color: '#C9892E' },
            { icon: BarChart3, label: 'المعلمين', value: String(kpi.totalTeachers), color: '#4A7FB5' },
            { icon: FileText, label: 'المواد', value: String(kpi.totalSubjects), color: '#2E7D5A' },
          ].map((card, i) => (
            <div key={i} className="kpi-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${card.color}15` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <p className="font-ibm font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
              <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-cairo font-bold text-sm mb-4">زيارات شهرياً</h3>
            <ResponsiveContainer width="100%" height={250}><LineChart data={monthlyVisitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" /><XAxis dataKey="month" /><YAxis />
              <Tooltip /><Line type="monotone" dataKey="visits" stroke="#8A1538" strokeWidth={2} dot={{ fill: '#D4AF37' }} />
            </LineChart></ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-cairo font-bold text-sm mb-4">توزيع الزيارات حسب نوع الزائر</h3>
            <ResponsiveContainer width="100%" height={250}><PieChart>
              <Pie data={visitDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {visitDistributionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /><Legend />
            </PieChart></ResponsiveContainer>
          </motion.div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex gap-1" style={{ background: 'var(--gray-100)', borderRadius: 14, padding: 4 }}>
            {[{ id: 'visits' as const, label: 'الزيارات' }, { id: 'teachers' as const, label: 'المعلمين' }, { id: 'subjects' as const, label: 'المواد' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-xl font-cairo font-bold text-sm transition-all"
                style={activeTab === tab.id ? { background: 'white', color: 'var(--qatar-maroon)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : { color: 'var(--gray-500)' }}>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Coordinator restriction notice */}
          {user?.role === 'coordinator' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#8A1538]/5 border border-[#8A1538]/20">
              <Lock size={14} className="text-[#8A1538]" />
              <span className="font-cairo text-xs text-[#8A1538]">عرض تقارير <strong>{user.subjectName}</strong> فقط</span>
            </div>
          )}
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field text-sm py-2" dir="ltr" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field text-sm py-2" dir="ltr" />
            {user?.role !== 'coordinator' && (
              <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input-field text-sm py-2">
                <option value="">كل المواد</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div ref={reportRef}>
              <div className="hidden print:block p-8 text-center">
                <img src="/assets/logo.jpg" alt="شعار" className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                <h1 className="font-cairo text-2xl font-extrabold" style={{ color: 'var(--qatar-maroon)' }}>تقرير نظام ارتقاء</h1>
                <p className="font-tajawal">مدرسة طارق بن زياد الثانوية للبنين</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b" style={{ borderColor: 'var(--gray-200)' }}>
                    <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المعلم</th>
                    <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>الزائر</th>
                    <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المادة</th>
                    <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>الصف</th>
                    <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>التاريخ</th>
                    <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المجموع</th>
                    <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}></th>
                  </tr></thead>
                  <tbody>{filteredVisits.map((visit, i) => (
                    <motion.tr key={visit.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--gray-100)' }}>
                      <td className="p-3 font-cairo font-semibold text-sm">{visit.teacherName}</td>
                      <td className="p-3 font-tajawal text-sm">{visit.visitorName}</td>
                      <td className="p-3 font-tajawal text-xs">{visit.subjectName}</td>
                      <td className="p-3 font-ibm text-xs">{visit.className}</td>
                      <td className="p-3 font-ibm text-xs">{visit.visitDate}</td>
                      <td className="p-3 text-center">
                        <span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(Number(visit.scoreTotal)) }}>
                          {Number(visit.scoreTotal).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => setSelectedVisit(visit)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <Eye size={16} style={{ color: 'var(--gray-500)' }} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b" style={{ borderColor: 'var(--gray-200)' }}>
                  <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المعلم</th>
                  <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المادة</th>
                  <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>الزيارات</th>
                  <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المتوسط</th>
                </tr></thead>
                <tbody>{teachers.map((teacher, i) => {
                  const tVisits = visits.filter(v => v.teacherId === teacher.id);
                  const avg = tVisits.length > 0 ? (tVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / tVisits.length).toFixed(1) : '—';
                  return (
                    <motion.tr key={teacher.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--gray-100)' }}>
                      <td className="p-3 font-cairo font-semibold text-sm">{teacher.name}</td>
                      <td className="p-3 font-tajawal text-xs">{subjects.find(s => s.id === teacher.subjectId)?.name}</td>
                      <td className="p-3 font-ibm text-sm text-center">{tVisits.length}</td>
                      <td className="p-3 text-center"><span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(Number(avg)) }}>{avg}</span></td>
                    </motion.tr>
                  );
                })}</tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b" style={{ borderColor: 'var(--gray-200)' }}>
                  <th className="text-right font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المادة</th>
                  <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المعلمين</th>
                  <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>الزيارات</th>
                  <th className="text-center font-cairo text-xs p-3" style={{ color: 'var(--gray-500)' }}>المتوسط</th>
                </tr></thead>
                <tbody>{visibleSubjects.map((subject, i) => {
                  const sVisits = baseVisits.filter(v => v.subjectId === subject.id);
                  const sTeachers = teachers.filter(t => t.subjectId === subject.id);
                  const avg = sVisits.length > 0 ? (sVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / sVisits.length).toFixed(1) : '—';
                  return (
                    <motion.tr key={subject.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--gray-100)' }}>
                      <td className="p-3 font-cairo font-semibold text-sm">{subject.name}</td>
                      <td className="p-3 font-ibm text-sm text-center">{sTeachers.length}</td>
                      <td className="p-3 font-ibm text-sm text-center">{sVisits.length}</td>
                      <td className="p-3 text-center"><span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(Number(avg)) }}>{avg}</span></td>
                    </motion.tr>
                  );
                })}</tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Visit Detail Modal */}
        {selectedVisit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVisit(null)}>
            <div className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto" dir="rtl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-cairo text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>تفاصيل الزيارة</h3>
                <button onClick={() => setSelectedVisit(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors font-ibm text-lg">&times;</button>
              </div>
              <div className="space-y-3 font-tajawal text-sm mb-6">
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>المعلم:</span><span className="font-bold">{selectedVisit.teacherName}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>الزائر:</span><span className="font-bold">{selectedVisit.visitorName}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>المادة:</span><span className="font-bold">{selectedVisit.subjectName}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>الصف:</span><span className="font-bold">{selectedVisit.className}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>التاريخ:</span><span className="font-bold">{selectedVisit.visitDate}</span></div>
              </div>
              <div className="space-y-2 mb-6">
                {[{ label: 'الأهداف معروضة وواضحة', score: Number(selectedVisit.scoreObjectives) || 0 },
                  { label: 'الطلبة متفاعلون', score: Number(selectedVisit.scoreStudentEngagement) || 0 },
                  { label: 'المعلم متفاعل مع الطلاب', score: Number(selectedVisit.scoreTeacherEngagement) || 0 },
                  { label: 'بيئة صفية آمنة ومحفزة', score: Number(selectedVisit.scoreEnvironment) || 0 },
                  { label: 'الانضباط', score: Number(selectedVisit.scoreDiscipline) }].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">{item.label}</span>
                    <span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(item.score) }}>{item.score} / 5</span>
                  </div>
                ))}
              </div>
              <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--off-white)' }}>
                <p className="font-ibm font-bold text-2xl" style={{ color: 'var(--qatar-maroon)' }}>{Number(selectedVisit.scoreTotal).toFixed(1)} <span className="text-base" style={{ color: 'var(--gray-500)' }}>/ 5</span></p>
              </div>
              {selectedVisit.notes && (
                <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--off-white)' }}>
                  <p className="font-cairo font-bold text-xs mb-2" style={{ color: 'var(--gray-500)' }}>الملاحظات</p>
                  <p className="font-tajawal text-sm">{selectedVisit.notes}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
