import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/* ═══════════════════════════════════════════
   بيانات المستخدمين من ملف قائمة الموظفين
   ═══════════════════════════════════════════ */

interface LoginPerson {
  id: string;
  name: string;
  email: string;
  role: string;
  subjectName?: string;
}

const adminPeople: LoginPerson[] = [
  { id: 'admin-1', name: 'يوسف إبراهيم يوسف جاسم الجاسم', email: 'y.al-jassim0101@education.qa', role: 'manager' },
  { id: 'admin-2', name: 'أحمد محمد رمضان محمد', email: 'a.mohamed2211@education.qa', role: 'academic_vp' },
  { id: 'admin-3', name: 'حمد هادي محمد الغفراني المري', email: 'h.almarri23103@education.qa', role: 'admin_vp' },
];

const coordinatorPeople: LoginPerson[] = [
  { id: 'coord-1', name: 'عبدالله الشافعي محمد نعسان السيد', email: 'a.alsayed0101@education.qa', role: 'coordinator', subjectName: 'التربية الإسلامية' },
  { id: 'coord-2', name: 'أحمد حسين عموش', email: 'a.amooush0503@education.qa', role: 'coordinator', subjectName: 'اللغة العربية' },
  { id: 'coord-3', name: 'محمد حامد عبدالفتاح محمد عبدالله', email: 'm.abdallah0108@education.qa', role: 'coordinator', subjectName: 'اللغة الإنجليزية' },
  { id: 'coord-4', name: 'شريف عبدالمنعم عبدالحي البرلسي', email: 'coordinator-math@ertiqa.edu.qa', role: 'coordinator', subjectName: 'الرياضيات' },
  { id: 'coord-5', name: 'أشرف السيد جودة السيد محمد', email: 'coordinator-physics@ertiqa.edu.qa', role: 'coordinator', subjectName: 'الفيزياء' },
  { id: 'coord-6', name: 'حسام محمد أبو النصر محمد الزياتي', email: 'coordinator-chem@ertiqa.edu.qa', role: 'coordinator', subjectName: 'الكيمياء' },
  { id: 'coord-7', name: 'أحمد عبدالحميد أحمد عبدالمحسن', email: 'coordinator-bio@ertiqa.edu.qa', role: 'coordinator', subjectName: 'الأحياء' },
  { id: 'coord-8', name: 'علاء معوض إبراهيم حمودة', email: 'coordinator-social@ertiqa.edu.qa', role: 'coordinator', subjectName: 'الدراسات الاجتماعية' },
  { id: 'coord-9', name: 'محمد فتحي إبراهيم فريج', email: 'coordinator-it@ertiqa.edu.qa', role: 'coordinator', subjectName: 'تكنولوجيا المعلومات' },
  { id: 'coord-10', name: 'محمد جواد علي أكبر محمد جواد لاري', email: 'coordinator-pe@ertiqa.edu.qa', role: 'coordinator', subjectName: 'التربية البدنية' },
  { id: 'coord-11', name: 'هيثم محمد محمد أحمد الشامي', email: 'coordinator-el@ertiqa.edu.qa', role: 'coordinator', subjectName: 'التعليم الإلكتروني' },
];

const sysadminPeople: LoginPerson[] = [
  { id: 'sys-1', name: 'الأستاذ يوسف الجاسم', email: 'y.al-jassim0101@education.qa', role: 'sysadmin' },
  { id: 'sys-2', name: 'الدكتور أحمد رمضان', email: 'a.mohamed2211@education.qa', role: 'sysadmin' },
];

const sections = [
  {
    id: 'administration',
    title: 'إدارة المدرسة',
    description: 'وصول شامل لإدارة الزيارات والمعلمين والتقارير',
    icon: Shield,
    color: '#8A1538',
    people: adminPeople,
  },
  {
    id: 'coordinator',
    title: 'منسقو المواد',
    description: 'متابعة معلمي المادة والزيارات والتقارير الخاصة',
    icon: Users,
    color: '#D4AF37',
    people: coordinatorPeople,
  },
  {
    id: 'sysadmin',
    title: 'مسؤولو النظام',
    description: 'إدارة المستخدمين والصلاحيات والنسخ الاحتياطي',
    icon: Settings,
    color: '#4A7FB5',
    people: sysadminPeople,
  },
];

