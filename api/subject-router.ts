import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subjects } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const subjectRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().query.subjects.findMany({
      orderBy: [desc(subjects.createdAt)],
    });
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.subjects.findFirst({
        where: eq(subjects.id, input.id),
      });
    }),

  create: publicQuery
    .input(z.object({ name: z.string().min(1), nameEn: z.string().optional(), coordinatorId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const result = await getDb().insert(subjects).values({
        name: input.name,
        nameEn: input.nameEn || null,
        coordinatorId: input.coordinatorId || null,
      }).$returningId();
      return result;
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameEn: z.string().optional(),
      coordinatorId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
      if (data.coordinatorId !== undefined) updateData.coordinatorId = data.coordinatorId;
      await getDb().update(subjects).set(updateData).where(eq(subjects.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(subjects).where(eq(subjects.id, input.id));
      return { success: true };
    }),
});
