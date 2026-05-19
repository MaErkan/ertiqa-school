import { createClient } from '@supabase/supabase-js';
import type { VisitData } from '@/contexts/CloudSyncContext';

// ═══════════════════════════════════════════════════════════════
// Supabase Configuration
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://xsfyzaulvpuendytrkmi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZnl6YXVsdnB1ZW5keXRya21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTk3OTgsImV4cCI6MjA5NDY5NTc5OH0.6gmcz2cYkn8oDKxSe9cGZBFVEwQkti9rSOG-SK3sDds';

const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

// ─── Create Supabase client ───
export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 100,
        },
      },
    })
  : null;

export const VISITS_TABLE = 'visits';

export const isSupabaseConnected = () => {
  return isConfigured && supabase !== null;
};

// ─── Test connection ──
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase client not initialized' };
  }
  try {
    const { error } = await supabase.from(VISITS_TABLE).select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, message: `Table error: ${error.message}` };
    }
    return { success: true, message: 'Connected to Supabase successfully!' };
  } catch (e) {
    return { success: false, message: `Connection failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ─── Types ───
export interface VisitRow {
  id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_role: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  coordinator_id: string;
  coordinator_name: string;
  class_name: string;
  visit_date: string;
  visit_time: string;
  visit_duration: string;
  score_objectives: number;
  score_student_engagement: number;
  score_discipline: number;
  score_teacher_engagement: number;
  score_environment: number;
  score_total: number;
  notes: string;
  status: string;
  device_id: string;
  created_at: string;
}

export function visitToRow(v: VisitData): any {
  return {
    id: v.id,
    visitor_id: v.visitorId,
    visitor_name: v.visitorName,
    visitor_role: v.visitorRole,
    teacher_id: v.teacherId,
    teacher_name: v.teacherName,
    subject_id: v.subjectId,
    subject_name: v.subjectName,
    coordinator_id: v.coordinatorId,
    coordinator_name: v.coordinatorName,
    class_name: v.className,
    visit_date: v.visitDate,
    visit_time: v.visitTime,
    visit_duration: v.visitDuration,
    score_objectives: v.scoreObjectives,
    score_student_engagement: v.scoreStudentEngagement,
    score_discipline: v.scoreDiscipline,
    score_teacher_engagement: v.scoreTeacherEngagement,
    score_environment: v.scoreEnvironment,
    score_total: v.scoreTotal,
    notes: v.notes,
    status: v.status,
    device_id: v.deviceId || '',
  };
}

export function rowToVisit(r: any): VisitData {
  return {
    id: r.id,
    visitorId: r.visitor_id,
    visitorName: r.visitor_name,
    visitorRole: r.visitor_role,
    teacherId: r.teacher_id,
    teacherName: r.teacher_name,
    subjectId: r.subject_id,
    subjectName: r.subject_name,
    coordinatorId: r.coordinator_id || '',
    coordinatorName: r.coordinator_name || '',
    className: r.class_name,
    visitDate: r.visit_date,
    visitTime: r.visit_time,
    visitDuration: r.visit_duration,
    scoreObjectives: r.score_objectives || 0,
    scoreStudentEngagement: r.score_student_engagement || 0,
    scoreDiscipline: r.score_discipline || 0,
    scoreTeacherEngagement: r.score_teacher_engagement || 0,
    scoreEnvironment: r.score_environment || 0,
    scoreTotal: r.score_total,
    notes: r.notes || '',
    status: r.status as 'sent' | 'draft',
    visibleTo: [],
    createdAt: r.created_at,
    deviceId: r.device_id || '',
  };
}
