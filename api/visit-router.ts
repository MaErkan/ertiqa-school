import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { visits, notifications } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/* ─── Smart notification creation ─── */
async function createVisitNotifications(visit: typeof visits.$inferSelect) {
  const notifsToInsert: Array<{
    title: string;
    message: string;
    type: "visit" | "report" | "sync" | "system";
    visitId: number;
    targetRoles: string[];
    targetSubjectId: number | null;
    triggeredBy: string;
  }> = [];

  const baseMsg = `قام ${visit.visitorName} بزيارة ${visit.teacherName} — ${visit.subjectName} — ${visit.className}`;

  // 1. Coordinator notification
  if (visit.coordinatorId) {
    notifsToInsert.push({
      title: "زيارة صفية لمادة إشرافك ☁️",
      message: baseMsg,
      type: "visit",
      visitId: visit.id,
      targetRoles: ["coordinator"],
      targetSubjectId: visit.subjectId,
      triggeredBy: visit.visitorRole,
    });
  }

  // 2. Academic VP + Manager when coordinator visits
  if (visit.visitorRole.includes("منسق")) {
    notifsToInsert.push({
      title: "زيارة منسق جديدة 📋",
      message: baseMsg,
      type: "visit",
      visitId: visit.id,
      targetRoles: ["manager", "academic_vp"],
      targetSubjectId: null,
      triggeredBy: visit.visitorRole,
    });
  }

  // 3. Manager notification for all visits
  notifsToInsert.push({
    title: "زيارة صفية في المدرسة 🏫",
    message: baseMsg + ` — بواسطة ${visit.visitorRole}`,
    type: "visit",
    visitId: visit.id,
    targetRoles: ["manager"],
    targetSubjectId: null,
    triggeredBy: visit.visitorRole,
  });

  // 4. Discipline alert for admin VP
  const disciplineScore = Number(visit.scoreDiscipline);
  if (disciplineScore < 3) {
    notifsToInsert.push({
      title: "⚠️ ملاحظة انضباطية",
      message: `انضباط ${visit.className}: ${visit.scoreDiscipline}/5 — ${visit.teacherName}`,
      type: "report",
      visitId: visit.id,
      targetRoles: ["admin_vp", "manager"],
      targetSubjectId: null,
      triggeredBy: visit.visitorRole,
    });
  }

  // 5. Generic broadcast
  notifsToInsert.push({
    title: "زيارة جديدة ☁️",
    message: baseMsg,
    type: "visit",
    visitId: visit.id,
    targetRoles: ["manager", "academic_vp", "admin_vp", "coordinator"],
    targetSubjectId: visit.subjectId,
    triggeredBy: visit.visitorRole,
  });

  if (notifsToInsert.length > 0) {
    await getDb().insert(notifications).values(notifsToInsert);
  }
}

