import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  mysqlEnum,
  json,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

/* ─── 0. OAuth Users (keep for auth system) ─── */
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ─── 1. Subjects ─── */
export const subjects = mysqlTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  coordinatorId: bigint("coordinator_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("subjects_name_idx").on(table.name),
}));

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/* ─── 2. Teachers ─── */
export const teachers = mysqlTable("teachers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  subjectId: bigint("subject_id", { mode: "number", unsigned: true }).notNull(),
  isCoordinator: boolean("is_coordinator").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  subjectIdx: index("teachers_subject_idx").on(table.subjectId),
}));

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;

/* ─── 3. School Users (Principal, Deputies, Coordinators, SysAdmin) ─── */
export const schoolUsers = mysqlTable("school_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }).notNull().default("ertiqa123"),
  role: mysqlEnum("role", [
    "manager",
    "academic_vp",
    "admin_vp",
    "coordinator",
    "sysadmin",
  ]).notNull(),
  subjectId: bigint("subject_id", { mode: "number", unsigned: true }),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("school_users_role_idx").on(table.role),
  subjectIdx: index("school_users_subject_idx").on(table.subjectId),
}));

export type SchoolUser = typeof schoolUsers.$inferSelect;
export type InsertSchoolUser = typeof schoolUsers.$inferInsert;

/* ─── 4. Visits ─── */
export const visits = mysqlTable("visits", {
  id: serial("id").primaryKey(),
  visitorId: bigint("visitor_id", { mode: "number", unsigned: true }).notNull(),
  visitorName: varchar("visitor_name", { length: 255 }).notNull(),
  visitorRole: varchar("visitor_role", { length: 100 }).notNull(),
  teacherId: bigint("teacher_id", { mode: "number", unsigned: true }).notNull(),
  teacherName: varchar("teacher_name", { length: 255 }).notNull(),
  subjectId: bigint("subject_id", { mode: "number", unsigned: true }).notNull(),
  subjectName: varchar("subject_name", { length: 255 }).notNull(),
  coordinatorId: bigint("coordinator_id", { mode: "number", unsigned: true }),
  coordinatorName: varchar("coordinator_name", { length: 255 }),
  className: varchar("class_name", { length: 50 }).notNull(),
  visitDate: varchar("visit_date", { length: 50 }).notNull(),
  visitTime: varchar("visit_time", { length: 50 }).notNull(),
  scorePlanning: decimal("score_planning", { precision: 3, scale: 1 }).notNull(),
  scoreTeaching: decimal("score_teaching", { precision: 3, scale: 1 }).notNull(),
  scoreInteraction: decimal("score_interaction", { precision: 3, scale: 1 }).notNull(),
  scoreAssessment: decimal("score_assessment", { precision: 3, scale: 1 }).notNull(),
  scoreDiscipline: decimal("score_discipline", { precision: 3, scale: 1 }).notNull(),
  scoreTotal: decimal("score_total", { precision: 4, scale: 1 }).notNull(),
  notes: text("notes"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  recommendations: text("recommendations"),
  aiAnalysis: text("ai_analysis"),
  isSynced: boolean("is_synced").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  subjectIdx: index("visits_subject_idx").on(table.subjectId),
  visitorIdx: index("visits_visitor_idx").on(table.visitorId),
  dateIdx: index("visits_date_idx").on(table.visitDate),
}));

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = typeof visits.$inferInsert;

/* ─── 5. Notifications ─── */
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["visit", "report", "sync", "system"]).default("visit").notNull(),
  visitId: bigint("visit_id", { mode: "number", unsigned: true }),
  targetRoles: json("target_roles").$type<string[]>(),
  targetSubjectId: bigint("target_subject_id", { mode: "number", unsigned: true }),
  triggeredBy: varchar("triggered_by", { length: 100 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("notifications_type_idx").on(table.type),
  readIdx: index("notifications_read_idx").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/* ─── 6. Settings ─── */
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
