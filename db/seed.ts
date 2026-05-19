import { getDb } from "../api/queries/connection";
import { subjects, schoolUsers, teachers } from "./schema";

async function seed() {
  const db = getDb();
  console.log("🌱 Seeding database...");

  // ─── 1. Subjects ───
  const existingSubjects = await db.query.subjects.findMany();
  if (existingSubjects.length === 0) {
    console.log("Seeding subjects...");
    const subjectData = [
      { name: "اللغة العربية", nameEn: "Arabic" },
      { name: "اللغة الإنجليزية", nameEn: "English" },
      { name: "الرياضيات", nameEn: "Mathematics" },
      { name: "الفيزياء", nameEn: "Physics" },
      { name: "الكيمياء", nameEn: "Chemistry" },
      { name: "الأحياء", nameEn: "Biology" },
      { name: "العلوم", nameEn: "Science" },
      { name: "الدراسات الاجتماعية", nameEn: "Social Studies" },
      { name: "التربية الإسلامية", nameEn: "Islamic Studies" },
      { name: "التربية البدنية", nameEn: "Physical Education" },
      { name: "الحاسوب", nameEn: "Computer" },
    ];
    for (const s of subjectData) {
      await db.insert(subjects).values(s);
    }
  }

  // ─── 2. School Users ───
  const existingUsers = await db.query.schoolUsers.findMany();
  if (existingUsers.length === 0) {
    console.log("Seeding school users...");
    const userData = [
      // Management
      { name: "أحمد عبدالله الخاطر", email: "manager@ertiqa.edu.qa", password: "ertiqa123", role: "manager" as const, subjectId: undefined },
      { name: "محمد حسن العبيدلي", email: "academic_vp@ertiqa.edu.qa", password: "ertiqa123", role: "academic_vp" as const, subjectId: undefined },
      { name: "خالد سلمان المنصوري", email: "admin_vp@ertiqa.edu.qa", password: "ertiqa123", role: "admin_vp" as const, subjectId: undefined },
      // SysAdmin
      { name: "يوسف عبدالرحمن الجاسم", email: "sysadmin1@ertiqa.edu.qa", password: "ertiqa123", role: "sysadmin" as const, subjectId: undefined },
      { name: "أحمد رمضان سالم", email: "sysadmin2@ertiqa.edu.qa", password: "ertiqa123", role: "sysadmin" as const, subjectId: undefined },
      // Coordinators (with subjectIds 1-11)
      { name: "عبدالله محمد الحمادي", email: "coord_arabic@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 1 },
      { name: "طارق سليمان الرميحي", email: "coord_english@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 2 },
      { name: "فاطمة أحمد الحنزاب", email: "coord_math@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 3 },
      { name: "نورة خالد الكعبي", email: "coord_physics@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 4 },
      { name: "عبدالرحمن محمد الكواري", email: "coord_chemistry@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 5 },
      { name: "مريم سعيد المنصوري", email: "coord_biology@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 6 },
      { name: "حمد عبدالله الحنزاب", email: "coord_science@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 7 },
      { name: "عائشة سالم المري", email: "coord_social@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 8 },
      { name: "فهد محمد النعيمي", email: "coord_islamic@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 9 },
      { name: "لطيفة أحمد الكعبي", email: "coord_pe@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 10 },
      { name: "مبارك عبدالله النعيمي", email: "coord_computer@ertiqa.edu.qa", password: "ertiqa123", role: "coordinator" as const, subjectId: 11 },
    ];
    for (const u of userData) {
      await db.insert(schoolUsers).values(u);
    }
  }

  // ─── 3. Teachers ───
  const existingTeachers = await db.query.teachers.findMany();
  if (existingTeachers.length === 0) {
    console.log("Seeding teachers...");
    const teacherData = [
      // Arabic (subjectId: 1)
      { name: "أحمد محمد الكعبي", email: "t1@ertiqa.edu.qa", subjectId: 1 },
      { name: "عبدالله سالم المري", email: "t2@ertiqa.edu.qa", subjectId: 1 },
      { name: "نورة أحمد الحنزاب", email: "t3@ertiqa.edu.qa", subjectId: 1 },
      { name: "فاطمة خالد الكعبي", email: "t4@ertiqa.edu.qa", subjectId: 1 },
      { name: "محمد عبدالله النعيمي", email: "t5@ertiqa.edu.qa", subjectId: 1 },
      { name: "عائشة سلمان المنصوري", email: "t6@ertiqa.edu.qa", subjectId: 1 },
      { name: "خالد أحمد الرميحي", email: "t7@ertiqa.edu.qa", subjectId: 1 },
      // English (subjectId: 2)
      { name: "سارة محمد الكعبي", email: "t8@ertiqa.edu.qa", subjectId: 2 },
      { name: "عمر سالم الحنزاب", email: "t9@ertiqa.edu.qa", subjectId: 2 },
      { name: "ليلى أحمد المري", email: "t10@ertiqa.edu.qa", subjectId: 2 },
      { name: "راشد عبدالله الكواري", email: "t11@ertiqa.edu.qa", subjectId: 2 },
      { name: "مريم خالد النعيمي", email: "t12@ertiqa.edu.qa", subjectId: 2 },
      { name: "فهد سلمان الرميحي", email: "t13@ertiqa.edu.qa", subjectId: 2 },
      { name: "نورة محمد المنصوري", email: "t14@ertiqa.edu.qa", subjectId: 2 },
      // Math (subjectId: 3)
      { name: "علي عبدالله الكعبي", email: "t15@ertiqa.edu.qa", subjectId: 3 },
      { name: "حمدة سالم الحنزاب", email: "t16@ertiqa.edu.qa", subjectId: 3 },
      { name: "يوسف أحمد المري", email: "t17@ertiqa.edu.qa", subjectId: 3 },
      { name: "فاطمة محمد الكواري", email: "t18@ertiqa.edu.qa", subjectId: 3 },
      { name: "خالد عبدالله النعيمي", email: "t19@ertiqa.edu.qa", subjectId: 3 },
      { name: "عبدالرحمن سلمان الرميحي", email: "t20@ertiqa.edu.qa", subjectId: 3 },
      { name: "مبارك محمد المنصوري", email: "t21@ertiqa.edu.qa", subjectId: 3 },
      // Physics (subjectId: 4)
      { name: "صالح عبدالله الكعبي", email: "t22@ertiqa.edu.qa", subjectId: 4 },
      { name: "هند سالم الحنزاب", email: "t23@ertiqa.edu.qa", subjectId: 4 },
      { name: "طلال أحمد المري", email: "t24@ertiqa.edu.qa", subjectId: 4 },
      { name: "عبدالله محمد الكواري", email: "t25@ertiqa.edu.qa", subjectId: 4 },
      { name: "منى عبدالله النعيمي", email: "t26@ertiqa.edu.qa", subjectId: 4 },
      { name: "محمد سلمان الرميحي", email: "t27@ertiqa.edu.qa", subjectId: 4 },
      // Chemistry (subjectId: 5)
      { name: "عبدالله أحمد الكعبي", email: "t28@ertiqa.edu.qa", subjectId: 5 },
      { name: "مريم سالم الحنزاب", email: "t29@ertiqa.edu.qa", subjectId: 5 },
      { name: "أحمد محمد المري", email: "t30@ertiqa.edu.qa", subjectId: 5 },
      { name: "نورة عبدالله الكواري", email: "t31@ertiqa.edu.qa", subjectId: 5 },
      { name: "خالد سلمان النعيمي", email: "t32@ertiqa.edu.qa", subjectId: 5 },
      { name: "فاطمة محمد الرميحي", email: "t33@ertiqa.edu.qa", subjectId: 5 },
      // Biology (subjectId: 6)
      { name: "محمد عبدالله الحنزاب", email: "t34@ertiqa.edu.qa", subjectId: 6 },
      { name: "عائشة سالم الكعبي", email: "t35@ertiqa.edu.qa", subjectId: 6 },
      { name: "راشد أحمد المري", email: "t36@ertiqa.edu.qa", subjectId: 6 },
      { name: "مريم عبدالله الكواري", email: "t37@ertiqa.edu.qa", subjectId: 6 },
      { name: "فهد سلمان النعيمي", email: "t38@ertiqa.edu.qa", subjectId: 6 },
      // Science (subjectId: 7)
      { name: "عبدالله محمد الرميحي", email: "t39@ertiqa.edu.qa", subjectId: 7 },
      { name: "نورة سالم الحنزاب", email: "t40@ertiqa.edu.qa", subjectId: 7 },
      { name: "أحمد عبدالله الكعبي", email: "t41@ertiqa.edu.qa", subjectId: 7 },
      { name: "فاطمة أحمد المري", email: "t42@ertiqa.edu.qa", subjectId: 7 },
      { name: "خالد محمد الكواري", email: "t43@ertiqa.edu.qa", subjectId: 7 },
      { name: "عمر سلمان النعيمي", email: "t44@ertiqa.edu.qa", subjectId: 7 },
      { name: "لطيفة عبدالله الرميحي", email: "t45@ertiqa.edu.qa", subjectId: 7 },
      // Social Studies (subjectId: 8)
      { name: "حمد أحمد الكعبي", email: "t46@ertiqa.edu.qa", subjectId: 8 },
      { name: "مبارك سالم الحنزاب", email: "t47@ertiqa.edu.qa", subjectId: 8 },
      { name: "نورة عبدالله المري", email: "t48@ertiqa.edu.qa", subjectId: 8 },
      { name: "محمد أحمد الكواري", email: "t49@ertiqa.edu.qa", subjectId: 8 },
      { name: "عبدالرحمن سلمان النعيمي", email: "t50@ertiqa.edu.qa", subjectId: 8 },
      // Islamic (subjectId: 9)
      { name: "عبدالله أحمد الحنزاب", email: "t51@ertiqa.edu.qa", subjectId: 9 },
      { name: "فاطمة محمد الكعبي", email: "t52@ertiqa.edu.qa", subjectId: 9 },
      { name: "خالد سالم المري", email: "t53@ertiqa.edu.qa", subjectId: 9 },
      { name: "مريم عبدالله الكواري", email: "t54@ertiqa.edu.qa", subjectId: 9 },
      { name: "أحمد سلمان النعيمي", email: "t55@ertiqa.edu.qa", subjectId: 9 },
      { name: "عائشة محمد الرميحي", email: "t56@ertiqa.edu.qa", subjectId: 9 },
      { name: "فهد عبدالله الحنزاب", email: "t57@ertiqa.edu.qa", subjectId: 9 },
      // PE (subjectId: 10)
      { name: "عبدالله سالم الكعبي", email: "t58@ertiqa.edu.qa", subjectId: 10 },
      { name: "محمد أحمد الحنزاب", email: "t59@ertiqa.edu.qa", subjectId: 10 },
      { name: "نورة عبدالله المري", email: "t60@ertiqa.edu.qa", subjectId: 10 },
      { name: "خالد محمد الكواري", email: "t61@ertiqa.edu.qa", subjectId: 10 },
      { name: "راشد سلمان النعيمي", email: "t62@ertiqa.edu.qa", subjectId: 10 },
      // Computer (subjectId: 11)
      { name: "أحمد عبدالله الكعبي", email: "t63@ertiqa.edu.qa", subjectId: 11 },
      { name: "فاطمة سالم الحنزاب", email: "t64@ertiqa.edu.qa", subjectId: 11 },
      { name: "عمر أحمد المري", email: "t65@ertiqa.edu.qa", subjectId: 11 },
      { name: "مريم عبدالله الكواري", email: "t66@ertiqa.edu.qa", subjectId: 11 },
      { name: "محمد سلمان النعيمي", email: "t67@ertiqa.edu.qa", subjectId: 11 },
      { name: "نورة أحمد الرميحي", email: "t68@ertiqa.edu.qa", subjectId: 11 },
      { name: "خالد محمد المنصوري", email: "t69@ertiqa.edu.qa", subjectId: 11 },
    ];
    for (const t of teacherData) {
      await db.insert(teachers).values(t);
    }
  }

  // Update subject coordinators
  const allSubjects = await db.query.subjects.findMany();
  const allCoordinators = await db.query.schoolUsers.findMany({
    where: eq(schoolUsers.role, "coordinator"),
  });
  for (const sub of allSubjects) {
    const coord = allCoordinators.find(c => c.subjectId === sub.id);
    if (coord) {
      await db.update(subjects).set({ coordinatorId: coord.id }).where(eq(subjects.id, sub.id));
    }
  }

  console.log("✅ Seed complete!");
}

import { eq } from "drizzle-orm";

seed().catch(console.error);
