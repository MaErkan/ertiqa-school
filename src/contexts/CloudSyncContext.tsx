import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { subjects as demoSubjects, teachers as demoTeachers } from '@/data/demoData';
import { supabase, VISITS_TABLE, visitToRow, rowToVisit, testSupabaseConnection } from '@/lib/supabase';

export interface CloudNotification {
  id: string;
  title: string;
  message: string;
  type: 'visit' | 'report' | 'sync' | 'system';
  read: boolean;
  targetRoles: string[];
  targetSubjectId?: string;
  triggeredBy?: string;
  createdAt: string;
}

export interface VisitData {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorRole: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  coordinatorId: string;
  coordinatorName: string;
  className: string;
  visitDate: string;
  visitTime: string;
  visitDuration: string;
  scoreObjectives: number;
  scoreStudentEngagement: number;
  scoreDiscipline: number;
  scoreTeacherEngagement: number;
  scoreEnvironment: number;
  scoreTotal: number;
  notes: string;
  status: 'sent' | 'draft';
  visibleTo: string[];
  createdAt: string;
  deviceId?: string;
}

interface CloudSyncContextType {
  visits: VisitData[];
  notifications: CloudNotification[];
  myNotifications: CloudNotification[];
  unreadCount: number;
  lastSyncTime: string;
  syncStatus: 'online' | 'offline' | 'syncing';
  cloudEnabled: boolean;
  subjects: typeof demoSubjects;
  teachers: typeof demoTeachers;
  toast: { show: boolean; message: string; type: string } | null;
  addVisit: (visit: Omit<VisitData, 'id' | 'createdAt' | 'visibleTo'>) => Promise<void>;
  syncVisits: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<boolean>;
  pushToCloud: () => Promise<void>;
  pullFromCloud: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  isWeekend: (dateStr: string) => boolean;
  syncStats: { online: boolean; supabase: boolean; syncedDevices: number };
  clearToast: () => void;
}

const CloudSyncContext = createContext<CloudSyncContextType>({
  visits: [],
  notifications: [],
  myNotifications: [],
  unreadCount: 0,
  lastSyncTime: '',
  syncStatus: 'offline',
  cloudEnabled: false,
  subjects: demoSubjects,
  teachers: demoTeachers,
  toast: null,
  addVisit: async () => {},
  syncVisits: async () => {},
  exportData: async () => '',
  importData: async () => false,
  pushToCloud: async () => {},
  pullFromCloud: async () => {},
  markNotificationRead: () => {},
  markAllRead: () => {},
  isWeekend: () => false,
  syncStats: { online: false, supabase: false, syncedDevices: 0 },
  clearToast: () => {},
});

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    manager: 'مدير المدرسة', academic_vp: 'النائب الأكاديمي',
    admin_vp: 'النائب الإداري', coordinator: 'منسق مادة', sysadmin: 'مسؤول النظام',
  };
  return labels[role] || role;
}

