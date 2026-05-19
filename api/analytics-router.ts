import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { visits } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const analyticsRouter = createRouter({
  /* ─── Dashboard overview ─── */
  overview: publicQuery.query(async () => {
    const allVisits = await getDb().query.visits.findMany({
      orderBy: [desc(visits.createdAt)],
    });

    if (allVisits.length === 0) {
      return {
        totalVisits: 0,
        avgScore: 0,
        totalTeachers: 0,
        totalSubjects: 0,
        topSubject: "-",
        recentVisits: [],
        scoreBreakdown: [],
        subjectDistribution: [],
        weeklyTrend: [],
        teacherRankings: [],
      };
    }

    const avgScore = allVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / allVisits.length;

    const subjectCounts: Record<string, number> = {};
    const subjectScores: Record<string, { total: number; count: number }> = {};
    allVisits.forEach(v => {
      subjectCounts[v.subjectName] = (subjectCounts[v.subjectName] || 0) + 1;
      if (!subjectScores[v.subjectName]) subjectScores[v.subjectName] = { total: 0, count: 0 };
      subjectScores[v.subjectName].total += Number(v.scoreTotal);
      subjectScores[v.subjectName].count += 1;
    });

    const allSubjects = await getDb().query.subjects.findMany();

    const scoreBreakdown = [
      { name: "التخطيط", score: allVisits.reduce((s, v) => s + Number(v.scorePlanning), 0) / allVisits.length },
      { name: "التدريس", score: allVisits.reduce((s, v) => s + Number(v.scoreTeaching), 0) / allVisits.length },
      { name: "التفاعل", score: allVisits.reduce((s, v) => s + Number(v.scoreInteraction), 0) / allVisits.length },
      { name: "التقييم", score: allVisits.reduce((s, v) => s + Number(v.scoreAssessment), 0) / allVisits.length },
      { name: "الانضباط", score: allVisits.reduce((s, v) => s + Number(v.scoreDiscipline), 0) / allVisits.length },
    ];

    const subjectDistribution = Object.entries(subjectCounts).map(([name, count]) => ({
      name,
      count,
      avgScore: subjectScores[name] ? (subjectScores[name].total / subjectScores[name].count).toFixed(1) : "0",
    }));

    // Weekly trend (last 12 weeks)
    const now = new Date();
    const weeklyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekVisits = allVisits.filter(v => {
        const d = new Date(v.createdAt);
        return d >= weekStart && d < weekEnd;
      });
      const weekAvg = weekVisits.length > 0
        ? weekVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / weekVisits.length
        : 0;
      weeklyTrend.push({
        week: weekStart.toLocaleDateString("ar-QA", { month: "short", day: "numeric" }),
        visits: weekVisits.length,
        avgScore: Number(weekAvg.toFixed(1)),
      });
    }

    // Teacher rankings
    const teacherScores: Record<string, { name: string; subject: string; total: number; count: number }> = {};
    allVisits.forEach(v => {
      if (!teacherScores[v.teacherName]) {
        teacherScores[v.teacherName] = { name: v.teacherName, subject: v.subjectName, total: 0, count: 0 };
      }
      teacherScores[v.teacherName].total += Number(v.scoreTotal);
      teacherScores[v.teacherName].count += 1;
    });

    const teacherRankings = Object.values(teacherScores)
      .map(t => ({ name: t.name, subject: t.subject, avgScore: (t.total / t.count).toFixed(1), visits: t.count }))
      .sort((a, b) => Number(b.avgScore) - Number(a.avgScore));

    return {
      totalVisits: allVisits.length,
      avgScore: Number(avgScore.toFixed(1)),
      totalTeachers: new Set(allVisits.map(v => v.teacherName)).size,
      totalSubjects: allSubjects.length,
      topSubject: Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-",
      recentVisits: allVisits.slice(0, 10),
      scoreBreakdown,
      subjectDistribution,
      weeklyTrend,
      teacherRankings,
    };
  }),

  /* ─── Subject Analytics ─── */
  subjectAnalytics: publicQuery
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ input }) => {
      const subjectVisits = await getDb().query.visits.findMany({
        where: eq(visits.subjectId, input.subjectId),
        orderBy: [desc(visits.createdAt)],
      });

      if (subjectVisits.length === 0) return null;

      const avgScore = subjectVisits.reduce((s, v) => s + Number(v.scoreTotal), 0) / subjectVisits.length;

      const teacherScores: Record<string, { name: string; total: number; count: number }> = {};
      subjectVisits.forEach(v => {
        if (!teacherScores[v.teacherName]) teacherScores[v.teacherName] = { name: v.teacherName, total: 0, count: 0 };
        teacherScores[v.teacherName].total += Number(v.scoreTotal);
        teacherScores[v.teacherName].count += 1;
      });

      const teacherRankings = Object.values(teacherScores)
        .map(t => ({ name: t.name, avgScore: (t.total / t.count).toFixed(1), visits: t.count }))
        .sort((a, b) => Number(b.avgScore) - Number(a.avgScore));

      return {
        totalVisits: subjectVisits.length,
        avgScore: Number(avgScore.toFixed(1)),
        teacherRankings,
        recentVisits: subjectVisits.slice(0, 10),
      };
    }),

  /* ─── AI Recommendations ─── */
  aiRecommendations: publicQuery.query(async () => {
    const allVisits = await getDb().query.visits.findMany({
      orderBy: [desc(visits.createdAt)],
    });

    if (allVisits.length === 0) return [];

    const teacherData: Record<string, {
      name: string;
      subject: string;
      visits: typeof allVisits;
      avgTotal: number;
      strengths: string[];
      weaknesses: string[];
    }> = {};

    allVisits.forEach(v => {
      if (!teacherData[v.teacherName]) {
        teacherData[v.teacherName] = { name: v.teacherName, subject: v.subjectName, visits: [], avgTotal: 0, strengths: [], weaknesses: [] };
      }
      teacherData[v.teacherName].visits.push(v);
    });

    const recommendations = [];

    for (const [name, data] of Object.entries(teacherData)) {
      const scores = data.visits.map(v => ({
        planning: Number(v.scorePlanning),
        teaching: Number(v.scoreTeaching),
        interaction: Number(v.scoreInteraction),
        assessment: Number(v.scoreAssessment),
        discipline: Number(v.scoreDiscipline),
        total: Number(v.scoreTotal),
      }));

      const avgPlanning = scores.reduce((s, v) => s + v.planning, 0) / scores.length;
      const avgTeaching = scores.reduce((s, v) => s + v.teaching, 0) / scores.length;
      const avgInteraction = scores.reduce((s, v) => s + v.interaction, 0) / scores.length;
      const avgAssessment = scores.reduce((s, v) => s + v.assessment, 0) / scores.length;
      const avgDiscipline = scores.reduce((s, v) => s + v.discipline, 0) / scores.length;
      const avgTotal = scores.reduce((s, v) => s + v.total, 0) / scores.length;

      const strengths = [];
      const weaknesses = [];
      if (avgPlanning >= 4) strengths.push("التخطيط"); else if (avgPlanning < 3) weaknesses.push("التخطيط");
      if (avgTeaching >= 4) strengths.push("التدريس"); else if (avgTeaching < 3) weaknesses.push("التدريس");
      if (avgInteraction >= 4) strengths.push("التفاعل"); else if (avgInteraction < 3) weaknesses.push("التفاعل");
      if (avgAssessment >= 4) strengths.push("التقييم"); else if (avgAssessment < 3) weaknesses.push("التقييم");
      if (avgDiscipline >= 4) strengths.push("الانضباط"); else if (avgDiscipline < 3) weaknesses.push("الانضباط");

      const rec = {
        teacherName: name,
        subject: data.subject,
        avgTotal: Number(avgTotal.toFixed(1)),
        totalVisits: data.visits.length,
        strengths,
        weaknesses,
        trend: avgTotal >= 4 ? "متصاعد" : avgTotal >= 3 ? "مستقر" : "يحتاج تحسين",
        recommendation: avgTotal >= 4
          ? `أداء متميز! ${name} في ${data.subject} يقدم أداءً عاليًا. نوصي باستمرار الأداء وتبادل الخبرات مع المعلمين الجدد.`
          : avgTotal >= 3
          ? `أداء جيد ل${name} في ${data.subject}. ينصح بالتركيز على ${weaknesses.join(" و ")} للارتقاء بالأداء.`
          : `يحتاج ${name} في ${data.subject} إلى دعم فوري في ${weaknesses.join(" و ")}. نوصي بتنظيم ورشة تدريبية ومتابعة مستمرة.`,
      };

      recommendations.push(rec);
    }

    return recommendations.sort((a, b) => b.avgTotal - a.avgTotal);
  }),
});
