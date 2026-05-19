import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { schoolUsers } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const schoolUserRouter = createRouter({
  /* ─── List all users ─── */
  list: publicQuery.query(async () => {
    return getDb().query.schoolUsers.findMany({
      orderBy: [desc(schoolUsers.createdAt)],
    });
  }),

  /* ─── Get by ID ─── */
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.schoolUsers.findFirst({
        where: eq(schoolUsers.id, input.id),
      });
    }),

  /* ─── Get by role ─── */
  byRole: publicQuery
    .input(z.object({ role: z.enum(["manager", "academic_vp", "admin_vp", "coordinator", "sysadmin"]) }))
    .query(async ({ input }) => {
      return getDb().query.schoolUsers.findMany({
        where: eq(schoolUsers.role, input.role),
        orderBy: [desc(schoolUsers.createdAt)],
      });
    }),

  /* ─── Get coordinator by subject ─── */
  coordinatorBySubject: publicQuery
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.schoolUsers.findFirst({
        where: and(
          eq(schoolUsers.role, "coordinator"),
          eq(schoolUsers.subjectId, input.subjectId),
        ),
      });
    }),

  /* ─── Login (name + password) ─── */
  login: publicQuery
    .input(z.object({ name: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const users = await getDb().query.schoolUsers.findMany({
        where: and(
          eq(schoolUsers.name, input.name),
          eq(schoolUsers.password, input.password),
          eq(schoolUsers.isActive, true),
        ),
      });
      if (users.length === 0) return null;
      return users[0];
    }),

  /* ─── Create ─── */
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        password: z.string().default("ertiqa123"),
        role: z.enum(["manager", "academic_vp", "admin_vp", "coordinator", "sysadmin"]),
        subjectId: z.number().optional(),
        avatar: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await getDb()
        .insert(schoolUsers)
        .values({
          name: input.name,
          email: input.email || null,
          password: input.password,
          role: input.role,
          subjectId: input.subjectId || null,
          avatar: input.avatar || null,
          isActive: true,
        })
        .$returningId();
      return result;
    }),

  /* ─── Update ─── */
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().optional(),
        password: z.string().optional(),
        role: z.enum(["manager", "academic_vp", "admin_vp", "coordinator", "sysadmin"]).optional(),
        subjectId: z.number().optional(),
        avatar: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.password !== undefined) updateData.password = data.password;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      await getDb().update(schoolUsers).set(updateData).where(eq(schoolUsers.id, id));
      return { success: true };
    }),

  /* ─── Delete ─── */
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(schoolUsers).where(eq(schoolUsers.id, input.id));
      return { success: true };
    }),
});
