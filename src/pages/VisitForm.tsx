import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Star, CheckCircle, RotateCcw, ArrowRight, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { subjects, evaluationCriteria, scoreLabels, type Visit } from '@/data/demoData';

/* ─── Generate all class options ─── */
const classOptions: string[] = [];
// Grade 10: 10/1 to 10/10
for (let i = 1; i <= 10; i++) classOptions.push(`10/${i}`);
// Grade 11: 11/1 to 11/10
for (let i = 1; i <= 10; i++) classOptions.push(`11/${i}`);
// Grade 12: 12/1 to 12/11
for (let i = 1; i <= 11; i++) classOptions.push(`12/${i}`);

export default function VisitForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addVisit } = useCloudSync();

  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState(user?.subjectId || '');
  const [className, setClassName] = useState('');
  const [visitDuration, setVisitDuration] = useState('20 دقيقة');
  const [observations, setObservations] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({
    scoreObjectives: 0, scoreStudents: 0, scoreDiscipline: 0,
    scoreTeacherInteraction: 0, scoreSafeEnvironment: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ─── Editable date & time ─── */
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit', hour12: false });
  const [visitDate, setVisitDate] = useState(todayStr);
  const [visitTime, setVisitTime] = useState(nowTimeStr);

  const subject = useMemo(() => subjects.find(s => s.id === subjectId), [subjectId]);
  const availableTeachers = useMemo(() => subject?.teachers || [], [subject]);

  const averageScore = useMemo(() => {
    const values = Object.values(scores).filter(s => s > 0);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [scores]);

  const allScored = Object.values(scores).every(s => s > 0);

  const handleScore = (criteriaId: string, value: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !allScored || !className) return;
    setLoading(true);

    const newVisit: Visit = {
      id: `v-${Date.now()}`,
      visitorId: user?.id || '',
      visitorName: user?.name || '',
      visitorRole: user?.roleLabel || '',
      teacherId,
      teacherName: availableTeachers.find(t => t.id === teacherId)?.name || '',
      subjectId,
      subjectName: subject?.name || '',
      coordinatorId: subject?.coordinatorId || '',
      coordinatorName: subject?.coordinatorName || '',
      className,
      visitDate,
      visitTime,
      visitDuration,
      scoreObjectives: scores.scoreObjectives,
      scoreStudents: scores.scoreStudents,
      scoreDiscipline: scores.scoreDiscipline,
      scoreTeacherInteraction: scores.scoreTeacherInteraction,
      scoreSafeEnvironment: scores.scoreSafeEnvironment,
      averageScore,
      keyObservations: observations,
      status: 'sent',
      visibleTo: [user?.id || '', subject?.coordinatorId || ''],
      createdAt: new Date().toISOString(),
    };

    await addVisit(newVisit);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <DashboardLayout pageTitle="زيارة صفية داعمة جديدة">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto bg-white rounded-3xl p-12 shadow-xl text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--success-light)' }}>
              <CheckCircle size={40} style={{ color: 'var(--success)' }} />
            </div>
          </motion.div>
          <h2 className="font-cairo text-2xl font-extrabold mb-3" style={{ color: 'var(--success)' }}>
            تم إرسال الزيارة الصفية الداعمة بنجاح ☁️
          </h2>
          <p className="font-tajawal mb-2" style={{ color: 'var(--text-secondary)' }}>
            تم حفظ الزيارة وإشعار المعنيين
          </p>
          <p className="font-tajawal text-xs mb-6" style={{ color: 'var(--gray-500)' }}>
            تمت المزامنة السحابية — تظهر الآن عند جميع المستخدمين
          </p>

          <div className="rounded-2xl p-5 mb-8 text-right" style={{ background: 'var(--off-white)' }}>
            <div className="space-y-2 font-tajawal text-sm">
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>المعلم:</span><span className="font-bold">{availableTeachers.find(t => t.id === teacherId)?.name || '—'}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>المادة:</span><span className="font-bold">{subject?.name}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>الصف:</span><span className="font-bold">{className}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>التاريخ:</span><span className="font-bold">{visitDate}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>المتوسط:</span><span className="font-ibm font-bold" style={{ color: 'var(--qatar-maroon)' }}>{averageScore.toFixed(1)} / 5</span></div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => {
              setSubmitted(false);
              setScores({ scoreObjectives: 0, scoreStudents: 0, scoreDiscipline: 0, scoreTeacherInteraction: 0, scoreSafeEnvironment: 0 });
              setTeacherId(''); setClassName(''); setObservations('');
              setVisitDate(new Date().toISOString().split('T')[0]);
              setVisitTime(new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit', hour12: false }));
            }} className="btn-outline flex items-center gap-2">
              <RotateCcw size={16} /> زيارة جديدة
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center gap-2">
              <ArrowRight size={16} /> لوحة التحكم
            </button>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="زيارة صفية داعمة جديدة">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b" style={{ borderColor: 'var(--gray-100)' }}>
            <h2 className="font-cairo text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>زيارة صفية داعمة جديدة</h2>
            <p className="font-tajawal" style={{ color: 'var(--text-secondary)' }}>وثّق ملاحظاتك الداعمة للمعلم</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Visitor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                <label className="block font-cairo text-xs font-bold mb-1" style={{ color: 'var(--gray-500)' }}>اسم الزائر</label>
                <p className="font-cairo font-bold text-sm">{user?.name}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                <label className="block font-cairo text-xs font-bold mb-1" style={{ color: 'var(--gray-500)' }}>صفة الزائر</label>
                <span className="badge badge-maroon text-xs">{user?.roleLabel}</span>
              </div>
            </div>

            {/* Subject & Teacher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">المادة</label>
                <select value={subjectId} onChange={e => { setSubjectId(e.target.value); setTeacherId(''); }}
                  className="input-field" disabled={!!user?.subjectId}>
                  <option value="">اختر المادة</option>
                  {subjects.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">اسم المعلم</label>
                <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="input-field">
                  <option value="">اختر المعلم</option>
                  {availableTeachers.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
            </div>

            {/* Class, Coordinator, Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">الصف والشعبة <span className="text-red-500">*</span></label>
                <select value={className} onChange={e => setClassName(e.target.value)} className="input-field" required>
                  <option value="">اختر الصف</option>
                  <optgroup label="الصف العاشر (10)">
                    {classOptions.filter(c => c.startsWith('10/')).map(c => (<option key={c} value={c}>{c}</option>))}
                  </optgroup>
                  <optgroup label="الصف الحادي عشر (11)">
                    {classOptions.filter(c => c.startsWith('11/')).map(c => (<option key={c} value={c}>{c}</option>))}
                  </optgroup>
                  <optgroup label="الصف الثاني عشر (12)">
                    {classOptions.filter(c => c.startsWith('12/')).map(c => (<option key={c} value={c}>{c}</option>))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">المنسق</label>
                <div className="input-field flex items-center font-tajawal text-sm" style={{ background: 'var(--gray-100)' }}>
                  {subject?.coordinatorName || '—'}
                </div>
              </div>
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">مدة الزيارة</label>
                <select value={visitDuration} onChange={e => setVisitDuration(e.target.value)} className="input-field">
                  <option>15 دقيقة</option>
                  <option>20 دقيقة</option>
                  <option>30 دقيقة</option>
                </select>
              </div>
            </div>

            {/* Date & Time - EDITABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">
                  <Calendar size={14} className="inline ml-1" />تاريخ الزيارة
                </label>
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)}
                  className="input-field" dir="ltr" required />
              </div>
              <div>
                <label className="block font-cairo font-semibold text-sm mb-2">
                  <Clock size={14} className="inline ml-1" />وقت الزيارة
                </label>
                <input type="time" value={visitTime} onChange={e => setVisitTime(e.target.value)}
                  className="input-field" dir="ltr" required />
              </div>
            </div>

            {/* Evaluation */}
            <div>
              <h3 className="font-cairo font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>تقييم الزيارة</h3>
              <div className="space-y-4">
                {evaluationCriteria.map((criterion) => (
                  <motion.div key={criterion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-5 rounded-2xl border transition-all"
                    style={{
                      borderColor: scores[criterion.id] > 0 ? 'var(--qatar-gold)' : 'var(--gray-200)',
                      background: scores[criterion.id] > 0 ? 'rgba(212,175,55,0.03)' : 'white',
                    }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="font-cairo font-semibold text-sm">{criterion.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => handleScore(criterion.id, star)} className="star p-1">
                              <Star size={28}
                                className={star <= scores[criterion.id] ? 'filled' : 'empty'}
                                fill={star <= scores[criterion.id] ? 'var(--qatar-gold)' : 'none'}
                                stroke={star <= scores[criterion.id] ? 'var(--qatar-gold)' : 'var(--gray-300)'} />
                            </button>
                          ))}
                        </div>
                        {scores[criterion.id] > 0 && (
                          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            className="font-cairo font-bold text-xs px-2 py-1 rounded-lg"
                            style={{ background: 'var(--qatar-gold-light)', color: 'var(--qatar-maroon-dark)' }}>
                            {scoreLabels[scores[criterion.id]]}
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Average */}
              <div className="mt-6 p-6 rounded-2xl text-center" style={{ background: 'var(--off-white)' }}>
                <p className="font-cairo font-semibold text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>المتوسط العام</p>
                <p className="font-ibm font-bold text-4xl mb-2" style={{ color: 'var(--qatar-maroon)' }}>
                  {averageScore.toFixed(1)} <span className="text-lg" style={{ color: 'var(--gray-500)' }}>/ 5</span>
                </p>
                <div className="progress-bar max-w-xs mx-auto" style={{ height: 10 }}>
                  <motion.div className="fill" initial={{ width: 0 }} animate={{ width: `${(averageScore / 5) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block font-cairo font-semibold text-sm mb-2">أبرز الملاحظات <span className="text-xs font-tajawal" style={{ color: 'var(--gray-500)' }}>(اختياري)</span></label>
              <textarea value={observations} onChange={e => setObservations(e.target.value)}
                placeholder="اكتب ملاحظاتك الداعمة والإيجابية هنا…" rows={4} className="input-field resize-none pt-3" />
              <p className="font-tajawal text-xs mt-1" style={{ color: 'var(--gray-500)' }}>ركّز على ما هو إيجابي وبناء</p>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading || !teacherId || !allScored || !className}
              className="btn-primary w-full justify-center h-14 text-lg disabled:opacity-50" whileTap={{ scale: 0.98 }}>
              {loading ? <div className="spinner" /> : (<><Send size={20} /> إرسال الزيارة</>)}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
