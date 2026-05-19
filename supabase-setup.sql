-- ═══════════════════════════════════════════════════════════════
--  إعداد Supabase لنظام ارتقاء
--  انسخ هذا الملف والصقه في Supabase SQL Editor
--  ═══════════════════════════════════════════════════════════════

-- 1. إنشاء جدول الزيارات
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_role TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  coordinator_id TEXT,
  coordinator_name TEXT,
  class_name TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  visit_time TEXT NOT NULL,
  visit_duration TEXT NOT NULL,
  score_planning INTEGER NOT NULL DEFAULT 0,
  score_teaching INTEGER NOT NULL DEFAULT 0,
  score_interaction INTEGER NOT NULL DEFAULT 0,
  score_assessment INTEGER NOT NULL DEFAULT 0,
  score_discipline INTEGER NOT NULL DEFAULT 0,
  score_total REAL NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. تفعيل الأمان
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 3. السماح بجميع العمليات (للتجربة)
DROP POLICY IF EXISTS "Allow all" ON visits;
CREATE POLICY "Allow all" ON visits FOR ALL USING (true) WITH CHECK (true);

-- 4. تفعيل Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE visits;

-- 5. إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'visit',
  read BOOLEAN NOT NULL DEFAULT false,
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  target_subject_id TEXT,
  triggered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all notifications" ON notifications;
CREATE POLICY "Allow all notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- تم بنجاح! ✅
SELECT 'Database ready for Ertiqa!' as status;