export const visitRouter = createRouter({
  /* ─── List all visits ─── */
  list: publicQuery.query(async () => {
    return getDb().query.visits.findMany({
      orderBy: [desc(visits.createdAt)],
      limit: 500,
    });
  }),

  /* ─── Get by ID ─── */
  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.visits.findFirst({
        where: eq(visits.id, input.id),
      });
    }),

  /* ─── Get by subject ─── */
  bySubject: publicQuery
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.visits.findMany({
        where: eq(visits.subjectId, input.subjectId),
        orderBy: [desc(visits.createdAt)],
      });
    }),

  /* ─── Get by visitor ─── */
  byVisitor: publicQuery
    .input(z.object({ visitorId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.visits.findMany({
        where: eq(visits.visitorId, input.visitorId),
        orderBy: [desc(visits.createdAt)],
      });
    }),

  /* ─── Get by teacher ─── */
  byTeacher: publicQuery
    .input(z.object({ teacherId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.visits.findMany({
        where: eq(visits.teacherId, input.teacherId),
        orderBy: [desc(visits.createdAt)],
      });
    }),

  /* ─── Get by date range ─── */
  byDateRange: publicQuery
    .input(z.object({ from: z.string(), to: z.string() }))
    .query(async ({ input }) => {
      return getDb().query.visits.findMany({
        where: and(
          gte(visits.visitDate, input.from),
          lte(visits.visitDate, input.to),
        ),
        orderBy: [desc(visits.createdAt)],
      });
    }),

  /* ─── Create visit + smart notifications ─── */
  create: publicQuery
    .input(z.object({
      visitorId: z.number(),
      visitorName: z.string(),
      visitorRole: z.string(),
      teacherId: z.number(),
      teacherName: z.string(),
      subjectId: z.number(),
      subjectName: z.string(),
      coordinatorId: z.number().optional(),
      coordinatorName: z.string().optional(),
      className: z.string(),
      visitDate: z.string(),
      visitTime: z.string(),
      scorePlanning: z.number(),
      scoreTeaching: z.number(),
      scoreInteraction: z.number(),
      scoreAssessment: z.number(),
      scoreDiscipline: z.number(),
      scoreTotal: z.number(),
      notes: z.string().optional(),
      strengths: z.string().optional(),
      improvements: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await getDb().insert(visits).values({
        visitorId: input.visitorId,
        visitorName: input.visitorName,
        visitorRole: input.visitorRole,
        teacherId: input.teacherId,
        teacherName: input.teacherName,
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        coordinatorId: input.coordinatorId || null,
        coordinatorName: input.coordinatorName || null,
        className: input.className,
        visitDate: input.visitDate,
        visitTime: input.visitTime,
        scorePlanning: input.scorePlanning.toString(),
        scoreTeaching: input.scoreTeaching.toString(),
        scoreInteraction: input.scoreInteraction.toString(),
        scoreAssessment: input.scoreAssessment.toString(),
        scoreDiscipline: input.scoreDiscipline.toString(),
        scoreTotal: input.scoreTotal.toString(),
        notes: input.notes || null,
        strengths: input.strengths || null,
        improvements: input.improvements || null,
        recommendations: input.recommendations || null,
      }).$returningId();

      // Create smart notifications
      const visitId = result[0].id;
      const fullVisit = await getDb().query.visits.findFirst({
        where: eq(visits.id, visitId),
      });
      if (fullVisit) {
        await createVisitNotifications(fullVisit);
      }

      return { id: visitId };
    }),

  /* ─── Update visit ─── */
  update: publicQuery
    .input(z.object({
      id: z.number(),
      visitorId: z.number().optional(),
      visitorName: z.string().optional(),
      teacherId: z.number().optional(),
      teacherName: z.string().optional(),
      subjectId: z.number().optional(),
      subjectName: z.string().optional(),
      className: z.string().optional(),
      visitDate: z.string().optional(),
      visitTime: z.string().optional(),
      scorePlanning: z.number().optional(),
      scoreTeaching: z.number().optional(),
      scoreInteraction: z.number().optional(),
      scoreAssessment: z.number().optional(),
      scoreDiscipline: z.number().optional(),
      scoreTotal: z.number().optional(),
      notes: z.string().optional(),
      strengths: z.string().optional(),
      improvements: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.visitorId !== undefined) updateData.visitorId = data.visitorId;
      if (data.visitorName !== undefined) updateData.visitorName = data.visitorName;
      if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
      if (data.teacherName !== undefined) updateData.teacherName = data.teacherName;
      if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
      if (data.subjectName !== undefined) updateData.subjectName = data.subjectName;
      if (data.className !== undefined) updateData.className = data.className;
      if (data.visitDate !== undefined) updateData.visitDate = data.visitDate;
      if (data.visitTime !== undefined) updateData.visitTime = data.visitTime;
      if (data.scorePlanning !== undefined) updateData.scorePlanning = data.scorePlanning.toString();
      if (data.scoreTeaching !== undefined) updateData.scoreTeaching = data.scoreTeaching.toString();
      if (data.scoreInteraction !== undefined) updateData.scoreInteraction = data.scoreInteraction.toString();
      if (data.scoreAssessment !== undefined) updateData.scoreAssessment = data.scoreAssessment.toString();
      if (data.scoreDiscipline !== undefined) updateData.scoreDiscipline = data.scoreDiscipline.toString();
      if (data.scoreTotal !== undefined) updateData.scoreTotal = data.scoreTotal.toString();
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.strengths !== undefined) updateData.strengths = data.strengths;
      if (data.improvements !== undefined) updateData.improvements = data.improvements;
      if (data.recommendations !== undefined) updateData.recommendations = data.recommendations;

      await getDb().update(visits).set(updateData).where(eq(visits.id, id));
      return { success: true };
    }),

  /* ─── Delete visit ─── */
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(visits).where(eq(visits.id, input.id));
      return { success: true };
    }),

  /* ─── AI Analysis ─── */
  aiAnalyze: publicQuery
    .input(z.object({ teacherId: z.number() }))
    .query(async ({ input }) => {
      const teacherVisits = await getDb().query.visits.findMany({
        where: eq(visits.teacherId, input.teacherId),
        orderBy: [desc(visits.createdAt)],
        limit: 20,
      });

      if (teacherVisits.length === 0) return null;

      const avgPlanning = teacherVisits.reduce((s, v) => s + Number(v.scorePlanning), 0) / teacherVisits.length;
      const avgTeaching = teacherVisits.reduce((s, v) => s + Number(v.scoreTeaching), 0) / teacherVisits.length;
      const avgInteraction = teacherVisits.reduce((s, v) => s + Number(v.scoreInteraction), 0) / teacherVisits.length;
      const avgAssessment = teacherVisits.reduce((s, v) => s + Number(v.scoreAssessment), 0) / teacherVisits.length;
      const avgDiscipline = teacherVisits.reduce((s, v) => s + Number(v.scoreDiscipline), 0) / teacherVisits.length;
      const avgTotal = teacherVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / teacherVisits.length;

      const latestVisit = teacherVisits[0];

      // Generate AI recommendations
      const weaknesses = [];
      if (avgPlanning < 3.5) weaknesses.push("التخطيط الدراسي");
      if (avgTeaching < 3.5) weaknesses.push("أسلوب التدريس");
      if (avgInteraction < 3.5) weaknesses.push("التفاعل مع الطلاب");
      if (avgAssessment < 3.5) weaknesses.push("التقييم");
      if (avgDiscipline < 3.5) weaknesses.push("الانضباط الصفي");

      const strengths = [];
      if (avgPlanning >= 4) strengths.push("التخطيط الدراسي");
      if (avgTeaching >= 4) strengths.push("أسلوب التدريس");
      if (avgInteraction >= 4) strengths.push("التفاعل مع الطلاب");
      if (avgAssessment >= 4) strengths.push("التقييم");
      if (avgDiscipline >= 4) strengths.push("الانضباط الصفي");

      return {
        teacherName: latestVisit.teacherName,
        subjectName: latestVisit.subjectName,
        totalVisits: teacherVisits.length,
        avgPlanning: avgPlanning.toFixed(1),
        avgTeaching: avgTeaching.toFixed(1),
        avgInteraction: avgInteraction.toFixed(1),
        avgAssessment: avgAssessment.toFixed(1),
        avgDiscipline: avgDiscipline.toFixed(1),
        avgTotal: avgTotal.toFixed(1),
        strengths,
        weaknesses,
        trend: avgTotal >= 4 ? "متصاعد" : avgTotal >= 3 ? "مستقر" : "يحتاج تحسين",
        recommendation: avgTotal >= 4
          ? `ممتاز! أداء ${latestVisit.teacherName} متميز في مادة ${latestVisit.subjectName}. نوصي باستمرار الأداء وتبادل الخبرات مع المعلمين الجدد.`
          : avgTotal >= 3
          ? `أداء جيد ل${latestVisit.teacherName} في مادة ${latestVisit.subjectName}. ينصح بالتركيز على ${weaknesses.join(" و ")} للارتقاء بالأداء.`
          : `يحتاج ${latestVisit.teacherName} في مادة ${latestVisit.subjectName} إلى دعم فوري في ${weaknesses.join(" و ")}. نوصي بتنظيم ورشة تدريبية ومتابعة مستمرة.`,
        latestNotes: latestVisit.notes || "",
      };
    }),

  /* ─── Stats / KPIs ─── */
  stats: publicQuery.query(async () => {
    const allVisits = await getDb().query.visits.findMany({
      orderBy: [desc(visits.createdAt)],
    });

    if (allVisits.length === 0) {
      return { totalVisits: 0, avgScore: 0, totalTeachers: 0, topSubject: "-" };
    }

    const avgScore = allVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / allVisits.length;

    const subjectCounts: Record<string, number> = {};
    allVisits.forEach(v => {
      subjectCounts[v.subjectName] = (subjectCounts[v.subjectName] || 0) + 1;
    });
    const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    return {
      totalVisits: allVisits.length,
      avgScore: Number(avgScore.toFixed(1)),
      totalTeachers: new Set(allVisits.map(v => v.teacherName)).size,
      topSubject,
    };
  }),
});
