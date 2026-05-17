import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import * as THREE from 'three';
import {
  Shield, Users, Settings, ChevronDown, BookOpen, TrendingUp,
  BrainCircuit, Zap, ArrowLeft
} from 'lucide-react';

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

    // Camera entrance
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

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <CrystalScene />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 mx-auto" style={{ borderColor: 'var(--qatar-gold)' }}>
            <img src="/assets/logo.jpg" alt="شعار ارتقاء" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-cairo text-5xl md:text-6xl lg:text-7xl font-black mb-4"
          style={{ color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          نظام <span style={{ color: 'var(--qatar-gold)' }}>ارتقاء</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-tajawal text-lg md:text-xl mb-4 max-w-2xl"
          style={{ color: 'var(--gray-300)' }}
        >
          المتابعة الصفية الذكية — منصة تعليمية ذكية داعمة للنمو المهني للمعلمين
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-8 px-6 py-3 rounded-full glass"
          style={{ border: '1px solid var(--qatar-gold)' }}
        >
          <span className="font-cairo font-bold text-base" style={{ color: 'var(--qatar-gold)' }}>
            نرتقي معًا… لنصنع أثرًا في كل حصة
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button onClick={() => navigate('/login')} className="btn-primary text-lg px-8 py-4">
            <ArrowLeft size={20} />
            تسجيل الدخول
          </button>
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-xl font-cairo font-bold text-lg transition-all"
            style={{ background: 'transparent', border: '2px solid var(--qatar-gold)', color: 'white' }}
          >
            تعرف على النظام
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 cursor-pointer"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown size={32} className="animate-bounce" style={{ color: 'var(--qatar-gold)' }} />
        </motion.div>
      </div>
    </section>
  );
}

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
          نرتقي معًا… لنصنع أثرًا في كل حصة
        </p>
        <p className="font-tajawal text-xs" style={{ color: 'var(--gray-500)' }}>
          © 2025 — نظام ارتقاء | جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <RolesSection />
      <Footer />
    </div>
  );
}
