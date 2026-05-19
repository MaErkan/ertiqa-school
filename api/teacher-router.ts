import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { teachers } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const teacherRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().query.teachers.findMany({
      orderBy: [desc(teachers.createdAt)],
    });
  }),

  bySubject: publicQuery
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.teachers.findMany({
        where: eq(teachers.subjectId, input.subjectId),
        orderBy: [desc(teachers.createdAt)],
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.teachers.findFirst({
        where: eq(teachers.id, input.id),
      });
    }),

  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      subjectId: z.number(),
      isCoordinator: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const result = await getDb().insert(teachers).values({
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        subjectId: input.subjectId,
        isCoordinator: input.isCoordinator,
      }).$returningId();
      return result;
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      subjectId: z.number().optional(),
      isCoordinator: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
      if (data.isCoordinator !== undefined) updateData.isCoordinator = data.isCoordinator;
      await getDb().update(teachers).set(updateData).where(eq(teachers.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(teachers).where(eq(teachers.id, input.id));
      return { success: true };
    }),
});