function routeNotifications(visit: VisitData): CloudNotification[] {
  const notifs: CloudNotification[] = [];
  const time = Date.now();

  if (visit.coordinatorId) {
    notifs.push({
      id: `n_${time}_c_${visit.subjectId}`,
      title: `زيارة لمادة ${visit.subjectName}`,
      message: `${visit.visitorName} (${roleLabel(visit.visitorRole)}) زار ${visit.teacherName} — ${visit.className}`,
      type: 'visit', read: false, targetRoles: ['coordinator'],
      targetSubjectId: visit.subjectId, triggeredBy: visit.visitorRole,
      createdAt: new Date().toISOString(),
    });
  }

  notifs.push({
    id: `n_${time}_m`,
    title: `زيارة صفية جديدة`,
    message: `${visit.visitorName} (${roleLabel(visit.visitorRole)}) زار ${visit.teacherName} — ${visit.subjectName}`,
    type: 'visit', read: false, targetRoles: ['manager'],
    triggeredBy: visit.visitorRole,
    createdAt: new Date().toISOString(),
  });

  if (visit.visitorRole === 'coordinator' || visit.visitorRole === 'manager') {
    notifs.push({
      id: `n_${time}_avp`, title: `زيارة من ${roleLabel(visit.visitorRole)}`,
      message: `${visit.visitorName} زار ${visit.teacherName} — ${visit.subjectName}`,
      type: 'visit', read: false, targetRoles: ['academic_vp'],
      triggeredBy: visit.visitorRole,
      createdAt: new Date().toISOString(),
    });
  }

  if (visit.scoreDiscipline < 3) {
    notifs.push({
      id: `n_${time}_d`, title: `⚠️ تنبيه انضباط`,
      message: `درجة الانضباط ${visit.scoreDiscipline}/5 — ${visit.visitorName} → ${visit.teacherName}`,
      type: 'report', read: false, targetRoles: ['admin_vp', 'manager'],
      triggeredBy: visit.visitorRole,
      createdAt: new Date().toISOString(),
    });
  }

  if (visit.scoreTotal < 2.5) {
    notifs.push({
      id: `n_${time}_l`, title: `⚠️ أداء منخفض — ${visit.teacherName}`,
      message: `متوسط ${visit.scoreTotal}/5 في ${visit.subjectName}`,
      type: 'report', read: false, targetRoles: ['coordinator', 'manager'],
      targetSubjectId: visit.subjectId, triggeredBy: visit.visitorRole,
      createdAt: new Date().toISOString(),
    });
  }

  return notifs;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN PROVIDER — Optimized for SPEED
// ═══════════════════════════════════════════════════════════════════════════
export const CloudSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<VisitData[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_visits') || '[]'); }
    catch { return []; }
  });
  const [notifications, setNotifications] = useState<CloudNotification[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]'); }
    catch { return []; }
  });
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('offline');
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [syncStats, setSyncStats] = useState({ online: false, supabase: false, syncedDevices: 0 });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: string } | null>(null);

  const knownIdsRef = useRef(new Set<string>(
    JSON.parse(localStorage.getItem('ertiqa_visits') || '[]').map((v: VisitData) => v.id)
  ));
  const prevCountRef = useRef(knownIdsRef.current.size);

  // ── Toast helper ──
  const showToast = useCallback((message: string, type: string = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  // ── Supabase connection test ──
  useEffect(() => {
    testSupabaseConnection().then(r => {
      setCloudEnabled(r.success);
      setSyncStats(prev => ({ ...prev, supabase: r.success }));
      setSyncStatus(navigator.onLine ? 'online' : 'offline');
    });
  }, []);

  // ═════════════════════════════════════════════════════════════════
  //  ULTRA-FAST CLOUD SYNC — 500ms polling + immediate events
  // ═════════════════════════════════════════════════════════════════
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      if (!mounted || !supabase || !navigator.onLine) return;

      try {
        const { data, error } = await supabase
          .from(VISITS_TABLE)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error || !data) return;

        const cloudVisits: VisitData[] = data.map(rowToVisit);
        const newVisits = cloudVisits.filter(v => !knownIdsRef.current.has(v.id));

        if (newVisits.length > 0) {
          newVisits.forEach(v => knownIdsRef.current.add(v.id));

          // Save to localStorage
          const allVisits = [...newVisits, ...cloudVisits.filter(v => !newVisits.includes(v))];
          localStorage.setItem('ertiqa_visits', JSON.stringify(allVisits));

          // FORCE RE-RENDER with new array reference
          setVisits([...allVisits]);

          // Generate notifications
          const allNotifs: CloudNotification[] = [];
          newVisits.forEach(v => {
            const notifs = routeNotifications(v);
            notifs.forEach(n => allNotifs.push(n));
          });

          if (allNotifs.length > 0) {
            setNotifications(prev => [...allNotifs, ...prev]);
            const existingNotifs = JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]');
            localStorage.setItem('ertiqa_notifications', JSON.stringify([...allNotifs, ...existingNotifs].slice(0, 500)));
          }

          // SHOW TOAST immediately
          if (newVisits.length === 1) {
            const v = newVisits[0];
            showToast(`زيارة جديدة: ${v.visitorName} → ${v.teacherName}`, 'visit');
          } else {
            showToast(`${newVisits.length} زيارات جديدة من أجهزة أخرى`, 'sync');
          }

          // Browser notification + Service Worker push
          newVisits.forEach(v => {
            // 1. Standard notification (foreground)
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('زيارة جديدة — ارتقاء', {
                  body: `${v.visitorName} زار ${v.teacherName} (${v.subjectName})`,
                  icon: '/pwa-icon-192.png',
                  dir: 'rtl',
                  tag: v.id,
                });
              } catch { /* */ }
            }
            // 2. Service Worker push (works in background)
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.active?.postMessage({
                  type: 'LOCAL_PUSH',
                  title: `زيارة جديدة — ${v.visitorName}`,
                  body: `زار ${v.teacherName} — ${v.subjectName} — ${v.className}`,
                  tag: v.id,
                });
              });
            }
          });

          // Vibrate
          if ('vibrate' in navigator) {
            try { navigator.vibrate([100, 50, 100]); } catch { /* */ }
          }

          // Update badge
          if ('setAppBadge' in navigator) {
            try { (navigator as any).setAppBadge(allNotifs.filter(n => !n.read).length); } catch { /* */ }
          }

          setLastSyncTime(new Date().toLocaleTimeString('ar-QA'));
          setSyncStatus('online');
        }
      } catch { /* ignore */ }
    };

    // Poll every 300ms for near-realtime
    const timer = setInterval(poll, 300);
    poll(); // Initial

    // BroadcastChannel — instant same-browser sync
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('ertiqa_sync');
        bc.onmessage = () => {
          if (!mounted) return;
          console.log('[Ertiqa] Broadcast — forcing sync');
          // Force re-read from localStorage
          try {
            const stored = JSON.parse(localStorage.getItem('ertiqa_visits') || '[]');
            setVisits([...stored]);
          } catch { /* */ }
        };
      } catch { /* */ }
    }

    // Storage event — cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (!mounted) return;
      if (e.key === 'ertiqa_visits') {
        try {
          const stored = JSON.parse(e.newValue || '[]');
          setVisits([...stored]);
        } catch { /* */ }
      }
      if (e.key === 'ertiqa_notifications') {
        try {
          const stored = JSON.parse(e.newValue || '[]');
          setNotifications([...stored]);
        } catch { /* */ }
      }
    };
    window.addEventListener('storage', handleStorage);

    // Visibility + focus
    const handleVisible = () => { if (!document.hidden) { poll(); } };
    const handleFocus = () => { poll(); };
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      clearInterval(timer);
      bc?.close();
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // ═════════════════════════════════════════════════════════════════
  //  ADD VISIT — Push to cloud + broadcast
  // ═════════════════════════════════════════════════════════════════
  const addVisit = useCallback(async (visitData: Omit<VisitData, 'id' | 'createdAt' | 'visibleTo'>) => {
    const deviceId = localStorage.getItem('ertiqa_device_id') || 'unknown';

    const newVisit: VisitData = {
      ...visitData,
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      visibleTo: ['manager', 'academic_vp', 'admin_vp', 'coordinator'],
      deviceId,
    };

    knownIdsRef.current.add(newVisit.id);

    // Update React state immediately
    setVisits(prev => [newVisit, ...prev]);

    // Save localStorage
    const current = JSON.parse(localStorage.getItem('ertiqa_visits') || '[]');
    localStorage.setItem('ertiqa_visits', JSON.stringify([newVisit, ...current]));

    // Push to Supabase
    if (supabase && navigator.onLine) {
      try {
        const { error } = await supabase.from(VISITS_TABLE).insert(visitToRow(newVisit));
        if (error) console.error('[Ertiqa] Cloud push error:', error.message);
      } catch (err) { console.error('[Ertiqa] Push exception:', err); }
    }

    // Generate notifications
    const notifs = routeNotifications(newVisit);
    notifs.forEach(n => setNotifications(prev => [n, ...prev]));
    const existingNotifs = JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]');
    localStorage.setItem('ertiqa_notifications', JSON.stringify([...notifs, ...existingNotifs].slice(0, 500)));

    // Broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      try { new BroadcastChannel('ertiqa_sync').postMessage('sync'); } catch { /* */ }
    }

    // Browser notification + Service Worker push
    if ('Notification' in window && Notification.permission === 'granted') {
      notifs.forEach(n => {
        try { new Notification(n.title, { body: n.message, icon: '/pwa-icon-192.png', dir: 'rtl' }); }
        catch { /* */ }
      });
    }
    // Send via Service Worker (works in background too)
    if ('serviceWorker' in navigator) {
      notifs.forEach(n => {
        navigator.serviceWorker.ready.then(reg => {
          reg.active?.postMessage({
            type: 'LOCAL_PUSH',
            title: n.title,
            body: n.message,
            tag: n.id,
          });
        });
      });
    }

    if ('vibrate' in navigator) {
      try { navigator.vibrate(200); } catch { /* */ }
    }
  }, []);

  // ── Pull / Push / Sync ──
  const pullFromCloud = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      if (!supabase || !navigator.onLine) { setSyncStatus('offline'); return; }
      const { data, error } = await supabase.from(VISITS_TABLE).select('*').order('created_at', { ascending: false }).limit(100);
      if (error) { setSyncStatus('offline'); return; }
      if (data) {
        const cloudVisits: VisitData[] = data.map(rowToVisit);
        cloudVisits.forEach(v => knownIdsRef.current.add(v.id));
        localStorage.setItem('ertiqa_visits', JSON.stringify(cloudVisits));
        setVisits([...cloudVisits]);
        setLastSyncTime(new Date().toLocaleTimeString('ar-QA'));
      }
      setSyncStatus('online');
    } catch { setSyncStatus('offline'); }
  }, []);

  const pushToCloud = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const localVisits = JSON.parse(localStorage.getItem('ertiqa_visits') || '[]');
      if (supabase && localVisits.length > 0) {
        const { error } = await supabase.from(VISITS_TABLE).upsert(localVisits.map(visitToRow), { onConflict: 'id' });
        if (!error) setLastSyncTime(new Date().toLocaleTimeString('ar-QA'));
      }
      setSyncStatus('online');
    } catch { setSyncStatus('offline'); }
  }, []);

  const syncVisits = useCallback(async () => { await pullFromCloud(); }, [pullFromCloud]);

  // ── Export / Import ──
  const exportData = useCallback(async () => {
    const v = JSON.parse(localStorage.getItem('ertiqa_visits') || '[]');
    const n = JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]');
    return JSON.stringify({ visits: v, notifications: n }, null, 2);
  }, []);

  const importData = useCallback(async (json: string) => {
    try {
      const d = JSON.parse(json);
      if (d.visits) { localStorage.setItem('ertiqa_visits', JSON.stringify(d.visits)); d.visits.forEach((v: VisitData) => knownIdsRef.current.add(v.id)); setVisits([...d.visits]); }
      if (d.notifications) { localStorage.setItem('ertiqa_notifications', JSON.stringify(d.notifications)); setNotifications([...d.notifications]); }
      return true;
    } catch { return false; }
  }, []);

  // ── Notifications ──
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const notifs = JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]');
    localStorage.setItem('ertiqa_notifications', JSON.stringify(notifs.map((n: CloudNotification) => n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const notifs = JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]');
    localStorage.setItem('ertiqa_notifications', JSON.stringify(notifs.map((n: CloudNotification) => ({ ...n, read: true }))));
    if ('setAppBadge' in navigator) { try { (navigator as any).clearAppBadge(); } catch { /* */ } }
  }, []);

  // ── Weekend ──
  const isWeekend = useCallback((dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getDay() === 5 || d.getDay() === 6;
  }, []);

  // ── Filtered notifications ──
  const myNotifications = (() => {
    if (!user?.role) return [];
    return notifications.filter(n => {
      if (!n.targetRoles?.length) return false;
      if (user.role === 'sysadmin') return true;
      const hasRole = n.targetRoles.some(r => {
        if (user.role === 'manager') return r === 'manager';
        if (user.role === 'academic_vp') return r === 'academic_vp' || r === 'manager';
        if (user.role === 'admin_vp') return r === 'admin_vp' || r === 'manager';
        if (user.role === 'coordinator') return r === 'coordinator';
        return false;
      });
      if (user.role === 'coordinator' && n.targetSubjectId) return hasRole && n.targetSubjectId === user.subjectId;
      return hasRole;
    });
  })();

  const unreadCount = myNotifications.filter(n => !n.read).length;

  return (
    <CloudSyncContext.Provider value={{
      visits, notifications, myNotifications, unreadCount,
      lastSyncTime, syncStatus, cloudEnabled,
      subjects: demoSubjects, teachers: demoTeachers,
      toast,
      addVisit, syncVisits, exportData, importData, pushToCloud, pullFromCloud,
      markNotificationRead, markAllRead, isWeekend,
      syncStats,
      clearToast,
    }}>
      {children}
    </CloudSyncContext.Provider>
  );
};

export const useCloudSync = () => useContext(CloudSyncContext);
