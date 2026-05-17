import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileCheck, Users, TrendingUp, Eye, BarChart3, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { subjects } from '@/data/demoData';

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { visits } = useCloudSync();

  const subject = useMemo(() => subjects.find(s => s.id === user?.subjectId), [user]);
  const subjectVisits = useMemo(() => visits.filter(v => v.subjectId === user?.subjectId), [visits, user]);
  const subjectTeachers = useMemo(() => subject?.teachers || [], [subject]);

  const avgScore = subjectVisits.length > 0
    ? (subjectVisits.reduce((sum, v) => sum + v.averageScore, 0) / subjectVisits.length).toFixed(1)
    : '0';

  const teacherPerformance = useMemo(() => {
    return subjectTeachers.map(t => {
      const tVisits = visits.filter(v => v.teacherId === t.id);
      const avg = tVisits.length > 0
        ? (tVisits.reduce((s, v) => s + v.averageScore, 0) / tVisits.length).toFixed(1)
        : '0';
      return { name: t.name.split(' ').slice(0, 2).join(' '), score: parseFloat(avg) };
    });
  }, [subjectTeachers, visits]);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'var(--success)';
    if (score >= 3.5) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <DashboardLayout pageTitle={`لوحة منسق ${subject?.name || ''}`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { icon: FileCheck, label: 'زيارات المادة', value: String(subjectVisits.length), sub: 'زيارة', color: '#8A1538' },
          { icon: Users, label: 'معلمو المادة', value: String(subjectTeachers.length), sub: 'معلم', color: '#4A7FB5' },
          { icon: TrendingUp, label: 'متوسط الأداء', value: avgScore, sub: 'من 5 نجوم', color: '#C9892E' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Teacher Performance Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            أداء معلمي {subject?.name}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teacherPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
              <Bar dataKey="score" fill="#8A1538" radius={[8, 8, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Teachers List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            معلمي {subject?.name}
          </h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {subjectTeachers.map((teacher) => {
              const tVisits = visits.filter(v => v.teacherId === teacher.id);
              const tAvg = tVisits.length > 0
                ? (tVisits.reduce((s, v) => s + v.averageScore, 0) / tVisits.length).toFixed(1)
                : '—';
              return (
                <div key={teacher.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-cairo font-bold text-xs text-white flex-shrink-0" style={{ background: 'var(--qatar-maroon)' }}>
                    {teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cairo font-semibold text-sm truncate">{teacher.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="progress-bar flex-1" style={{ height: 6 }}>
                        <div className="fill" style={{ width: tAvg !== '—' ? `${(parseFloat(tAvg) / 5) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                  <span className="font-ibm font-bold text-sm" style={{ color: tAvg !== '—' ? getScoreColor(parseFloat(tAvg)) : 'var(--gray-500)' }}>
                    {tAvg}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Subject Visits Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--gray-100)' }}>
          <h3 className="font-cairo font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            زيارات {subject?.name}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-cairo font-semibold text-sm transition-colors"
              style={{ color: 'var(--qatar-maroon)', background: 'rgba(138,21,56,0.08)' }}
            >
              <FileText size={14} />
              التقارير
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-cairo font-semibold text-sm transition-colors"
              style={{ color: 'var(--qatar-maroon)', background: 'rgba(138,21,56,0.08)' }}
            >
              <BarChart3 size={14} />
              الإحصائيات
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>المعلم</th>
                <th>الزائر</th>
                <th>الصف</th>
                <th>التاريخ</th>
                <th>المتوسط</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjectVisits.map((visit) => (
                <tr key={visit.id}>
                  <td className="font-cairo font-semibold text-sm">{visit.teacherName}</td>
                  <td className="font-tajawal text-sm">{visit.visitorName}</td>
                  <td className="font-ibm text-sm">{visit.className}</td>
                  <td className="font-ibm text-sm">{visit.visitDate}</td>
                  <td>
                    <span className="font-ibm font-bold text-sm" style={{ color: getScoreColor(visit.averageScore) }}>
                      {visit.averageScore.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye size={16} style={{ color: 'var(--gray-500)' }} />
                    </button>
                  </td>
                </tr>
              ))}
              {subjectVisits.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 font-tajawal" style={{ color: 'var(--gray-500)' }}>
                    لا توجد زيارات مسجلة حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
