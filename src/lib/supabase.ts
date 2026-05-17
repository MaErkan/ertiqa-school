import { createClient } from '@supabase/supabase-js';
import type { Visit } from '@/data/demoData';

// ═══════════════════════════════════════════════════════════════
// Supabase Production Configuration
// Project: zfvqgfmcprncvcwcupe
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://zfvqgfmcprncvcwcupe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdnFnZm1jcHBybmN2Y3djdXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDAyMjksImV4cCI6MjA5NDU3NjIyOX0.Kz1p7KT6gRNgKRlzAhlk4SeZWCnxehtoTDo1jbWE9i4';

const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

// ─── Types for DB rows ───
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
  score_students: number;
  score_discipline: number;
  score_teacher_interaction: number;
  score_safe_environment: number;
  average_score: number;
  key_observations: string;
  status: string;
  created_at: string;
}

// ─── Create client ───
export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  : null;

export const VISITS_TABLE = 'visits';
export const isSupabaseConfigured = () => isConfigured && supabase !== null;

// ─── Visit → DB Row ───
export function visitToRow(v: Visit): Omit<VisitRow, 'created_at'> {
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
    score_students: v.scoreStudents,
    score_discipline: v.scoreDiscipline,
    score_teacher_interaction: v.scoreTeacherInteraction,
    score_safe_environment: v.scoreSafeEnvironment,
    average_score: v.averageScore,
    key_observations: v.keyObservations,
    status: v.status,
  };
}

// ─── DB Row → Visit ───
export function rowToVisit(r: VisitRow): Visit {
  return {
    id: r.id,
    visitorId: r.visitor_id,
    visitorName: r.visitor_name,
    visitorRole: r.visitor_role,
    teacherId: r.teacher_id,
    teacherName: r.teacher_name,
    subjectId: r.subject_id,
    subjectName: r.subject_name,
    coordinatorId: r.coordinator_id,
    coordinatorName: r.coordinator_name,
    className: r.class_name,
    visitDate: r.visit_date,
    visitTime: r.visit_time,
    visitDuration: r.visit_duration,
    scoreObjectives: r.score_objectives,
    scoreStudents: r.score_students,
    scoreDiscipline: r.score_discipline,
    scoreTeacherInteraction: r.score_teacher_interaction,
    scoreSafeEnvironment: r.score_safe_environment,
    averageScore: r.average_score,
    keyObservations: r.key_observations,
    status: r.status as 'sent' | 'draft',
    visibleTo: [r.visitor_id, r.coordinator_id],
    createdAt: r.created_at,
  };
}
