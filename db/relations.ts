import { relations } from "drizzle-orm";
import { subjects, teachers, schoolUsers, visits } from "./schema";

export const subjectsRelations = relations(subjects, ({ many, one }) => ({
  teachers: many(teachers),
  coordinator: one(schoolUsers, {
    fields: [subjects.coordinatorId],
    references: [schoolUsers.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ one }) => ({
  subject: one(subjects, {
    fields: [teachers.subjectId],
    references: [subjects.id],
  }),
}));

export const schoolUsersRelations = relations(schoolUsers, ({ one }) => ({
  subject: one(subjects, {
    fields: [schoolUsers.subjectId],
    references: [subjects.id],
  }),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  subject: one(subjects, {
    fields: [visits.subjectId],
    references: [subjects.id],
  }),
}));
