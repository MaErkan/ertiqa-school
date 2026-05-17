import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  supabase, isSupabaseConfigured, VISITS_TABLE,
  visitToRow, rowToVisit,
} from '@/lib/supabase';
import type { Visit } from '@/data/demoData';
import { sampleVisits } from '@/data/demoData';
import { useAuth } from './AuthContext';

/* ─── Notification with target audience ─── */
interface CloudNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'visit' | 'report' | 'sync';
  timestamp: number;
  /* who should see this notification */
  targetRoles: string[];       // e.g. ['manager','academic_vp','coordinator']
  targetSubjectId?: string;    // for coordinator-specific notifications
  triggeredBy?: string;        // role that triggered it (to avoid self-notification)
}

interface CloudSyncContextType {
  visits: Visit[];
  addVisit: (visit: Visit) => Promise<boolean>;
  getVisitsForUser: () => Visit[];
  getVisitsForCoordinator: (subjectId: string) => Visit[];
  notifications: CloudNotification[];
  myNotifications: CloudNotification[]; // filtered for current user
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
  lastSyncTime: string;
  syncStatus: 'online' | 'offline' | 'syncing';
  cloudEnabled: boolean;
  exportData: () => string;
  importData: (json: string) => boolean;
  pushToCloud: () => Promise<boolean>;
  pullFromCloud: () => Promise<boolean>;
}

const STORAGE_KEY = 'ertiqa_visits_v3';
const NOTIF_KEY = 'ertiqa_notifications_v3';
const SYNC_CHANNEL = 'ertiqa_realtime_sync';

function loadLocalVisits(): Visit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [...sampleVisits];
}

