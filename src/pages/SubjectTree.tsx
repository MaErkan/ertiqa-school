import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, UserCheck, GraduationCap, BookOpen, Lock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCloudSync } from '@/contexts/CloudSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { subjects, teachers } from '@/data/demoData';

export default function SubjectTree() {
  const { visits } = useCloudSync();
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSubject = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Filter subjects: coordinator sees only THEIR subject
  const visibleSubjects = useMemo(() => {
    if (!user) return subjects;
    if (user.role === 'coordinator' && user.subjectId) {
      return subjects.filter(s => s.id === user.subjectId);
    }
    return subjects;
  }, [user]);

  const visibleTeachers = useMemo(() => {
    if (!user || user.role !== 'coordinator' || !user.subjectId) return teachers;
    return teachers.filter(t => t.subjectId === user.subjectId);
  }, [user]);

  const totalTeachers = visibleTeachers.length;

  return (
    <DashboardLayout pageTitle="الهيكل التنظيمي للمواد والمعلمين">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <BookOpen size={24} className="mx-auto mb-2" style={{ color: 'var(--qatar-maroon)' }} />
          <span className="font-ibm font-bold text-2xl block" style={{ color: 'var(--text-primary)' }}>{subjects.length}</span>
          <span className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>مادة دراسية</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <Users size={24} className="mx-auto mb-2" style={{ color: 'var(--qatar-maroon)' }} />
          <span className="font-ibm font-bold text-2xl block" style={{ color: 'var(--text-primary)' }}>{totalTeachers}</span>
          <span className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>معلم</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <UserCheck size={24} className="mx-auto mb-2" style={{ color: 'var(--qatar-maroon)' }} />
          <span className="font-ibm font-bold text-2xl block" style={{ color: 'var(--text-primary)' }}>{subjects.length}</span>
          <span className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>منسق</span>
        </div>
      </motion.div>

      {/* Coordinator restriction notice */}
      {user?.role === 'coordinator' && (
        <div className="mb-4 p-3 rounded-xl bg-[#8A1538]/5 border border-[#8A1538]/20 flex items-center gap-2">
          <Lock size={16} className="text-[#8A1538] flex-shrink-0" />
          <p className="font-cairo text-xs text-[#8A1538]">أنت ت_VIEW فقط مادة <strong>{user.subjectName}</strong> — معلميك وزياراتك</p>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {visibleSubjects.map((subject) => (
          <SubjectNode key={subject.id} subject={subject} isExpanded={expandedId === subject.id}
            onToggle={() => toggleSubject(subject.id)}
            allTeachers={visibleTeachers} allVisits={visits} user={user} />
        ))}
      </motion.div>
    </DashboardLayout>
  );
}

interface SubjectNodeProps {
  subject: typeof subjects[0];
  isExpanded: boolean;
  onToggle: () => void;
  allTeachers: typeof teachers;
  allVisits: { teacherId: string; scoreTotal: number; subjectId: string }[];
  user: any;
}

function SubjectNode({ subject, isExpanded, onToggle, allTeachers, allVisits, user }: SubjectNodeProps) {
  const subjectTeachers = useMemo(() => allTeachers.filter(t => t.subjectId === subject.id), [allTeachers, subject.id]);
  const sVisits = useMemo(() => allVisits.filter(v => v.subjectId === subject.id), [allVisits, subject.id]);
  const avgScore = sVisits.length > 0
    ? (sVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / sVisits.length).toFixed(1)
    : '—';

  return (
    <div className="mb-3">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-right"
        style={{ background: isExpanded ? 'rgba(138,21,56,0.08)' : 'white', border: '1px solid', borderColor: isExpanded ? 'var(--qatar-maroon)' : 'var(--gray-200)' }}>
        <motion.div animate={{ rotate: isExpanded ? -90 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronLeft size={18} style={{ color: 'var(--qatar-maroon)' }} />
        </motion.div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(138,21,56,0.1)' }}>
          <BookOpen size={18} style={{ color: 'var(--qatar-maroon)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-cairo font-bold text-base" style={{ color: 'var(--qatar-maroon)' }}>{subject.name}</h4>
          <p className="font-tajawal text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            المنسق: {subject.coordinatorName}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <span className="font-ibm font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>{subjectTeachers.length}</span>
            <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>معلم</span>
          </div>
          <div className="text-center">
            <span className="font-ibm font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>{sVisits.length}</span>
            <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>زيارة</span>
          </div>
          <div className="text-center">
            <span className="font-ibm font-bold text-sm block" style={{ color: avgScore !== '—' ? 'var(--qatar-maroon)' : 'var(--gray-500)' }}>{avgScore}</span>
            <span className="font-tajawal text-[10px]" style={{ color: 'var(--gray-500)' }}>متوسط</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="mr-8 mt-2 space-y-2">
              {subjectTeachers.map((teacher) => {
                const tVisits = allVisits.filter(v => v.teacherId === teacher.id);
                const tAvg = tVisits.length > 0
                  ? (tVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / tVisits.length).toFixed(1)
                  : '—';
                return (
                  <div key={teacher.id} className="p-3 rounded-xl flex items-center gap-3 transition-colors hover:bg-gray-50"
                    style={{ background: 'white', border: '1px solid var(--gray-200)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gray-100)' }}>
                      <GraduationCap size={14} style={{ color: 'var(--gray-500)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo font-semibold text-sm truncate">{teacher.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>{tVisits.length} زيارة</span>
                      <span className="font-ibm font-bold text-sm" style={{ color: tAvg !== '—' ? 'var(--qatar-maroon)' : 'var(--gray-500)' }}>{tAvg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
