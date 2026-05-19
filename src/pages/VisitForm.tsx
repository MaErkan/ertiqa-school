import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Star, CheckCircle, RotateCcw, ArrowRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { evaluationCriteria, scoreLabels } from '@/data/demoData';

const classOptions: string[] = [];
for (let i = 1; i <= 10; i++) classOptions.push(`10/${i}`);
for (let i = 1; i <= 10; i++) classOptions.push(`11/${i}`);
for (let i = 1; i <= 11; i++) classOptions.push(`12/${i}`);

export default function VisitForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subjects, teachers, isWeekend, addVisit } = useCloudSync();

  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState(user?.subjectId ? String(user.subjectId) : '');
  const [className, setClassName] = useState('');
  const [visitDuration, setVisitDuration] = useState('5 دقيقة');
  const [observations, setObservations] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit', hour12: false });
  const [visitDate, setVisitDate] = useState(todayStr);
  const [visitTime, setVisitTime] = useState(nowTimeStr);

  const [scores, setScores] = useState<Record<string, number>>({
    scoreObjectives: 0, scoreStudentEngagement: 0, scoreDiscipline: 0,
    scoreTeacherEngagement: 0, scoreEnvironment: 0,
  });

  // Weekend check
  const isWeekendDate = useMemo(() => isWeekend(visitDate), [visitDate, isWeekend]);

  const subject = useMemo(() => subjects.find(s => String(s.id) === subjectId), [subjectId, subjects]);
  const availableTeachers = useMemo(() => teachers.filter(t => String(t.subjectId) === subjectId), [subjectId, teachers]);
  const selectedTeacher = useMemo(() => teachers.find(t => String(t.id) === teacherId), [teacherId, teachers]);

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

    // Block weekend visits
    if (isWeekendDate) {
      setError('لا يمكن تسجيل زيارات في يوم الجمعة أو السبت — أيام عطلة رسمية');
      return;
    }

    setLoading(true);
    setError(null);

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    await addVisit({
      visitorId: user?.id || '',
      visitorName: user?.name || '',
      visitorRole: user?.role || '',
      teacherId: teacherId,
      teacherName: selectedTeacher?.name || '',
      subjectId: subjectId,
      subjectName: subject?.name || '',
      coordinatorId: subject?.coordinatorId || '',
      coordinatorName: subject?.coordinatorName || '',
      className,
      visitDate,
      visitTime,
      visitDuration,
      scoreObjectives: scores.scoreObjectives,
      scoreStudentEngagement: scores.scoreStudentEngagement,
      scoreDiscipline: scores.scoreDiscipline,
      scoreTeacherEngagement: scores.scoreTeacherEngagement,
      scoreEnvironment: scores.scoreEnvironment,
      scoreTotal: Number((totalScore / 5).toFixed(1)),
      notes: observations,
      status: 'sent',
    });

    setSubmitted(true);
    setLoading(false);
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
            تم إرسال الزيارة الصفية الداعمة بنجاح
          </h2>
          <p className="font-tajawal mb-2" style={{ color: 'var(--text-secondary)' }}>تم حفظ الزيارة وإشعار المعنيين</p>
          <p className="font-tajawal text-xs mb-6" style={{ color: 'var(--gray-500)' }}>تظهر الآن عند جميع المستخدمين</p>

          <div className="flex gap-3 justify-center">
            <button onClick={() => {
              setSubmitted(false);
              setScores({ scoreObjectives: 0, scoreStudentEngagement: 0, scoreDiscipline: 0, scoreTeacherEngagement: 0, scoreEnvironment: 0 });
              setTeacherId(''); setClassName(''); setObservations('');
              setVisitDate(new Date().toISOString().split('T')[0]);
              setVisitTime(new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit', hour12: false }));
              setError(null);
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
          <div className="p-8 border-b" style={{ borderColor: 'var(--gray-100)' }}>
            <h2 className="font-cairo text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>زيارة صفية داعمة جديدة</h2>
            <p className="font-tajawal" style={{ color: 'var(--text-secondary)' }}>وثّق ملاحظاتك الداعمة للمعلم</p>
          </div>

          {/* Weekend Warning */}
          {isWeekendDate && (
            <div className="mx-8 mt-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--error-light)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--error)' }} />
              <div>
                <p className="font-cairo font-bold text-sm" style={{ color: 'var(--error)' }}>يوم عطلة رسمية</p>
                <p className="font-tajawal text-xs" style={{ color: 'var(--error)' }}>لا يمكن تسجيل زيارات في يوم الجمعة أو السبت</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-8 mt-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--error-light)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--error)' }} />
              <p className="font-cairo text-sm" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

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

            {/* Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block font-cairo font-semibold text-sm mb-2">مدة الزيارة</label>
                <select value={visitDuration} onChange={e => setVisitDuration(e.target.value)} className="input-field">
                  <option value="1 دقيقة">1 دقيقة</option>
                  <option value="2 دقيقة">2 دقيقة</option>
                  <option value="3 دقيقة">3 دقيقة</option>
                  <option value="4 دقيقة">4 دقيقة</option>
                  <option value="5 دقيقة">5 دقيقة</option>
                  <option value="6 دقيقة">6 دقيقة</option>
                  <option value="7 دقيقة">7 دقيقة</option>
                  <option value="8 دقيقة">8 دقيقة</option>
                  <option value="9 دقيقة">9 دقيقة</option>
                  <option value="10 دقيقة">10 دقيقة</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
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
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading || !teacherId || !allScored || !className || isWeekendDate}
              className="btn-primary w-full justify-center h-14 text-lg disabled:opacity-50" whileTap={{ scale: 0.98 }}>
              {loading ? <div className="spinner" /> : (<><Send size={20} /> إرسال الزيارة</>)}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
