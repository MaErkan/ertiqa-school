/* ═══════════════════════════════════════════════════════════════════════════════
   ERTIQA SYNC ENGINE v6 — Production-Ready Cloud Sync with Debug
   ═══════════════════════════════════════════════════════════════════════════ */

import type { VisitData, CloudNotification } from '@/contexts/CloudSyncContext';
import { supabase, VISITS_TABLE, visitToRow, rowToVisit, isSupabaseConnected } from './supabase';

function getDeviceId(): string {
  let id = localStorage.getItem('ertiqa_device_id');
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('ertiqa_device_id', id);
  }
  return id;
}

export class SyncEngine {
  private deviceId = getDeviceId();
  private bc: BroadcastChannel | null = null;
  private onVisitCb: ((v: VisitData) => void) | null = null;
  private onNotifCb: ((n: CloudNotification) => void) | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isOnline = navigator.onLine;
  private syncing = false;
  private lastSyncTime = '';
  private syncCount = 0;

  async start(opts: {
    onVisit: (v: VisitData) => void;
    onNotification: (n: CloudNotification) => void;
  }) {
    this.onVisitCb = opts.onVisit;
    this.onNotifCb = opts.onNotif;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel('ertiqa_v6');
        this.bc.onmessage = (ev) => {
          if (ev.data.deviceId === this.deviceId) return;
          if (ev.data.type === 'SYNC') {
            this.broadcastSyncToReact();
          }
        };
      } catch { /* */ }
    }

    // Initial sync
    await this.syncFromCloud();

    // Poll every 1 second
    this.pollTimer = setInterval(() => this.syncFromCloud(), 1000);

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.syncFromCloud();
    });

    // Online
    window.addEventListener('online', () => { this.isOnline = true; this.syncFromCloud(); });
    window.addEventListener('offline', () => { this.isOnline = false; });

    console.log('[Ertiqa] SyncEngine v6 started');
  }

  stop() {
    this.bc?.close();
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  // ════════════════════════════════════════════════════════════════
  // ADD VISIT — push to cloud IMMEDIATELY
  // ════════════════════════════════════════════════════════════════
  async addVisit(visit: VisitData): Promise<void> {
    // Save local
    this.saveLocalVisit(visit);

    // Broadcast
    if (this.bc) {
      try { this.bc.postMessage({ type: 'SYNC', deviceId: this.deviceId }); } catch { /* */ }
    }

    // Push to Supabase
    if (this.isOnline && supabase) {
      try {
        const row = visitToRow(visit);
        const { error } = await supabase.from(VISITS_TABLE).insert(row);
        if (error) {
          console.error('[Ertiqa] Cloud push error:', error.message);
        } else {
          console.log('[Ertiqa] Visit pushed to cloud successfully:', visit.id);
        }
      } catch (err) {
        console.error('[Ertiqa] Push exception:', err);
      }
    }
  }

  async sendNotification(notif: CloudNotification): Promise<void> {
    this.saveLocalNotification(notif);
    this.onNotifCb?.(notif);
  }

  // ════════════════════════════════════════════════════════════════
  // SYNC FROM CLOUD — the HEART of cross-device sync
  // ════════════════════════════════════════════════════════════════
  async syncFromCloud(): Promise<void> {
    if (!this.isOnline || !supabase || this.syncing) return;
    this.syncing = true;

    try {
      const { data, error } = await supabase
        .from(VISITS_TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Ertiqa] Pull error:', error.message);
        this.syncing = false;
        return;
      }

      if (data && data.length > 0) {
        // Convert all cloud rows to visits
        const cloudVisits: VisitData[] = data.map(rowToVisit);

        // Get local visits
        const localVisits = this.getLocalVisits();
        const localIds = new Set(localVisits.map(v => v.id));

        // Find NEW visits (not in local)
        const newVisits = cloudVisits.filter(cv => !localIds.has(cv.id));

        if (newVisits.length > 0) {
          console.log(`[Ertiqa] FOUND ${newVisits.length} NEW VISIT(S) FROM CLOUD!`);

          // Merge: new visits first
          const merged = [...newVisits, ...localVisits];
          localStorage.setItem('ertiqa_visits', JSON.stringify(merged));

          // Notify React
          this.broadcastSyncToReact();

          // Notify for each visit
          for (const v of newVisits) {
            this.onVisitCb?.(v);
          }

          // Browser notifications
          for (const v of newVisits) {
            if (v.deviceId !== this.deviceId) {
              this.showBrowserNotification(v);
            }
          }

          this.syncCount += newVisits.length;
          this.lastSyncTime = new Date().toLocaleTimeString('ar-QA');
          console.log('[Ertiqa] Synced:', this.lastSyncTime, '| Total synced:', this.syncCount);
        }
      }
    } catch (err) {
      console.error('[Ertiqa] Sync exception:', err);
    } finally {
      this.syncing = false;
    }
  }

  async syncWithCloud(): Promise<void> { await this.syncFromCloud(); }
  async forceSync(): Promise<void> { await this.syncFromCloud(); }

  // ════════════════════════════════════════════════════════════════
  // INTERNAL
  // ════════════════════════════════════════════════════════════════

  private broadcastSyncToReact() {
    try {
      window.dispatchEvent(new CustomEvent('ertiqa:sync', {
        detail: { timestamp: Date.now(), deviceId: this.deviceId }
      }));
    } catch { /* */ }
  }

  private saveLocalVisit(v: VisitData) {
    const visits = this.getLocalVisits();
    if (!visits.some(e => e.id === v.id)) {
      visits.unshift(v);
      localStorage.setItem('ertiqa_visits', JSON.stringify(visits));
    }
  }

  private saveLocalNotification(n: CloudNotification) {
    const notifs = this.getLocalNotifications();
    if (!notifs.some(e => e.id === n.id)) {
      notifs.unshift(n);
      localStorage.setItem('ertiqa_notifications', JSON.stringify(notifs.slice(0, 500)));
    }
  }

  getLocalVisits(): VisitData[] {
    try { return JSON.parse(localStorage.getItem('ertiqa_visits') || '[]'); }
    catch { return []; }
  }

  getLocalNotifications(): CloudNotification[] {
    try { return JSON.parse(localStorage.getItem('ertiqa_notifications') || '[]'); }
    catch { return []; }
  }

  private showBrowserNotification(visit: VisitData) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('زيارة جديدة — ارتقاء', {
          body: `${visit.visitorName} زار ${visit.teacherName} (${visit.subjectName})`,
          icon: '/pwa-icon-192.png',
          dir: 'rtl',
        });
      } catch { /* */ }
    }
  }

  // ════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════════════════════════

  async getAllVisits(): Promise<VisitData[]> { return this.getLocalVisits(); }
  async getAllNotifications(): Promise<CloudNotification[]> { return this.getLocalNotifications(); }

  async markNotifRead(id: string): Promise<void> {
    const notifs = this.getLocalNotifications();
    const n = notifs.find(x => x.id === id);
    if (n) { n.read = true; localStorage.setItem('ertiqa_notifications', JSON.stringify(notifs)); }
  }

  async markAllRead(): Promise<void> {
    const notifs = this.getLocalNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem('ertiqa_notifications', JSON.stringify(notifs));
  }

  async exportData() {
    return { visits: this.getLocalVisits(), notifications: this.getLocalNotifications() };
  }

  async importData(data: { visits?: VisitData[]; notifications?: CloudNotification[] }) {
    if (data.visits) localStorage.setItem('ertiqa_visits', JSON.stringify(data.visits));
    if (data.notifications) localStorage.setItem('ertiqa_notifications', JSON.stringify(data.notifications));
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem('ertiqa_visits');
    localStorage.removeItem('ertiqa_notifications');
  }

  getStatus() {
    return {
      online: this.isOnline,
      supabase: isSupabaseConnected(),
      deviceId: this.deviceId,
      lastSync: this.lastSyncTime,
      syncedCount: this.syncCount,
    };
  }
}

export const syncEngine = new SyncEngine();
