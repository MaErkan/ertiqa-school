import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileCheck, Users, BookOpen, TrendingUp, Plus, Eye, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { subjects, teachers, monthlyVisitData, subjectPerformanceData, visitDistributionData } from '@/data/demoData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const mountedRef = useRef(false);
  const { visits } = useCloudSync();

  useEffect(() => { mountedRef.current = true; }, []);

  const recentVisits = visits.slice(0, 5);
  const avgScore = visits.length > 0 ? (visits.reduce((s, v) => s + Number(v.scoreTotal), 0) / visits.length).toFixed(1) : '0';

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'var(--success)';
    if (score >= 3.5) return 'var(--warning)';
    return 'var(--error)';
  };

  const kpiData = [
    { icon: FileCheck, label: 'إجمالي الزيارات', value: String(visits.length), sub: 'هذا الشهر', color: '#8A1538', change: '+12%' },
    { icon: Users, label: 'المعلمين', value: String(teachers.length), sub: 'معلم نشط', color: '#4A7FB5', change: '+3' },
    { icon: BookOpen, label: 'المواد', value: String(subjects.length), sub: 'مادة دراسية', color: '#2E7D5A', change: '' },
    { icon: TrendingUp, label: 'متوسط الأداء', value: avgScore, sub: 'من 5 نجوم', color: '#C9892E', change: '+0.3' },
  ];

  return (
    <DashboardLayout pageTitle="لوحة التحكم">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpiData.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="kpi-card relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-[3px]" style={{ background: card.color }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              {card.change && <span className="badge badge-success text-xs">{card.change}</span>}
            </div>
            <div className="font-ibm text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
            <div className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
            <div className="font-tajawal text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>تطور الزيارات الشهرية</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyVisitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12, border: '1px solid #E6DCD4' }} formatter={(value: number) => [`${value}`, 'الزيارات']} />
              <Line type="monotone" dataKey="visits" stroke="#8A1538" strokeWidth={3} dot={{ fill: '#8A1538', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>متوسط أداء المواد</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subjectPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="subject" type="category" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} width={100} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12, border: '1px solid #E6DCD4' }} formatter={(value: number) => [`${value}`, 'المتوسط']} />
              <Bar dataKey="avgScore" fill="#D4AF37" radius={[0, 8, 8, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>توزيع الزيارات حسب الدور</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={visitDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                {visitDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontFamily: 'Tajawal', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--gray-100)' }}>
            <h3 className="font-cairo font-bold text-lg" style={{ color: 'var(--text-primary)' }}>آخر الزيارات الصفية</h3>
            <button onClick={() => navigate('/reports')} className="flex items-center gap-2 px-4 py-2 rounded-lg font-cairo font-semibold text-sm transition-colors" style={{ color: 'var(--qatar-maroon)', background: 'rgba(138,21,56,0.08)' }}>
              عرض الكل <FileText size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>المعلم</th><th>المادة</th><th>الزائر</th><th>التاريخ</th><th>المتوسط</th><th></th></tr></thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="font-cairo font-semibold text-sm">{visit.teacherName}</td>
                    <td><span className="badge badge-maroon text-xs">{visit.subjectName}</span></td>
                    <td className="font-tajawal text-sm">{visit.visitorName}</td>
                    <td className="font-ibm text-sm">{visit.visitDate}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(Number(visit.scoreTotal)) }}>
                          {Number(visit.scoreTotal).toFixed(1)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--gray-500)' }}>/5</span>
                      </div>
                    </td>
                    <td><button className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><Eye size={16} style={{ color: 'var(--gray-500)' }} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>المواد الدراسية</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {subjects.map(s => (
            <button key={s.id} onClick={() => navigate('/subjects')} className="p-4 rounded-xl text-center transition-all hover:shadow-md" style={{ background: 'var(--gray-100)' }}>
              <p className="font-cairo font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
              <p className="font-ibm text-xs" style={{ color: 'var(--gray-500)' }}>{teachers.filter(t => t.subjectId === s.id).length} معلم</p>
            </button>
          ))}
        </div>
      </motion.div>

      <button onClick={() => navigate('/visit/new')} className="fixed bottom-8 left-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-transform hover:scale-110 animate-pulse-gold" style={{ background: 'var(--qatar-maroon)' }}>
        <Plus size={24} color="white" />
      </button>
    </DashboardLayout>
  );
}