function loadLocalNotifications(): CloudNotification[] {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveLocal(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

function nowTime(): string {
  return new Date().toLocaleTimeString('ar-QA');
}

const CloudSyncContext = createContext<CloudSyncContextType>({
  visits: [],
  addVisit: async () => false,
  getVisitsForUser: () => [],
  getVisitsForCoordinator: () => [],
  notifications: [],
  myNotifications: [],
  markNotificationRead: () => {},
  markAllRead: () => {},
  unreadCount: 0,
  lastSyncTime: '',
  syncStatus: 'syncing',
  cloudEnabled: false,
  exportData: () => '',
  importData: () => false,
  pushToCloud: async () => false,
  pullFromCloud: async () => false,
});

/* ─── Smart notification routing ─── */
function createVisitNotifications(visit: Visit): CloudNotification[] {
  const baseMsg = `قام ${visit.visitorName} بزيارة ${visit.teacherName} — ${visit.subjectName} — ${visit.className}`;
  const triggeredBy = visit.visitorRole;
  const results: CloudNotification[] = [];

  // 1. Notification for the SUBJECT COORDINATOR
  // When manager/deputy visits → coordinator of the subject gets notified
  if (visit.coordinatorId || visit.coordinatorName) {
    results.push({
      id: 'notif-coord-' + Date.now(),
      title: 'زيارة صفية لمادة إشرافك ☁️',
      message: baseMsg + ` (المنسق: ${visit.coordinatorName})`,
      time: 'الآن',
      read: false,
      type: 'visit',
      timestamp: Date.now(),
      targetRoles: ['coordinator'],
      targetSubjectId: visit.subjectId,
      triggeredBy,
    });
  }

  // 2. Notification for ACADEMIC VP
  // When coordinator visits → academic VP gets notified
  if (triggeredBy.includes('منسق')) {
    results.push({
      id: 'notif-vp-' + Date.now(),
      title: 'زيارة منسق جديدة 📋',
      message: baseMsg,
      time: 'الآن',
      read: false,
      type: 'visit',
      timestamp: Date.now(),
      targetRoles: ['manager', 'academic_vp'],
      triggeredBy,
    });
  }

  // 3. Notification for MANAGER
  // All visits reach the manager
  if (triggeredBy.includes('منسق') || triggeredBy.includes('نائب')) {
    results.push({
      id: 'notif-mgr-' + (Date.now() + 1),
      title: 'زيارة صفية في المدرسة 🏫',
      message: baseMsg + ` — بواسطة ${visit.visitorRole}`,
      time: 'الآن',
      read: false,
      type: 'visit',
      timestamp: Date.now(),
      targetRoles: ['manager'],
      triggeredBy,
    });
  }

  // 4. ADMIN VP notification for discipline/behavior related
  if (visit.scoreDiscipline < 3) {
    results.push({
      id: 'notif-adm-' + Date.now(),
      title: '⚠️ ملاحظة انضباطية',
      message: `انضباط ${visit.className}: ${visit.scoreDiscipline}/5 — ${visit.teacherName}`,
      time: 'الآن',
      read: false,
      type: 'report',
      timestamp: Date.now(),
      targetRoles: ['admin_vp', 'manager'],
      triggeredBy,
    });
  }

  // 5. Generic broadcast (for everyone who should see it)
  results.push({
    id: 'notif-all-' + Date.now(),
    title: 'زيارة جديدة ☁️',
    message: baseMsg,
    time: 'الآن',
    read: false,
    type: 'visit',
    timestamp: Date.now(),
    targetRoles: ['manager', 'academic_vp', 'admin_vp', 'coordinator'],
    targetSubjectId: visit.subjectId,
    triggeredBy,
  });

  return results;
}

/* ─── Filter notifications for current user ─── */
function filterNotificationsForUser(
  notifications: CloudNotification[],
  userRole?: string,
  userSubjectId?: string
): CloudNotification[] {
  if (!userRole) return [];
  return notifications.filter(n => {
    // Role-based filter
    const roleMatch = n.targetRoles.some(r => {
      if (userRole === 'manager') return r === 'manager';        // manager sees manager-targeted
      if (userRole === 'academic_vp') return r === 'academic_vp' || r === 'manager'; // VP sees VP+manager
      if (userRole === 'admin_vp') return r === 'admin_vp' || r === 'manager';        // admin VP sees admin+manager
      if (userRole === 'coordinator') return r === 'coordinator'; // coordinator sees coordinator-targeted
      if (userRole === 'sysadmin') return true;                   // sysadmin sees all
      return false;
    });

    // For coordinators: only see notifications for THEIR subject
    if (userRole === 'coordinator' && n.targetSubjectId) {
      return roleMatch && n.targetSubjectId === userSubjectId;
    }

    return roleMatch;
  });
}

export const CloudSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>(loadLocalVisits);
  const [notifications, setNotifications] = useState<CloudNotification[]>(loadLocalNotifications);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState(nowTime);
  const [cloudEnabled] = useState(isSupabaseConfigured());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const hasPulled = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter notifications for current user
  const myNotifications = filterNotificationsForUser(notifications, user?.role, user?.subjectId);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  /* ─── Persist ─── */
  useEffect(() => { saveLocal(STORAGE_KEY, visits); }, [visits]);
  useEffect(() => { saveLocal(NOTIF_KEY, notifications); }, [notifications]);

  /* ─── BroadcastChannel: instant cross-tab ─── */
  useEffect(() => {
    const channel = new BroadcastChannel(SYNC_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event) => {
      const msg = event.data as { type: string; visit?: Visit; notifications?: CloudNotification[] };
      if (msg.type === 'new_visit' && msg.visit) {
        setVisits(prev => {
          if (prev.find(v => v.id === msg.visit!.id)) return prev;
          return [msg.visit!, ...prev];
        });
        // Create and store targeted notifications
        const newNotifs = createVisitNotifications(msg.visit);
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 100));
        setLastSyncTime(nowTime());
        setSyncStatus('online');
      } else if (msg.type === 'sync_notifs' && msg.notifications) {
        setNotifications(prev => [...msg.notifications!, ...prev].slice(0, 100));
      }
    };
    return () => channel.close();
  }, []);

  /* ─── Supabase Realtime + Polling ─── */
  useEffect(() => {
    if (!cloudEnabled || !supabase) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');

    const sub = supabase
      .channel('visits-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: VISITS_TABLE },
        (payload) => {
          const row = payload.new as unknown as Parameters<typeof rowToVisit>[0];
          const visit = rowToVisit(row);
          setVisits(prev => {
            if (prev.find(v => v.id === visit.id)) return prev;
            return [visit, ...prev];
          });
          const newNotifs = createVisitNotifications(visit);
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 100));
          setLastSyncTime(nowTime());
          setSyncStatus('online');
          // Broadcast notifications to other tabs
          if (channelRef.current) {
            channelRef.current.postMessage({ type: 'sync_notifs', notifications: newNotifs });
          }
        }
      )
      .subscribe((status: string) => {
        setSyncStatus(status === 'SUBSCRIBED' ? 'online' : 'offline');
      });

    // Initial pull
    if (!hasPulled.current) {
      hasPulled.current = true;
      pullFromCloudEffect();
    }

    // Polling every 8 seconds for cross-network sync
    pollIntervalRef.current = setInterval(async () => {
      if (!cloudEnabled || !supabase) return;
      try {
        const { data, error } = await supabase
          .from(VISITS_TABLE)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) return;
        if (data && data.length > 0) {
          const cloudVisits = data.map(rowToVisit);
          setVisits(prev => {
            const merged = [...cloudVisits];
            prev.forEach(v => { if (!merged.find(m => m.id === v.id)) merged.push(v); });
            return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        }
      } catch { /* ignore */ }
    }, 8000);

    return () => {
      sub.unsubscribe();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudEnabled]);

  async function pullFromCloudEffect() {
    if (!cloudEnabled || !supabase) return;
    try {
      setSyncStatus('syncing');
      const { data, error } = await supabase.from(VISITS_TABLE).select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      if (data && data.length > 0) {
        const cloudVisits = data.map(rowToVisit);
        setVisits(prev => {
          const merged = [...cloudVisits];
          prev.forEach(v => { if (!merged.find(m => m.id === v.id)) merged.push(v); });
          return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
      }
      setSyncStatus('online');
      setLastSyncTime(nowTime());
    } catch { setSyncStatus('offline'); }
  }

  /* ─── addVisit with smart notifications ─── */
  const addVisit = useCallback(async (visit: Visit): Promise<boolean> => {
    try {
      setSyncStatus('syncing');

      // 1. Save locally
      setVisits(prev => [visit, ...prev]);

      // 2. Broadcast to other tabs
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'new_visit', visit });
      }

      // 3. Create SMART notifications (targeted by role)
      const newNotifs = createVisitNotifications(visit);
      setNotifications(prev => [...newNotifs, ...prev].slice(0, 100));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'sync_notifs', notifications: newNotifs });
      }

      // 4. Push to Supabase cloud
      if (cloudEnabled && supabase) {
        try {
          const row = visitToRow(visit);
          await supabase.from(VISITS_TABLE).upsert(row, { onConflict: 'id' });
        } catch { /* still saved locally */ }
      }

      setLastSyncTime(nowTime());
      setSyncStatus(cloudEnabled ? 'online' : 'offline');
      return true;
    } catch {
      setSyncStatus('offline');
      return false;
    }
  }, [cloudEnabled]);

  const pushToCloud = useCallback(async (): Promise<boolean> => {
    if (!cloudEnabled || !supabase) return false;
    setSyncStatus('syncing');
    try {
      const rows = visits.map(visitToRow);
      for (let i = 0; i < rows.length; i += 50) {
        await supabase.from(VISITS_TABLE).upsert(rows.slice(i, i + 50), { onConflict: 'id' });
      }
      setSyncStatus('online');
      setLastSyncTime(nowTime());
      return true;
    } catch { setSyncStatus('offline'); return false; }
  }, [cloudEnabled, visits]);

  const pullFromCloud = useCallback(async (): Promise<boolean> => {
    if (!cloudEnabled || !supabase) return false;
    setSyncStatus('syncing');
    try {
      const { data, error } = await supabase.from(VISITS_TABLE).select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      if (data && data.length > 0) {
        setVisits(prev => {
          const merged = [...data.map(rowToVisit)];
          prev.forEach(v => { if (!merged.find(m => m.id === v.id)) merged.push(v); });
          return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
      }
      setSyncStatus('online');
      setLastSyncTime(nowTime());
      return true;
    } catch { setSyncStatus('offline'); return false; }
  }, [cloudEnabled]);

  const getVisitsForUser = useCallback((): Visit[] => visits, [visits]);

  const getVisitsForCoordinator = useCallback(
    (subjectId: string): Visit[] => visits.filter(v => v.subjectId === subjectId),
    [visits]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    if (!user?.role) return;
    setNotifications(prev => prev.map(n => {
      // Only mark notifications that are actually targeted at the current user
      const isTargeted = n.targetRoles.some(r => {
        if (user.role === 'manager') return r === 'manager';
        if (user.role === 'academic_vp') return r === 'academic_vp' || r === 'manager';
        if (user.role === 'admin_vp') return r === 'admin_vp' || r === 'manager';
        if (user.role === 'coordinator') {
          if (r !== 'coordinator') return false;
          // Coordinator only sees their own subject
          if (n.targetSubjectId) return n.targetSubjectId === user.subjectId;
          return true;
        }
        if (user.role === 'sysadmin') return true;
        return false;
      });
      if (!isTargeted) return n;
      return { ...n, read: true };
    }));
  }, [user?.role, user?.subjectId]);

  const exportData = useCallback((): string => {
    return JSON.stringify({ visits, notifications, exportTime: new Date().toISOString(), version: '3.0' }, null, 2);
  }, [visits, notifications]);

  const importData = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.visits && Array.isArray(parsed.visits)) {
        setVisits(parsed.visits);
        if (parsed.notifications) setNotifications(parsed.notifications);
        setLastSyncTime(nowTime());
        return true;
      }
      return false;
    } catch { return false; }
  }, []);

  return (
    <CloudSyncContext.Provider value={{
      visits, addVisit, getVisitsForUser, getVisitsForCoordinator,
      notifications, myNotifications, markNotificationRead, markAllRead,
      unreadCount, lastSyncTime, syncStatus, cloudEnabled,
      exportData, importData, pushToCloud, pullFromCloud,
    }}>
      {children}
    </CloudSyncContext.Provider>
  );
};

export const useCloudSync = () => useContext(CloudSyncContext);
