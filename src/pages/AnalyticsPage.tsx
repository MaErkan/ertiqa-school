import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  FileCheck, Calendar, TrendingUp, BarChart3, Award, BookOpen
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { monthlyVisitData, subjectPerformanceData } from '@/data/demoData';

const kpiSummary = [
  { icon: FileCheck, label: 'إجمالي الزيارات', value: '179', color: '#8A1538' },
  { icon: Calendar, label: 'اليوم', value: '3', color: '#4A7FB5' },
  { icon: TrendingUp, label: 'الأسبوع', value: '12', color: '#2E7D5A' },
  { icon: BarChart3, label: 'الشهر', value: '24', color: '#C9892E' },
  { icon: Award, label: 'متوسط الأداء', value: '4.2', color: '#6B1029' },
  { icon: BookOpen, label: 'أعلى مادة', value: 'الأحياء', color: '#D4AF37' },
];

const coordinatorRadarData = [
  { criterion: 'الأهداف الواضحة', 'منسق اللغة العربية': 4.5, 'منسق الأحياء': 4.8, 'منسق الرياضيات': 3.8 },
  { criterion: 'تفاعل الطلاب', 'منسق اللغة العربية': 4.2, 'منسق الأحياء': 4.6, 'منسق الرياضيات': 3.5 },
  { criterion: 'الانضباط', 'منسق اللغة العربية': 4.3, 'منسق الأحياء': 4.7, 'منسق الرياضيات': 4.0 },
  { criterion: 'تفاعل المعلم', 'منسق اللغة العربية': 4.4, 'منسق الأحياء': 4.9, 'منسق الرياضيات': 3.9 },
  { criterion: 'البيئة المحفزة', 'منسق اللغة العربية': 4.6, 'منسق الأحياء': 4.8, 'منسق الرياضيات': 4.1 },
];

export default function AnalyticsPage() {
  const scoreDistribution = [
    { range: '1-2', count: 2 },
    { range: '2-3', count: 8 },
    { range: '3-3.5', count: 15 },
    { range: '3.5-4', count: 35 },
    { range: '4-4.5', count: 78 },
    { range: '4.5-5', count: 41 },
  ];

  // Calendar heatmap data (last 12 weeks)
  const heatmapWeeks = Array.from({ length: 12 }, (_, wi) => ({
    week: `أسبوع ${wi + 1}`,
    visits: [0, 1, 2, 3, 1, 0, 2, 1, 3, 2, 1, 0][wi] || Math.floor(Math.random() * 4),
  }));

  return (
    <DashboardLayout pageTitle="الإحصائيات والتحليل">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpiSummary.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${kpi.color}15` }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div className="font-ibm font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
            <div className="font-tajawal text-[11px]" style={{ color: 'var(--text-secondary)' }}>{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend with dual axis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-cairo font-bold text-lg mb-4">تطور الزيارات والأداء</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyVisitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="left" domain={[3, 5]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontFamily: 'Tajawal', fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="visits" stroke="#8A1538" strokeWidth={3} name="الزيارات" dot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#D4AF37" strokeWidth={3} name="المتوسط" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Comparison */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-cairo font-bold text-lg mb-4">مقارنة أداء المواد</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
              <Bar dataKey="avgScore" name="المتوسط" radius={[8, 8, 0, 0]} barSize={24}>
                {subjectPerformanceData.map((_, i) => (
                  <Cell key={i} fill={['#8A1538', '#A91D48', '#D4AF37', '#B8962E', '#4A7FB5', '#2E7D5A', '#C9892E', '#6B1029'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radar Chart - Coordinator Comparison */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-cairo font-bold text-lg mb-4">مقارنة المنسقين</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={coordinatorRadarData}>
              <PolarGrid stroke="#E6DCD4" />
              <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fontFamily: 'Tajawal' }} />
              <Radar name="منسق اللغة العربية" dataKey="منسق اللغة العربية" stroke="#8A1538" fill="#8A1538" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="منسق الأحياء" dataKey="منسق الأحياء" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="منسق الرياضيات" dataKey="منسق الرياضيات" stroke="#4A7FB5" fill="#4A7FB5" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontFamily: 'Tajawal', fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-cairo font-bold text-lg mb-4">توزيع الدرجات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DCD4" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', borderRadius: 12 }} />
              <Bar dataKey="count" fill="#8A1538" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="font-cairo font-bold text-lg mb-4">خريطة الزيارات (آخر 12 أسبوع)</h3>
        <div className="grid grid-cols-12 gap-2">
          {heatmapWeeks.map((week, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center transition-transform hover:scale-110"
              style={{
                background: week.visits === 0 ? '#F3EDE8'
                  : week.visits === 1 ? 'rgba(138,21,56,0.2)'
                  : week.visits === 2 ? 'rgba(138,21,56,0.4)'
                  : 'rgba(138,21,56,0.7)',
              }}
              title={`${week.week}: ${week.visits} زيارات`}
            >
              <span className="font-ibm text-xs font-bold" style={{ color: week.visits > 1 ? 'white' : 'var(--text-secondary)' }}>
                {week.visits}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>أقل</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded" style={{ background: '#F3EDE8' }} />
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(138,21,56,0.2)' }} />
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(138,21,56,0.4)' }} />
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(138,21,56,0.7)' }} />
          </div>
          <span className="font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>أكثر</span>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
