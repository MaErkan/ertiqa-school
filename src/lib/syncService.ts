// ═══════════════════════════════════════════════════════════════
//  Cloud Sync Service — Supabase Integration
//  ═══════════════════════════════════════════════════════════════

import { supabase, VISITS_TABLE, visitToRow, rowToVisit } from './supabase';
import type { VisitData } from '@/contexts/CloudSyncContext';

export const syncService = {

  /** Test if Supabase is reachable */
  async ping(): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from(VISITS_TABLE).select('id', { head: true }).limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  /** Fetch all visits from cloud (newest first) */
  async fetchAll(): Promise<VisitData[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(VISITS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase fetch error:', error.message);
      throw error;
    }
    return (data || []).map(rowToVisit);
  },

  /** Insert a single visit */
  async insert(visit: VisitData): Promise<void> {
    if (!supabase) throw new Error('Supabase not connected');
    const { error } = await supabase
      .from(VISITS_TABLE)
      .insert(visitToRow(visit));
    
    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      throw error;
    }
  },

  /** Insert multiple visits (bulk) */
  async insertMany(visits: VisitData[]): Promise<void> {
    if (!supabase || visits.length === 0) return;
    const { error } = await supabase
      .from(VISITS_TABLE)
      .insert(visits.map(visitToRow));
    
    if (error) {
      console.error('❌ Supabase bulk insert error:', error.message);
      throw error;
    }
  },

  /** Delete a visit by ID */
  async delete(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from(VISITS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Supabase delete error:', error.message);
      throw error;
    }
  },

  /** Subscribe to realtime changes */
  subscribeToChanges(onChange: () => void): () => void {
    if (!supabase) return () => {};
    
    const channel = supabase
      .channel('visits_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: VISITS_TABLE },
        () => {
          console.log('🔄 Realtime update received');
          onChange();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  },

  /** Get visit count */
  async getCount(): Promise<number> {
    if (!supabase) return 0;
    const { count, error } = await supabase
      .from(VISITS_TABLE)
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },
};
