import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, FileSpreadsheet, Printer, Eye, Download,
  BarChart3, TrendingUp, Star
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { subjects, subjectPerformanceData, monthlyVisitData, visitDistributionData, type Visit } from '@/data/demoData';

export default function ReportsPage() {
  const { user } = useAuth();
  const { visits, syncStatus } = useCloudSync();
  const [activeTab, setActiveTab] = useState<'visits' | 'teachers' | 'subjects'>('visits');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const isSysadmin = user?.role === 'sysadmin';

  const filteredVisits = visits.filter(v => {
    if (dateFrom && v.visitDate < dateFrom) return false;
    if (dateTo && v.visitDate > dateTo) return false;
    if (subjectFilter && v.subjectId !== subjectFilter) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'var(--success)';
    if (score >= 3.5) return 'var(--warning)';
    return 'var(--error)';
  };

  // ─── PDF EXPORT with Charts & Stats ───
  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stats = {
      totalVisits: filteredVisits.length,
      avgScore: filteredVisits.length > 0 ? (filteredVisits.reduce((s, v) => s + v.averageScore, 0) / filteredVisits.length).toFixed(2) : '0',
      totalTeachers: subjects.reduce((sum, s) => sum + s.teachers.length, 0),
      totalSubjects: subjects.length,
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ارتقاء</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Cairo', sans-serif; padding: 30px; color: #2A2520; }
          .header { text-align: center; border-bottom: 3px solid #8A1538; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { font-size: 22px; color: #8A1538; margin-bottom: 5px; }
          .header p { font-size: 13px; color: #5C5348; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px; }
          .stat-box { background: #FDF8F5; border: 1px solid #E6DCD4; border-radius: 10px; padding: 12px; text-align: center; }
          .stat-box .num { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 24px; font-weight: 700; color: #8A1538; }
          .stat-box .lbl { font-size: 11px; color: #5C5348; }
          .section { margin-bottom: 25px; }
          .section h2 { font-size: 16px; color: #8A1538; border-right: 4px solid #D4AF37; padding-right: 10px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
          th { background: #F3EDE8; padding: 8px; text-align: right; font-weight: 600; border-bottom: 2px solid #E6DCD4; }
          td { padding: 8px; border-bottom: 1px solid #E6DCD4; }
          tr:nth-child(even) { background: #FDF8F5; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; background: rgba(138,21,56,0.1); color: #8A1538; }
          .score { font-weight: 700; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #8A7B6F; border-top: 1px solid #E6DCD4; padding-top: 15px; }
          .date { text-align: left; font-size: 10px; color: #8A7B6F; margin-bottom: 15px; }
          .chart-note { background: #F5EDE8; border-radius: 8px; padding: 15px; text-align: center; color: #8A7B6F; font-size: 12px; margin: 10px 0; }
          .star { color: #D4AF37; font-size: 14px; }
          .star-empty { color: #E6DCD4; font-size: 14px; }
          @media print { body { padding: 15px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="date">${new Date().toLocaleDateString('ar-QA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>

        <div class="header">
          <h1>نظام ارتقاء — تقرير ${activeTab === 'visits' ? 'الزيارات' : activeTab === 'teachers' ? 'المعلمين' : 'المواد'}</h1>
          <p>مدرسة طارق بن زياد الثانوية للبنين · ${filteredVisits.length} زيارة</p>
        </div>

        <!-- Stats -->
        <div class="stats">
          <div class="stat-box"><div class="num">${stats.totalVisits}</div><div class="lbl">الزيارات</div></div>
          <div class="stat-box"><div class="num">${stats.avgScore}</div><div class="lbl">متوسط الأداء</div></div>
          <div class="stat-box"><div class="num">${stats.totalTeachers}</div><div class="lbl">المعلمون</div></div>
          <div class="stat-box"><div class="num">${stats.totalSubjects}</div><div class="lbl">المواد</div></div>
        </div>

        <!-- Subject Performance Summary -->
        <div class="section">
          <h2>ملخص أداء المواد</h2>
          <table>
            <thead><tr><th>المادة</th><th>عدد الزيارات</th><th>متوسط الأداء</th><th>التقييم</th></tr></thead>
            <tbody>
              ${subjects.map(s => {
                const sVisits = visits.filter(v => v.subjectId === s.id);
                const avg = sVisits.length > 0 ? (sVisits.reduce((sum, v) => sum + v.averageScore, 0) / sVisits.length).toFixed(1) : '—';
                const rating = avg !== '—' && parseFloat(avg) >= 4.5 ? 'ممتاز' : avg !== '—' && parseFloat(avg) >= 3.5 ? 'جيد' : 'يحتاج تحسين';
                return `<tr><td><strong>${s.name}</strong></td><td>${sVisits.length}</td><td class="score">${avg}</td><td><span class="badge">${rating}</span></td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Monthly Stats -->
        <div class="section">
          <h2>الإحصائيات الشهرية</h2>
          <table>
            <thead><tr><th>الشهر</th><th>عدد الزيارات</th><th>متوسط الأداء</th></tr></thead>
            <tbody>
              ${monthlyVisitData.map(m => `<tr><td>${m.month}</td><td>${m.visits}</td><td class="score">${m.avgScore}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="chart-note">[الرسم البياني: تطور الزيارات والأداء — يُعرض في النظام الإلكتروني]</div>
        </div>

        <!-- Detailed Visits -->
        <div class="section">
          <h2>تفاصيل الزيارات (${filteredVisits.length})</h2>
          <table>
            <thead>
              <tr><th>#</th><th>الزائر</th><th>المعلم</th><th>المادة</th><th>التاريخ</th><th>الأهداف</th><th>الطلاب</th><th>الانضباط</th><th>التفاعل</th><th>البيئة</th><th>المتوسط</th></tr>
            </thead>
            <tbody>
              ${filteredVisits.map((v, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${v.visitorName}</td>
                  <td>${v.teacherName}</td>
                  <td><span class="badge">${v.subjectName}</span></td>
                  <td>${v.visitDate}</td>
                  <td>${v.scoreObjectives}</td>
                  <td>${v.scoreStudents}</td>
                  <td>${v.scoreDiscipline}</td>
                  <td>${v.scoreTeacherInteraction}</td>
                  <td>${v.scoreSafeEnvironment}</td>
                  <td class="score">${v.averageScore.toFixed(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p style="color:#D4AF37; font-weight:700;">نرتقي معًا… لنصنع أثرًا في كل حصة</p>
          <p>© 2025 نظام ارتقاء · مزامنة: ${syncStatus === 'online' ? 'نشطة' : 'غير نشطة'}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // ─── EXCEL EXPORT ───
  const exportExcel = () => {
    const BOM = '\uFEFF';
    let csv = BOM;

    csv += 'تقرير نظام ارتقاء — مدرسة طارق بن زياد الثانوية للبنين\n';
    csv += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-QA')}\n`;
    csv += `المستخدم: ${user?.name || ''} · الدور: ${user?.roleLabel || ''}\n\n`;

    // Section 1: KPIs
    csv += '═══ المؤشرات الرئيسية ═══\n';
    const totalVisits = filteredVisits.length;
    const avgScore = totalVisits > 0 ? (filteredVisits.reduce((s, v) => s + v.averageScore, 0) / totalVisits).toFixed(2) : '0';
    csv += `إجمالي الزيارات,${totalVisits}\n`;
    csv += `متوسط الأداء,${avgScore}\n`;
    csv += `عدد المعلمين,${subjects.reduce((sum, s) => sum + s.teachers.length, 0)}\n`;
    csv += `عدد المواد,${subjects.length}\n`;
    csv += `عدد المنسقين,${subjects.length}\n\n`;

    // Section 2: Subject Performance
    csv += '═══ أداء المواد ═══\n';
    csv += 'المادة,المنسق,عدد المعلمين,عدد الزيارات,متوسط الأداء\n';
    subjects.forEach(s => {
      const sVisits = visits.filter(v => v.subjectId === s.id);
      const avg = sVisits.length > 0 ? (sVisits.reduce((sum, v) => sum + v.averageScore, 0) / sVisits.length).toFixed(2) : '—';
      csv += `"${s.name}","${s.coordinatorName}",${s.teachers.length},${sVisits.length},${avg}\n`;
    });
    csv += '\n';

    // Section 3: Monthly Data
    csv += '═══ الإحصائيات الشهرية ═══\n';
    csv += 'الشهر,عدد الزيارات,متوسط الأداء\n';
    monthlyVisitData.forEach(m => { csv += `${m.month},${m.visits},${m.avgScore}\n`; });
    csv += '\n';

    // Section 4: Visit Distribution
    csv += '═══ توزيع الزيارات حسب الدور ═══\n';
    csv += 'الدور,عدد الزيارات,النسبة\n';
    visitDistributionData.forEach(d => { csv += `"${d.name}",${d.value},${((d.value / 100) * 100).toFixed(0)}%\n`; });
    csv += '\n';

    // Section 5: Detailed Visits
    csv += '═══ تفاصيل الزيارات ═══\n';
    csv += '#,الزائر,صفة الزائر,المعلم,المادة,المنسق,الصف,التاريخ,الوقت,المدة,الأهداف,الطلاب,الانضباط,التفاعل,البيئة,المتوسط,الملاحظات\n';
    filteredVisits.forEach((v, i) => {
      csv += `${i + 1},"${v.visitorName}","${v.visitorRole}","${v.teacherName}","${v.subjectName}","${v.coordinatorName}","${v.className}",${v.visitDate},${v.visitTime},${v.visitDuration},${v.scoreObjectives},${v.scoreStudents},${v.scoreDiscipline},${v.scoreTeacherInteraction},${v.scoreSafeEnvironment},${v.averageScore.toFixed(1)},"${v.keyObservations}"\n`;
    });
    csv += '\n';

    // Section 6: Teachers Summary
    csv += '═══ ملخص المعلمين ═══\n';
    csv += 'اسم المعلم,المادة,الزيارات,متوسط الأداء\n';
    subjects.forEach(s => {
      s.teachers.forEach(t => {
        const tVisits = visits.filter(v => v.teacherId === t.id);
        const avg = tVisits.length > 0 ? (tVisits.reduce((sum, v) => sum + v.averageScore, 0) / tVisits.length).toFixed(2) : '—';
        csv += `"${t.name}","${s.name}",${tVisits.length},${avg}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_ارتقاء_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'visits' as const, label: 'تقارير الزيارات' },
    { id: 'teachers' as const, label: 'تقارير المعلمين' },
    { id: 'subjects' as const, label: 'تقارير المواد' },
  ];

  return (
    <DashboardLayout pageTitle="مركز التقارير">
      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block font-cairo text-xs font-bold mb-1" style={{ color: 'var(--gray-500)' }}>من تاريخ</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block font-cairo text-xs font-bold mb-1" style={{ color: 'var(--gray-500)' }}>إلى تاريخ</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block font-cairo text-xs font-bold mb-1" style={{ color: 'var(--gray-500)' }}>المادة</label>
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input-field">
              <option value="">جميع المواد</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: '#B54A4A' }}>
              <FileText size={16} />
              PDF
            </button>
            <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-3 rounded-xl font-cairo font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: '#2E7D5A' }}>
              <FileSpreadsheet size={16} />
              Excel
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-3 rounded-xl font-cairo font-semibold text-sm transition-all" style={{ background: 'var(--gray-100)', color: 'var(--text-primary)' }}>
              <Printer size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Charts Preview */}
      {!isSysadmin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-cairo font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={16} style={{ color: 'var(--qatar-maroon)' }} />
              تطور الزيارات
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyVisitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="visits" stroke="#8A1538" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-cairo font-bold text-sm mb-3 flex items-center gap-2">
              <BarChart3 size={16} style={{ color: 'var(--qatar-gold)' }} />
              أداء المواد
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
                <XAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: 'Tajawal' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="avgScore" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-cairo font-bold text-sm mb-3 flex items-center gap-2">
              <Star size={16} style={{ color: 'var(--qatar-gold)' }} />
              توزيع الزيارات
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={visitDistributionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" nameKey="name">
                  {visitDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontFamily: 'Tajawal', fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2.5 rounded-xl font-cairo font-semibold text-sm transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'var(--qatar-maroon)' : 'white',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(138,21,56,0.2)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits Report */}
      {activeTab === 'visits' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الزائر</th>
                  <th>المعلم</th>
                  <th>المادة</th>
                  <th>المنسق</th>
                  <th>الصف</th>
                  <th>التاريخ</th>
                  <th>المدة</th>
                  <th colSpan={5} className="text-center">التقييم (5 معايير)</th>
                  <th>المتوسط</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit, idx) => (
                  <tr key={visit.id}>
                    <td className="font-ibm text-xs">{idx + 1}</td>
                    <td className="font-cairo text-xs font-semibold">{visit.visitorName}</td>
                    <td className="font-cairo text-xs">{visit.teacherName}</td>
                    <td><span className="badge badge-maroon text-[10px]">{visit.subjectName}</span></td>
                    <td className="font-tajawal text-xs">{visit.coordinatorName}</td>
                    <td className="font-ibm text-xs">{visit.className}</td>
                    <td className="font-ibm text-xs">{visit.visitDate}</td>
                    <td className="font-tajawal text-xs">{visit.visitDuration}</td>
                    <td className="font-ibm text-xs text-center">{visit.scoreObjectives}</td>
                    <td className="font-ibm text-xs text-center">{visit.scoreStudents}</td>
                    <td className="font-ibm text-xs text-center">{visit.scoreDiscipline}</td>
                    <td className="font-ibm text-xs text-center">{visit.scoreTeacherInteraction}</td>
                    <td className="font-ibm text-xs text-center">{visit.scoreSafeEnvironment}</td>
                    <td>
                      <span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(visit.averageScore) }}>
                        {visit.averageScore.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedVisit(visit)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye size={16} style={{ color: 'var(--gray-500)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVisits.length === 0 && (
                  <tr><td colSpan={16} className="text-center py-8 font-tajawal" style={{ color: 'var(--gray-500)' }}>لا توجد زيارات مطابقة للفلاتر</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Teachers Report */}
      {activeTab === 'teachers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map(subject => subject.teachers.map(teacher => {
            const tVisits = visits.filter(v => v.teacherId === teacher.id);
            const avg = tVisits.length > 0 ? (tVisits.reduce((s, v) => s + v.averageScore, 0) / tVisits.length).toFixed(1) : '—';
            return (
              <div key={teacher.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-cairo font-bold text-sm text-white" style={{ background: 'var(--qatar-maroon)' }}>
                    {teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-cairo font-bold text-sm">{teacher.name}</h4>
                    <span className="badge badge-maroon text-[10px]">{subject.name}</span>
                  </div>
                  <div className="mr-auto text-center">
                    <span className="font-ibm font-bold text-2xl block" style={{ color: avg !== '—' ? getScoreColor(parseFloat(avg)) : 'var(--gray-500)' }}>{avg}</span>
                    <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>متوسط</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-tajawal" style={{ color: 'var(--text-secondary)' }}>الزيارات: {tVisits.length}</span>
                  <span className="font-tajawal" style={{ color: 'var(--text-secondary)' }}>المنسق: {subject.coordinatorName}</span>
                </div>
                {tVisits.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {tVisits.slice(0, 3).map(v => (
                      <div key={v.id} className="flex justify-between text-xs font-tajawal p-2 rounded-lg" style={{ background: 'var(--gray-100)' }}>
                        <span>{v.visitorName}</span>
                        <span style={{ color: getScoreColor(v.averageScore) }}>{v.averageScore.toFixed(1)} ★</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }))}
        </motion.div>
      )}

      {/* Subjects Report */}
      {activeTab === 'subjects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map(subject => {
            const sVisits = visits.filter(v => v.subjectId === subject.id);
            const avg = sVisits.length > 0 ? (sVisits.reduce((s, v) => s + v.averageScore, 0) / sVisits.length).toFixed(1) : '—';
            return (
              <div key={subject.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <h4 className="font-cairo font-bold text-lg mb-1" style={{ color: 'var(--qatar-maroon)' }}>{subject.name}</h4>
                <p className="font-tajawal text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>المنسق: {subject.coordinatorName}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-ibm font-bold block" style={{ color: 'var(--text-primary)' }}>{subject.teachers.length}</span>
                    <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>معلم</span>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-ibm font-bold block" style={{ color: 'var(--text-primary)' }}>{sVisits.length}</span>
                    <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>زيارة</span>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                    <span className="font-ibm font-bold block" style={{ color: avg !== '—' ? getScoreColor(parseFloat(avg)) : 'var(--gray-500)' }}>{avg}</span>
                    <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>متوسط</span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setSelectedVisit(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-cairo font-bold text-xl" style={{ color: 'var(--qatar-maroon)' }}>تقرير زيارة صفية داعمة</h3>
              <button onClick={() => setSelectedVisit(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <FileText size={18} />
              </button>
            </div>

            <div ref={reportRef} className="pdf-report space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <img src="/assets/logo.jpg" alt="" className="w-12 h-12 rounded-lg" />
                <div>
                  <p className="font-cairo font-bold text-sm">نظام ارتقاء</p>
                  <p className="font-tajawal text-xs">مدرسة طارق بن زياد الثانوية للبنين</p>
                </div>
              </div>

              <div className="pdf-section space-y-2">
                <div className="flex justify-between"><span className="font-tajawal text-sm">الزائر:</span><span className="font-cairo font-bold text-sm">{selectedVisit.visitorName}</span></div>
                <div className="flex justify-between"><span className="font-tajawal text-sm">الصفة:</span><span className="font-cairo text-sm">{selectedVisit.visitorRole}</span></div>
                <div className="flex justify-between"><span className="font-tajawal text-sm">المعلم:</span><span className="font-cairo font-bold text-sm">{selectedVisit.teacherName}</span></div>
                <div className="flex justify-between"><span className="font-tajawal text-sm">المادة:</span><span className="font-cairo text-sm">{selectedVisit.subjectName}</span></div>
                <div className="flex justify-between"><span className="font-tajawal text-sm">المنسق:</span><span className="font-cairo text-sm">{selectedVisit.coordinatorName}</span></div>
                <div className="flex justify-between"><span className="font-tajawal text-sm">الصف:</span><span className="font-ibm text-sm">{selectedVisit.className}</span></div>
                <div className="flex justify-between"><span className="font-tajawal text-sm">التاريخ:</span><span className="font-ibm text-sm">{selectedVisit.visitDate}</span></div>
              </div>

              <div className="pdf-section">
                <h4 className="font-cairo font-bold text-sm mb-3">نتائج التقييم</h4>
                {[
                  { label: 'الأهداف معروضة وواضحة', score: selectedVisit.scoreObjectives },
                  { label: 'الطلبة متفاعلون', score: selectedVisit.scoreStudents },
                  { label: 'مدى الانضباط والنظام', score: selectedVisit.scoreDiscipline },
                  { label: 'المعلم متفاعل مع الطلاب', score: selectedVisit.scoreTeacherInteraction },
                  { label: 'البيئة الصفية الآمنة', score: selectedVisit.scoreSafeEnvironment },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--gray-200)' }}>
                    <span className="font-tajawal text-sm">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={s <= item.score ? 'star' : 'star-empty'}>★</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="font-cairo font-bold">المتوسط العام</span>
                  <span className="font-ibm font-bold text-xl" style={{ color: 'var(--qatar-maroon)' }}>{selectedVisit.averageScore.toFixed(1)} / 5</span>
                </div>
              </div>

              {selectedVisit.keyObservations && (
                <div className="pdf-section">
                  <h4 className="font-cairo font-bold text-sm mb-2">أبرز الملاحظات</h4>
                  <p className="font-tajawal text-sm">{selectedVisit.keyObservations}</p>
                </div>
              )}

              <p className="text-center font-tajawal text-sm mt-4" style={{ color: 'var(--qatar-gold)' }}>
                نرتقي معًا… لنصنع أثرًا في كل حصة
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={exportPDF} className="flex-1 btn-primary justify-center text-sm">
                <Download size={16} />
                تصدير PDF
              </button>
              <button onClick={() => setSelectedVisit(null)} className="flex-1 btn-outline text-sm">إغلاق</button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
