import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { schoolUserRouter } from "./school-user-router";
import { subjectRouter } from "./subject-router";
import { teacherRouter } from "./teacher-router";
import { visitRouter } from "./visit-router";
import { notificationRouter } from "./notification-router";
import { analyticsRouter } from "./analytics-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  user: schoolUserRouter,
  subject: subjectRouter,
  teacher: teacherRouter,
  visit: visitRouter,
  notification: notificationRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
