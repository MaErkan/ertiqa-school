import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Shield, ToggleRight, Trash2, Edit,
  FileCheck, UserCheck, Download, FileText, FileSpreadsheet,
  Printer, Cloud, CloudOff, Upload, CheckCircle, Smartphone
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { users, subjects, monthlyVisitData, subjectPerformanceData, visitDistributionData, type User } from '@/data/demoData';

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const [userList, setUserList] = useState<User[]>(users);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subjects' | 'export'>('overview');
  const { visits, lastSyncTime, syncStatus, cloudEnabled, exportData, importData, pushToCloud, pullFromCloud } = useCloudSync();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleUserStatus = (userId: string) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: u.role } : u));
  };

  const tabs = [
    { id: 'overview' as const, label: 'نظرة عامة', icon: FileCheck },
    { id: 'users' as const, label: 'المستخدمون', icon: Users },
    { id: 'subjects' as const, label: 'المواد والمعلمون', icon: BookOpen },
    { id: 'export' as const, label: 'التصدير', icon: Download },
  ];

  const totalTeachers = subjects.reduce((sum, s) => sum + s.teachers.length, 0);
  const activeUsers = userList.length;
  const totalVisits = visits.length;

  // KPI data for export
  const kpiData = [
    { label: 'المستخدمون', value: activeUsers },
    { label: 'المواد', value: subjects.length },
    { label: 'المعلمون', value: totalTeachers },
    { label: 'الزيارات', value: totalVisits },
    { label: 'المنسقون', value: subjects.length },
    { label: 'نسخ احتياطي', value: 'يومي' },
  ];

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير النظام - ارتقاء</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', sans-serif; padding: 40px; color: #2A2520; }
          .header { text-align: center; border-bottom: 3px solid #8A1538; padding-bottom: 20px; margin-bottom: 30px; }
          .header img { width: 60px; height: 60px; border-radius: 12px; margin-bottom: 10px; }
          .header h1 { font-size: 24px; color: #8A1538; }
          .header p { font-size: 14px; color: #5C5348; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
          .kpi-box { background: #FDF8F5; border: 1px solid #E6DCD4; border-radius: 12px; padding: 15px; text-align: center; }
          .kpi-box .value { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 28px; font-weight: 700; color: #8A1538; }
          .kpi-box .label { font-size: 12px; color: #5C5348; }
          .section { margin-bottom: 30px; }
          .section h2 { font-size: 18px; color: #8A1538; border-right: 4px solid #D4AF37; padding-right: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #F3EDE8; padding: 10px; text-align: right; font-weight: 600; }
          td { padding: 10px; border-bottom: 1px solid #E6DCD4; }
          tr:nth-child(even) { background: #FDF8F5; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; }
          .badge-maroon { background: rgba(138,21,56,0.1); color: #8A1538; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #8A7B6F; border-top: 1px solid #E6DCD4; padding-top: 20px; }
          .date { text-align: left; font-size: 11px; color: #8A7B6F; margin-bottom: 20px; }
          .chart-placeholder { background: #F5EDE8; border-radius: 12px; padding: 40px; text-align: center; color: #8A7B6F; font-size: 14px; margin-bottom: 20px; }
          .sync-info { background: #E8F5E9; border-radius: 8px; padding: 10px; font-size: 11px; color: #2E7D5A; margin-bottom: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-QA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>

        <div class="header">
          <img src="${window.location.origin}/assets/logo.jpg" alt="شعار ارتقاء" />
          <h1>نظام ارتقاء — تقرير شامل</h1>
          <p>مدرسة طارق بن زياد الثانوية للبنين</p>
        </div>

        <div class="sync-info">
          حالة المزامنة السحابية: ${syncStatus === 'online' ? 'متصل' : 'غير متصل'} · آخر تحديث: ${lastSyncTime} · إجمالي الزيارات: ${totalVisits}
        </div>

        <div class="section">
          <h2>المؤشرات الرئيسية</h2>
          <div class="kpi-grid">
            ${kpiData.map(k => `<div class="kpi-box"><div class="value">${k.value}</div><div class="label">${k.label}</div></div>`).join('')}
          </div>
        </div>

        <div class="section">
          <h2>المواد والمعلمين</h2>
          <table>
            <thead><tr><th>المادة</th><th>المنسق</th><th>عدد المعلمين</th><th>الزيارات</th></tr></thead>
            <tbody>
              ${subjects.map(s => {
                const vCount = visits.filter(v => v.subjectId === s.id).length;
                return `<tr><td><strong>${s.name}</strong></td><td>${s.coordinatorName}</td><td>${s.teachers.length}</td><td>${vCount}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>المستخدمون</h2>
          <table>
            <thead><tr><th>الاسم</th><th>الدور</th><th>المادة</th><th>البريد</th></tr></thead>
            <tbody>
              ${userList.map(u => `<tr><td><strong>${u.name}</strong></td><td><span class="badge badge-maroon">${u.roleLabel}</span></td><td>${u.subjectId ? subjects.find(s => s.id === u.subjectId)?.name || '—' : '—'}</td><td>${u.email}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>الزيارات المسجلة (${totalVisits})</h2>
          <table>
            <thead><tr><th>#</th><th>الزائر</th><th>المعلم</th><th>المادة</th><th>التاريخ</th><th>المتوسط</th></tr></thead>
            <tbody>
              ${visits.map((v, i) => `<tr><td>${i + 1}</td><td>${v.visitorName}</td><td>${v.teacherName}</td><td>${v.subjectName}</td><td>${v.visitDate}</td><td><strong>${v.averageScore.toFixed(1)}</strong></td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>أداء المواد</h2>
          <div class="chart-placeholder">[الرسم البياني: متوسط أداء المواد — يُعرض في النظام الإلكتروني]</div>
        </div>

        <div class="footer">
          <p style="color:#D4AF37; font-weight:700;">نرتقي معًا… لنصنع أثرًا في كل حصة</p>
          <p>© 2025 نظام ارتقاء — مدرسة طارق بن زياد الثانوية للبنين</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const exportExcel = () => {
    // Build CSV with all data
    const BOM = '\uFEFF';
    let csv = BOM;

    // Header
    csv += 'تقرير نظام ارتقاء — مدرسة طارق بن زياد الثانوية للبنين\n';
    csv += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-QA')}\n\n`;

    // KPI Section
    csv += '═══ المؤشرات الرئيسية ═══\n';
    csv += 'المؤشر,القيمة\n';
    kpiData.forEach(k => { csv += `${k.label},${k.value}\n`; });
    csv += '\n';

    // Subjects Section
    csv += '═══ المواد والمعلمين ═══\n';
    csv += 'المادة,المنسق,عدد المعلمين,عدد الزيارات,متوسط الأداء\n';
    subjects.forEach(s => {
      const sVisits = visits.filter(v => v.subjectId === s.id);
      const avg = sVisits.length > 0 ? (sVisits.reduce((sum, v) => sum + v.averageScore, 0) / sVisits.length).toFixed(2) : '—';
      csv += `"${s.name}","${s.coordinatorName}",${s.teachers.length},${sVisits.length},${avg}\n`;
    });
    csv += '\n';

    // Teachers Section
    csv += '═══ المعلمون ═══\n';
    csv += 'اسم المعلم,المادة,الزيارات,متوسط الأداء\n';
    subjects.forEach(s => {
      s.teachers.forEach(t => {
        const tVisits = visits.filter(v => v.teacherId === t.id);
        const avg = tVisits.length > 0 ? (tVisits.reduce((sum, v) => sum + v.averageScore, 0) / tVisits.length).toFixed(2) : '—';
        csv += `"${t.name}","${s.name}",${tVisits.length},${avg}\n`;
      });
    });
    csv += '\n';

    // Visits Section
    csv += '═══ تفاصيل الزيارات ═══\n';
    csv += '#,الزائر,المعلم,المادة,المنسق,الصف,التاريخ,المدة,الأهداف,الطلاب,الانضباط,التفاعل,البيئة,المتوسط,الملاحظات\n';
    visits.forEach((v, i) => {
      csv += `${i + 1},"${v.visitorName}","${v.teacherName}","${v.subjectName}","${v.coordinatorName}","${v.className}",${v.visitDate},${v.visitDuration},${v.scoreObjectives},${v.scoreStudents},${v.scoreDiscipline},${v.scoreTeacherInteraction},${v.scoreSafeEnvironment},${v.averageScore.toFixed(1)},"${v.keyObservations}"\n`;
    });
    csv += '\n';

    // Monthly Stats
    csv += '═══ الإحصائيات الشهرية ═══\n';
    csv += 'الشهر,عدد الزيارات,متوسط الأداء\n';
    monthlyVisitData.forEach(m => { csv += `${m.month},${m.visits},${m.avgScore}\n`; });
    csv += '\n';

    // Subject Performance
    csv += '═══ أداء المواد ═══\n';
    csv += 'المادة,متوسط الأداء,عدد الزيارات\n';
    subjectPerformanceData.forEach(s => { csv += `"${s.subject}",${s.avgScore},${s.visits}\n`; });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_ارتقاء_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout pageTitle="لوحة مسؤول النظام">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-cairo font-semibold text-sm transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'var(--qatar-maroon)' : 'white',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(138,21,56,0.2)' : 'none',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═════════ OVERVIEW ═════════ */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards — NO visits for sysadmin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { icon: Users, label: 'المستخدمون', value: String(activeUsers), sub: 'مستخدم نشط', color: '#8A1538' },
              { icon: BookOpen, label: 'المواد', value: String(subjects.length), sub: 'مادة دراسية', color: '#2E7D5A' },
              { icon: UserCheck, label: 'المعلمون', value: String(totalTeachers), sub: 'معلم', color: '#4A7FB5' },
              { icon: Cloud, label: 'المزامنة', value: syncStatus === 'online' ? 'نشطة' : 'متوقفة', sub: `آخر تحديث: ${lastSyncTime}`, color: '#C9892E' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="kpi-card relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-[3px]" style={{ background: card.color }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.color}15` }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <div className="font-ibm text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
                <div className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
                <div className="font-tajawal text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{card.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-cairo font-bold text-lg mb-4">حالة النظام</h3>
              <div className="space-y-4">
                {[
                  { label: 'قاعدة البيانات', status: 'متصلة', color: 'var(--success)' },
                  { label: 'المزامنة السحابية', status: syncStatus === 'online' ? 'نشطة' : 'غير نشطة', color: syncStatus === 'online' ? 'var(--success)' : 'var(--error)' },
                  { label: 'إشعارات FCM', status: 'يعمل', color: 'var(--success)' },
                  { label: 'النسخ الاحتياطي', status: 'آخر نسخة: اليوم', color: 'var(--info)' },
                  { label: 'عدد الزيارات المسجلة', status: `${totalVisits} زيارة`, color: 'var(--info)' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">{item.label}</span>
                    <span className="font-cairo font-bold text-xs px-3 py-1 rounded-full" style={{ background: `${item.color}15`, color: item.color }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-cairo font-bold text-lg mb-4">توزيع الأدوار</h3>
              <div className="space-y-3">
                {[
                  { role: 'مدير المدرسة', count: 1, color: '#8A1538' },
                  { role: 'النائب الأكاديمي', count: 1, color: '#D4AF37' },
                  { role: 'النائب الإداري', count: 1, color: '#4A7FB5' },
                  { role: 'منسقو المواد', count: 11, color: '#2E7D5A' },
                  { role: 'مسؤول النظام', count: 1, color: '#6B1029' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-tajawal text-sm w-32">{r.role}</span>
                    <div className="flex-1 progress-bar" style={{ height: 8 }}>
                      <div className="fill transition-all" style={{ width: `${(r.count / 11) * 100}%`, background: r.color }} />
                    </div>
                    <span className="font-ibm text-sm font-bold w-8">{r.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ═════════ USERS ═════════ */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--gray-100)' }}>
            <h3 className="font-cairo font-bold text-lg">المستخدمون</h3>
            <button className="btn-primary text-sm py-2 px-4">
              <Users size={16} />
              إضافة مستخدم
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الدور</th>
                  <th>المادة</th>
                  <th>البريد الإلكتروني</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id}>
                    <td className="font-cairo font-semibold text-sm">{u.name}</td>
                    <td><span className="badge badge-maroon text-xs">{u.roleLabel}</span></td>
                    <td className="font-tajawal text-sm">
                      {u.subjectId ? subjects.find(s => s.id === u.subjectId)?.name || '—' : '—'}
                    </td>
                    <td className="font-ibm text-sm" dir="ltr">{u.email}</td>
                    <td>
                      <button onClick={() => toggleUserStatus(u.id)}>
                        <ToggleRight size={20} style={{ color: 'var(--success)' }} />
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-50 transition-colors">
                          <Edit size={16} style={{ color: 'var(--info)' }} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={16} style={{ color: 'var(--error)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ═════════ SUBJECTS ═════════ */}
      {activeTab === 'subjects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-cairo font-bold text-lg" style={{ color: 'var(--qatar-maroon)' }}>{subject.name}</h4>
                  <p className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>
                    منسق: {subject.coordinatorName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={18} style={{ color: 'var(--qatar-gold)' }} />
                  <span className="font-cairo font-bold text-sm">{subject.teachers.length} معلم</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {subject.teachers.map(t => (
                  <span key={t.id} className="px-3 py-1.5 rounded-lg font-tajawal text-xs" style={{ background: 'var(--gray-100)', color: 'var(--text-secondary)' }}>
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ═════════ EXPORT REPORTS ═════════ */}
      {activeTab === 'export' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Cloud Sync Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: syncStatus === 'online' ? 'var(--success-light)' : syncStatus === 'syncing' ? 'var(--warning-light)' : 'var(--error-light)' }}>
                <Cloud size={20} style={{ color: syncStatus === 'online' ? 'var(--success)' : syncStatus === 'syncing' ? 'var(--warning)' : 'var(--error)' }} />
              </div>
              <div>
                <h3 className="font-cairo font-bold text-lg">المزامنة السحابية</h3>
                <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {syncStatus === 'online' ? 'متصل · آخر تحديث: ' + lastSyncTime : syncStatus === 'syncing' ? 'جاري المزامنة...' : 'غير متصل · يستخدم التخزين المحلي'}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--off-white)', border: '1px solid var(--gray-200)' }}>
              <p className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--qatar-maroon)' }}>كيف تعمل المزامنة:</strong> عند إرسال زيارة من أي جهاز، تظهر فوراً عند المنسق المسؤول عن المادة والنائب الأكاديمي والمدير. استخدم تصدير/استيراد JSON لنقل البيانات بين الأجهزة المختلفة.
              </p>
            </div>
          </div>

          {/* Cross-Device Sync: Export/Import */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Export */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-cairo font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                <Smartphone size={18} className="inline ml-2" />
                تصدير البيانات للجهاز الآخر
              </h3>
              <p className="font-tajawal text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                صدّر جميع الزيارات والإشعارات كملف JSON وانقله للجهاز الآخر
              </p>
              <button
                onClick={() => {
                  const data = exportData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ertiqa_sync_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90 w-full justify-center"
                style={{ background: 'var(--qatar-maroon)' }}
              >
                <Download size={18} />
                تحميل ملف المزامنة (JSON)
              </button>
            </div>

            {/* Import */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-cairo font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                <Upload size={18} className="inline ml-2" />
                استيراد بيانات من جهاز آخر
              </h3>
              <p className="font-tajawal text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                استورد ملف JSON من جهاز آخر لمزامنة الزيارات
              </p>
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const text = ev.target?.result as string;
                      const ok = importData(text);
                      setImportStatus(ok ? 'success' : 'error');
                      setTimeout(() => setImportStatus('idle'), 3000);
                    };
                    reader.readAsText(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm transition-all w-full justify-center"
                  style={{ background: 'var(--gray-100)', color: 'var(--text-primary)', border: '2px dashed var(--gray-300)' }}
                >
                  <Upload size={18} />
                  اختيار ملف JSON
                </button>
                {importStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg font-tajawal text-sm" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <CheckCircle size={16} />
                    تم استيراد البيانات بنجاح! المزامنة مكتملة.
                  </div>
                )}
                {importStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg font-tajawal text-sm" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                    <FileText size={16} />
                    فشل الاستيراد. تأكد من صحة الملف.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ☁️ Supabase Cloud Push/Pull */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cloudEnabled ? 'var(--success-light)' : 'var(--warning-light)' }}>
                {cloudEnabled ? <Cloud size={20} style={{ color: 'var(--success)' }} /> : <CloudOff size={20} style={{ color: 'var(--warning)' }} />}
              </div>
              <div>
                <h3 className="font-cairo font-bold text-lg">مزامنة Supabase السحابية</h3>
                <p className="font-tajawal text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {cloudEnabled ? '☁️ متصل بالسحابة — البيانات تتزامن تلقائياً بين جميع الأجهزة' : '⚠️ غير مفعّل — أضف credentials في الملف'}
                </p>
              </div>
            </div>

            {!cloudEnabled && (
              <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--off-white)', border: '1px solid var(--gray-200)' }}>
                <p className="font-cairo font-bold text-sm mb-2" style={{ color: 'var(--qatar-maroon)' }}>طريقة تفعيل المزامنة السحابية:</p>
                <ol className="font-tajawal text-sm space-y-1 mr-4" style={{ color: 'var(--text-secondary)' }}>
                  <li>1. ادخل على <strong>supabase.com</strong> وسجّل حساب مجاني</li>
                  <li>2. أنشئ مشروع جديد → اذهب إلى <strong>Settings → API</strong></li>
                  <li>3. انسخ <strong>Project URL</strong> و <strong>anon public</strong> key</li>
                  <li>4. افتح الملف: <code className="bg-gray-100 px-1 rounded text-xs">src/lib/supabase.ts</code></li>
                  <li>5. ألصق القيم في المتغيرات <code className="bg-gray-100 px-1 rounded text-xs">SUPABASE_URL</code> و <code className="bg-gray-100 px-1 rounded text-xs">SUPABASE_ANON_KEY</code></li>
                  <li>6. أنشئ جدول <code className="bg-gray-100 px-1 rounded text-xs">visits</code> بنفس أسماء الأعمدة الموجودة في الكود</li>
                  <li>7. أعد بناء المشروع: <code className="bg-gray-100 px-1 rounded text-xs">npm run build</code></li>
                </ol>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => { await pushToCloud(); }}
                disabled={!cloudEnabled}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: '#4A7FB5' }}
              >
                <Upload size={18} />
                رفع للسحابة ☁️
              </button>
              <button
                onClick={async () => { await pullFromCloud(); }}
                disabled={!cloudEnabled}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: '#2E7D5A' }}
              >
                <Download size={18} />
                سحب من السحابة ☁️
              </button>
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>تصدير التقارير PDF / Excel</h3>
            <p className="font-tajawal text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              تصدير التقرير الشامل بالأرقام والإحصائيات والرسوم البيانية
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handlePrintPDF} className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: '#B54A4A' }}>
                <FileText size={18} />
                تصدير PDF (كامل)
              </button>
              <button onClick={exportExcel} className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: '#2E7D5A' }}>
                <FileSpreadsheet size={18} />
                تصدير Excel (CSV)
              </button>
              <button onClick={() => navigate('/reports')} className="flex items-center gap-2 px-6 py-3 rounded-xl font-cairo font-semibold text-sm transition-all" style={{ background: 'var(--gray-100)', color: 'var(--text-primary)' }}>
                <Printer size={18} />
                مركز التقارير
              </button>
            </div>
          </div>

          {/* Preview Charts */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-cairo font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>تطور الزيارات الشهرية</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyVisitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
                    <Line type="monotone" dataKey="visits" stroke="#8A1538" strokeWidth={3} dot={{ fill: '#8A1538', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-cairo font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>متوسط أداء المواد</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={subjectPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10, fontFamily: 'Tajawal' }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
                    <Bar dataKey="avgScore" fill="#D4AF37" radius={[8, 8, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-cairo font-bold text-sm mb-4">توزيع الزيارات حسب الدور</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={visitDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                      {visitDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontFamily: 'Tajawal', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-cairo font-bold text-sm mb-4">بيانات التقرير</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">إجمالي المستخدمين</span>
                    <span className="font-ibm font-bold">{activeUsers}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">إجمالي المعلمين</span>
                    <span className="font-ibm font-bold">{totalTeachers}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">إجمالي الزيارات</span>
                    <span className="font-ibm font-bold">{totalVisits}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">عدد المواد</span>
                    <span className="font-ibm font-bold">{subjects.length}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-tajawal text-sm">آخر مزامنة</span>
                    <span className="font-ibm text-sm">{lastSyncTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
