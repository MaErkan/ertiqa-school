import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--off-white)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 border-2" style={{ borderColor: 'var(--qatar-maroon)' }}>
          <img src="/assets/logo.jpg" alt="شعار ارتقاء" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-ibm font-bold text-6xl mb-4" style={{ color: 'var(--qatar-maroon)' }}>404</h1>
        <h2 className="font-cairo text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          الصفحة غير موجودة
        </h2>
        <p className="font-tajawal mb-8" style={{ color: 'var(--text-secondary)' }}>
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home size={18} />
          العودة للرئيسية
          <ArrowRight size={16} className="rotate-180" />
        </button>
      </motion.div>
    </div>
  );
}
