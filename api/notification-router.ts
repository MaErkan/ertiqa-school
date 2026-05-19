import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const notificationRouter = createRouter({
  /* ─── List all ─── */
  list: publicQuery.query(async () => {
    return getDb().query.notifications.findMany({
      orderBy: [desc(notifications.createdAt)],
      limit: 200,
    });
  }),

  /* ─── Filtered by role + subject ─── */
  forUser: publicQuery
    .input(z.object({
      role: z.string(),
      subjectId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const all = await getDb().query.notifications.findMany({
        orderBy: [desc(notifications.createdAt)],
        limit: 200,
      });

      return all.filter(n => {
        if (!n.targetRoles) return false;
        const roles = n.targetRoles as string[];

        const roleMatch = roles.some((r: string) => {
          if (input.role === "manager") return r === "manager";
          if (input.role === "academic_vp") return r === "academic_vp" || r === "manager";
          if (input.role === "admin_vp") return r === "admin_vp" || r === "manager";
          if (input.role === "coordinator") return r === "coordinator";
          if (input.role === "sysadmin") return true;
          return false;
        });

        if (input.role === "coordinator" && n.targetSubjectId) {
          return roleMatch && n.targetSubjectId === input.subjectId;
        }

        return roleMatch;
      });
    }),

  /* ─── Mark as read ─── */
  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  /* ─── Mark all read for user ─── */
  markAllRead: publicQuery
    .input(z.object({
      role: z.string(),
      subjectId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const userNotifs = await getDb().query.notifications.findMany({
        where: eq(notifications.isRead, false),
        orderBy: [desc(notifications.createdAt)],
        limit: 200,
      });

      for (const n of userNotifs) {
        if (!n.targetRoles) continue;
        const roles = n.targetRoles as string[];

        const roleMatch = roles.some((r: string) => {
          if (input.role === "manager") return r === "manager";
          if (input.role === "academic_vp") return r === "academic_vp" || r === "manager";
          if (input.role === "admin_vp") return r === "admin_vp" || r === "manager";
          if (input.role === "coordinator") return r === "coordinator";
          if (input.role === "sysadmin") return true;
          return false;
        });

        let shouldMark = roleMatch;
        if (input.role === "coordinator" && n.targetSubjectId) {
          shouldMark = roleMatch && n.targetSubjectId === input.subjectId;
        }

        if (shouldMark) {
          await getDb().update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, n.id));
        }
      }

      return { success: true };
    }),

  /* ─── Unread count ─── */
  unreadCount: publicQuery
    .input(z.object({
      role: z.string(),
      subjectId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const all = await getDb().query.notifications.findMany({
        where: eq(notifications.isRead, false),
        limit: 500,
      });

      return all.filter(n => {
        if (!n.targetRoles) return false;
        const roles = n.targetRoles as string[];

        const roleMatch = roles.some((r: string) => {
          if (input.role === "manager") return r === "manager";
          if (input.role === "academic_vp") return r === "academic_vp" || r === "manager";
          if (input.role === "admin_vp") return r === "admin_vp" || r === "manager";
          if (input.role === "coordinator") return r === "coordinator";
          if (input.role === "sysadmin") return true;
          return false;
        });

        if (input.role === "coordinator" && n.targetSubjectId) {
          return roleMatch && n.targetSubjectId === input.subjectId;
        }

        return roleMatch;
      }).length;
    }),

  /* ─── Delete old ─── */
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(notifications).where(eq(notifications.id, input.id));
      return { success: true };
    }),
});