type Step = 'section' | 'person' | 'credentials';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('section');
  const [selectedSection, setSelectedSection] = useState<typeof sections[0] | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<LoginPerson | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSelectSection = (section: typeof sections[0]) => {
    setSelectedSection(section);
    setStep('person');
  };

  const handleSelectPerson = (person: LoginPerson) => {
    setSelectedPerson(person);
    setStep('credentials');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setErrors({ password: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = login(selectedPerson!.email, password, selectedSection?.id);
      setLoading(false);
      if (success) {
        const user = JSON.parse(localStorage.getItem('ertiqa_user') || '{}');
        if (user.role === 'coordinator') navigate('/coordinator');
        else if (user.role === 'sysadmin') navigate('/sysadmin');
        else navigate('/dashboard');
      } else {
        setErrors({ password: 'بيانات الدخول غير صحيحة' });
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 800);
  };

  const goBack = () => {
    if (step === 'credentials') {
      setStep('person');
      setSelectedPerson(null);
      setPassword('');
      setErrors({});
    } else if (step === 'person') {
      setStep('section');
      setSelectedSection(null);
    } else {
      navigate('/');
    }
  };

  const currentPeople = selectedSection?.people || [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--off-white)' }}>
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238A1538' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Back button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 mb-6 font-cairo font-semibold transition-colors"
          style={{ color: 'var(--qatar-maroon)' }}
        >
          <ArrowRight size={18} />
          {step === 'section' ? 'العودة للرئيسية' : step === 'person' ? 'العودة للأقسام' : 'العودة للأسماء'}
        </button>

        <AnimatePresence mode="wait">
          {/* ═════════ STEP 1: Choose Section ═════════ */}
          {step === 'section' && (
            <motion.div
              key="section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2" style={{ borderColor: 'var(--qatar-maroon)' }}>
                  <img src="/assets/logo.jpg" alt="شعار ارتقاء" className="w-full h-full object-cover" />
                </div>
                <h1 className="font-cairo text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
                  بوابة الدخول
                </h1>
                <p className="font-tajawal" style={{ color: 'var(--text-secondary)' }}>اختر القسم للوصول إلى النظام</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {sections.map((section, i) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelectSection(section)}
                    className="p-8 rounded-3xl text-right transition-all duration-300 hover:-translate-y-2"
                    style={{
                      background: 'white',
                      border: '2px solid transparent',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = section.color;
                      e.currentTarget.style.boxShadow = `0 8px 30px ${section.color}30`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${section.color}15` }}>
                      <section.icon size={28} style={{ color: section.color }} />
                    </div>
                    <h3 className="font-cairo text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
                    <p className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>{section.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═════════ STEP 2: Choose Person ═════════ */}
          {step === 'person' && selectedSection && (
            <motion.div
              key="person"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${selectedSection.color}15` }}>
                  <selectedSection.icon size={28} style={{ color: selectedSection.color }} />
                </div>
                <h2 className="font-cairo text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {selectedSection.title}
                </h2>
                <p className="font-tajawal" style={{ color: 'var(--text-secondary)' }}>اختر اسمك من القائمة</p>
              </div>

              <div className={`grid gap-3 ${selectedSection.id === 'coordinator' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {currentPeople.map((person, i) => (
                  <motion.button
                    key={person.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelectPerson(person)}
                    className="flex items-center gap-4 p-5 rounded-2xl text-right transition-all duration-200 hover:-translate-y-1"
                    style={{
                      background: 'white',
                      border: '1px solid var(--gray-200)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = selectedSection.color;
                      e.currentTarget.style.boxShadow = `0 4px 20px ${selectedSection.color}20`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--gray-200)';
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                    }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${selectedSection.color}12` }}>
                      <User size={22} style={{ color: selectedSection.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo font-bold text-sm truncate">{person.name}</p>
                      {person.subjectName && (
                        <p className="font-tajawal text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>{person.subjectName}</p>
                      )}
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--gray-300)' }} className="flex-shrink-0 rotate-180" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═════════ STEP 3: Enter Password ═════════ */}
          {step === 'credentials' && selectedPerson && selectedSection && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
            >
              <div className="h-1" style={{ background: selectedSection.color }} />
              <div className="p-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${selectedSection.color}12` }}>
                    <User size={28} style={{ color: selectedSection.color }} />
                  </div>
                  <h2 className="font-cairo text-xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {selectedPerson.name}
                  </h2>
                  <p className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selectedSection.title}
                  </p>
                  {selectedPerson.subjectName && (
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full font-cairo text-[11px]" style={{ background: `${selectedSection.color}12`, color: selectedSection.color }}>
                      {selectedPerson.subjectName}
                    </span>
                  )}
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email - auto-filled, read-only */}
                  <div>
                    <label className="block font-cairo font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-500)' }} />
                      <input
                        type="email"
                        value={selectedPerson.email}
                        readOnly
                        className="input-field pr-11 opacity-70 cursor-default"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-cairo font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-500)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors({}); }}
                        placeholder="••••••••"
                        className="input-field pr-11 pl-11"
                        dir="ltr"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--gray-500)' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm mt-1 font-tajawal" style={{ color: 'var(--error)' }}>{errors.password}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center h-14 text-lg disabled:opacity-70"
                    style={{ background: selectedSection.color }}
                  >
                    {loading ? <div className="spinner" /> : 'تسجيل الدخول'}
                  </button>
                </form>

                {/* Hint */}
                <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--gray-100)' }}>
                  <p className="font-cairo text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    تسجيل الدخول التجريبي:
                  </p>
                  <p className="font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>
                    أي كلمة مرور (6 أحرف على الأقل)
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
