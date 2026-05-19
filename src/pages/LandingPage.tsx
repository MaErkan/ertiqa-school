import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import * as THREE from 'three';
import {
  Shield, Users, Settings, ChevronDown, BookOpen, TrendingUp,
  BrainCircuit, Zap, ArrowLeft, GraduationCap, Award
} from 'lucide-react';

/* ═══════════════════════════════════════════
   THREE.JS CRYSTAL SCENE (Hero Background)
   ═══════════════════════════════════════════ */
function CrystalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const crystalGroup = new THREE.Object3D();
    scene.add(crystalGroup);

    const shardConfigs = [
      { size: 2.2, color: '#8A1538', pos: [-1, 0.5, 0] },
      { size: 1.6, color: '#D4AF37', pos: [1.5, -0.5, 0.5] },
      { size: 1.8, color: '#A91D48', pos: [0, 1, -0.5] },
      { size: 1.4, color: '#D4AF37', pos: [-1.5, -1, 0.3] },
      { size: 1.5, color: '#8A1538', pos: [0.8, 0.8, -0.8] },
    ];

    shardConfigs.forEach(cfg => {
      const geo = new THREE.IcosahedronGeometry(cfg.size, 0);
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(cfg.color),
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.6,
        transparent: true,
        opacity: 0.85,
        thickness: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        ior: 1.8,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      (mesh as any).rotSpeed = 0.001 + Math.random() * 0.003;
      (mesh as any).floatSpeed = 0.0005 + Math.random() * 0.001;
      (mesh as any).floatAmp = 0.05 + Math.random() * 0.1;
      (mesh as any).phase = Math.random() * Math.PI * 2;
      crystalGroup.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: 0.15 });
      const wireframe = new THREE.LineSegments(edges, edgeMat);
      mesh.add(wireframe);
    });

    const ambient = new THREE.AmbientLight(0xD4AF37, 0.5);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    key.position.set(5, 5, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xA91D48, 0.6);
    fill.position.set(-3, 0, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xFFD700, 0.4);
    rim.position.set(0, -5, -5);
    scene.add(rim);
    const point = new THREE.PointLight(0xFFFFFF, 0.8, 20);
    point.position.set(2, 3, 4);
    scene.add(point);

    let time = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.016;

      crystalGroup.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.rotation.x += (mesh as any).rotSpeed;
        mesh.rotation.y += (mesh as any).rotSpeed * 0.7;
        mesh.position.y += Math.sin(time * (mesh as any).floatSpeed * 60 + (mesh as any).phase) * (mesh as any).floatAmp * 0.01;
      });

      const targetRotY = mouseRef.current.x * 0.3;
      const targetRotX = -mouseRef.current.y * 0.2;
      crystalGroup.rotation.y += (targetRotY - crystalGroup.rotation.y) * 0.05;
      crystalGroup.rotation.x += (targetRotX - crystalGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const entranceInterval = setInterval(() => {
      if (camera.position.z > 6) {
        camera.position.z -= 0.05;
      } else {
        clearInterval(entranceInterval);
      }
    }, 16);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(entranceInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

/* ═══════════════════════════════════════════
   HERO SECTION — Single Professional Hero
   ═══════════════════════════════════════════ */

/* ─── Shimmer Gold Text ─── */
function ShimmerGold({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={`inline-block relative ${className || ''}`}
      style={{
        background: 'linear-gradient(90deg, #8A1538 0%, #D4AF37 25%, #F5E6A3 50%, #D4AF37 75%, #8A1538 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmerFlow 3s linear infinite',
        filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.3)) drop-shadow(0 0 40px rgba(138,21,56,0.2))',
      }}
    >
      {text}
      <style>{`
        @keyframes shimmerFlow {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen overflow-hidden" style={{ background: '#0a0405' }}>
      <CrystalScene />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #8A1538, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center py-16">
        {/* Glass badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', backdropFilter: 'blur(10px)' }}
        >
          <GraduationCap size={16} style={{ color: 'var(--qatar-gold)' }} />
          <span className="font-tajawal text-sm" style={{ color: 'var(--qatar-gold)' }}>مدرسة طارق بن زياد الثانوية للبنين</span>
        </motion.div>

        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 relative"
        >
          {/* Outer spinning ring */}
          <div className="absolute -inset-3 rounded-full" style={{
            background: 'conic-gradient(from 0deg, #D4AF37, #8A1538, #D4AF37, #8A1538, #D4AF37)',
            animation: 'spin 4s linear infinite',
            filter: 'blur(2px)',
            opacity: 0.6,
          }} />
          {/* Glow ring */}
          <motion.div
            className="absolute -inset-6 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2), transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Logo container */}
          <div
            className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden"
            style={{
              border: '3px solid rgba(212,175,55,0.6)',
              boxShadow: '0 0 40px rgba(138,21,56,0.4), 0 0 80px rgba(212,175,55,0.15), inset 0 0 30px rgba(212,175,55,0.1)',
            }}
          >
            <img src="/assets/logo.jpg" alt="شعار ارتقاء" className="w-full h-full object-cover" />
          </div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>

        {/* Fixed headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-5"
        >
          <h1 className="font-cairo text-6xl md:text-8xl lg:text-9xl font-black leading-tight">
            <ShimmerGold text="ارتقاء" className="font-cairo text-6xl md:text-8xl lg:text-9xl font-black" />
          </h1>
        </motion.div>

        {/* Animated underline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-0.5 rounded-full mb-6 mx-auto"
          style={{
            width: 160,
            background: 'linear-gradient(90deg, transparent, #D4AF37, #8A1538, #D4AF37, transparent)',
            boxShadow: '0 0 20px rgba(212,175,55,0.5)',
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="font-tajawal text-lg md:text-xl mb-3 max-w-xl"
          style={{ color: 'var(--gray-300)' }}
        >
          المتابعة الصفية الذكية — منصة تعليمية داعمة للنمو المهني
        </motion.p>

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mb-10 flex items-center gap-2"
        >
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
          <motion.span
            className="font-cairo font-bold text-base"
            style={{ color: 'var(--qatar-gold)' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            نرتقي معاً.. لنصنع أثراً في كل حصة
          </motion.span>
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button onClick={() => navigate('/login')} className="btn-primary text-lg px-10 py-4">
            <ArrowLeft size={20} />
            تسجيل الدخول
          </button>
          <button
            onClick={() => document.getElementById('banner')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 rounded-2xl font-cairo font-bold text-lg transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.3)', color: 'white', backdropFilter: 'blur(10px)' }}
          >
            تعرف على النظام
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => document.getElementById('banner')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={30} style={{ color: 'var(--qatar-gold)' }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   BANNER SECTION — Official Poster
   ═══════════════════════════════════════════ */
function BannerSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="banner" ref={ref} className="relative py-16 overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      {/* Gold line top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-40" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 px-4"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-cairo font-bold text-xs" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--qatar-gold)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <Award size={14} />
          برنامج المتابعة الصفية الذكية
        </span>
      </motion.div>

      {/* Cinematic full-bleed poster */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative w-full"
      >
        {/* Top vignette fade */}
        <div className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--bg-dark), transparent)' }} />
        {/* Bottom vignette fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg-dark), transparent)' }} />

        {/* Glow */}
        <div className="absolute -inset-4 blur-3xl opacity-10 pointer-events-none" style={{ background: 'linear-gradient(135deg, #8A1538, #D4AF37)' }} />

        <img
          src="/assets/poster-bg.jpg"
          alt="نظام ارتقاء — المتابعة الصفية الذكية"
          className="w-full h-auto object-cover"
          style={{ maxHeight: '60vh' }}
        />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   ABOUT SECTION
   ═══════════════════════════════════════════ */
function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    { icon: BookOpen, title: 'بيئة تعليمية متطورة', desc: 'نظام رقمي متكامل يدعم العملية التعليمية بأحدث التقنيات' },
    { icon: BrainCircuit, title: 'تحليل ذكي للبيانات', desc: 'تحليل لحظي للأداء مع إحصائيات تفاعلية ورسوم بيانية' },
    { icon: Zap, title: 'إشعارات فورية', desc: 'تنبيهات لحظية عند إرسال الزيارات مع مزامنة سحابية' },
    { icon: TrendingUp, title: 'تطوير مستمر', desc: 'تقارير احترافية لتعزيز الأداء ودعم المعلمين' },
  ];

  return (
    <section id="about" ref={ref} className="relative py-24 overflow-hidden" style={{ background: 'var(--off-white)' }}>
      <div className="absolute inset-0 opacity-10">
        <img src="/assets/school-building.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(253,248,245,0.95), rgba(253,248,245,0.7))' }} />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-cairo text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
            مدرسة <span style={{ color: 'var(--qatar-maroon)' }}>طارق بن زياد</span> الثانوية للبنين
          </h2>
          <p className="font-tajawal text-lg" style={{ color: 'var(--text-secondary)' }}>
            نرتقي معًا لنصنع أثرًا في كل حصة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass rounded-3xl p-8 text-center card-hover"
              style={{ border: '1px solid var(--glass-border)' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(138,21,56,0.1)' }}>
                <f.icon size={32} style={{ color: 'var(--qatar-maroon)' }} />
              </div>
              <h3 className="font-cairo text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   STATS SECTION
   ═══════════════════════════════════════════ */
function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const stats = [
    { value: '500+', label: 'زيارة صفية داعمة', desc: 'زيارات داعمة نفذتها إدارة المدرسة والمنسقون' },
    { value: '98%', label: 'رضا المعلمين', desc: 'نسبة رضا المعلمين عن التغذية الراجعة الإيجابية' },
    { value: '12', label: 'مادة دراسية', desc: 'جميع المواد الدراسية مغطاة بدعم مستمر' },
  ];

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--light-bg)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-cairo text-4xl font-extrabold text-center mb-16"
          style={{ color: 'var(--text-primary)' }}
        >
          أثر البرنامج
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center p-10 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <div className="font-ibm text-5xl font-bold mb-3" style={{ color: 'var(--qatar-maroon)' }}>{s.value}</div>
              <div className="font-cairo text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.label}</div>
              <p className="font-tajawal text-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   ROLES SECTION
   ═══════════════════════════════════════════ */
function RolesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const roles = [
    { icon: Shield, title: 'إدارة المدرسة', desc: 'وصول شامل لإدارة الزيارات والمعلمين والتقارير', roleList: ['مدير المدرسة', 'النائب الأكاديمي', 'النائب الإداري'], roleType: 'administration' },
    { icon: Users, title: 'منسقو المواد', desc: 'متابعة معلمي المادة والزيارات والتقارير الخاصة', roleList: ['منسقو المواد الدراسية'], roleType: 'coordinator' },
    { icon: Settings, title: 'مسؤولو النظام', desc: 'إدارة المستخدمين والصلاحيات والنسخ الاحتياطي', roleList: ['مسؤولو النظام'], roleType: 'sysadmin' },
  ];

  return (
    <section ref={ref} className="py-24" style={{ background: 'linear-gradient(135deg, #6B1029 0%, #8A1538 100%)' }}>
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-cairo text-4xl font-extrabold text-white mb-4">بوابة الدخول</h2>
          <p className="font-tajawal text-lg" style={{ color: 'var(--gray-300)' }}>اختر بوابتك للوصول إلى النظام</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative p-10 rounded-3xl cursor-pointer transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: hoveredCard === i ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.25)',
                transform: hoveredCard === i ? 'translateY(-8px)' : 'translateY(0)',
              }}
              onClick={() => navigate('/login', { state: { roleType: r.roleType } })}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(212,175,55,0.15)' }}>
                <r.icon size={32} style={{ color: 'var(--qatar-gold)' }} />
              </div>
              <h3 className="font-cairo text-2xl font-bold text-white text-center mb-3">{r.title}</h3>
              <p className="font-tajawal text-sm text-center mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.desc}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {r.roleList.map((rl, j) => (
                  <span key={j} className="px-3 py-1 rounded-full text-xs font-cairo" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--gray-300)' }}>
                    {rl}
                  </span>
                ))}
              </div>
              <button className="w-full py-3 rounded-xl font-cairo font-bold transition-all btn-gold">
                الدخول
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-12" style={{ background: 'var(--text-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img src="/assets/logo.jpg" alt="شعار ارتقاء" className="w-full h-full object-cover" />
          </div>
          <span className="font-cairo text-xl font-bold text-white">نظام ارتقاء</span>
        </div>
        <p className="font-cairo text-lg text-white mb-2">مدرسة طارق بن زياد الثانوية للبنين</p>
        <p className="font-tajawal text-sm mb-4" style={{ color: 'var(--qatar-gold)' }}>
          نرتقي معاً… لنصنع أثراً في كل حصة
        </p>
        {/* ═══ تصميم وتطوير أركان — اللوجو ═══ */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: 'var(--qatar-gold)' }}>
              <img src="/assets/arkan-logo.jpg" alt="تصميم وتطوير أركان" className="w-full h-full object-cover" />
            </div>
            <p className="font-cairo text-xs tracking-widest mt-1" style={{
              color: 'var(--qatar-gold)',
              textShadow: '0 0 10px rgba(212,175,55,0.3)',
            }}>
              تصميم وتطوير
            </p>
          </div>
        </div>
        <p className="font-tajawal text-xs mt-4" style={{ color: 'var(--gray-500)' }}>
          &copy; 2025 — نظام ارتقاء | جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <BannerSection />
      <AboutSection />
      <StatsSection />
      <RolesSection />
      <Footer />
    </div>
  );
}
