/* ═══════════════════════════════════════════════════════════════
   بيانات حقيقية من ملف قائمة موظفين
   مدرسة طارق بن زياد الثانوية للبنين
   2025-2026
   ═══════════════════════════════════════════════════════════════ */

export interface Subject {
  id: string;
  name: string;
  coordinatorName: string;
  coordinatorId: string;
  coordinatorEmail: string;
  teachers: { id: string; name: string }[];
}

export interface Teacher {
  id: string;
  name: string;
  subjectId: string;
}

export interface EvaluationCriterion {
  id: string;
  label: string;
}

/* ═══════════════════════════════════════════
   المواد والمنسقون والمعلمون
   ═══════════════════════════════════════════ */

export const subjects: Subject[] = [
  {
    id: 's1',
    name: 'التربية الإسلامية',
    coordinatorName: 'عبدالله الشافعي محمد نعسان السيد',
    coordinatorId: 'coord-1',
    coordinatorEmail: 'a.alsayed0101@education.qa',
    teachers: [
      { id: 't1', name: 'أحمد محمد أحمد سرحان' },
      { id: 't2', name: 'أشرف السيد محمد يوسف' },
      { id: 't3', name: 'علاء إبراهيم عبدالواحد بصيله' },
      { id: 't4', name: 'محمد الشحات محمد حسين' },
      { id: 't5', name: 'محمود أحمد شوفان' },
      { id: 't6', name: 'محمود عبدو البزيعي' },
    ],
  },
  {
    id: 's2',
    name: 'اللغة العربية',
    coordinatorName: 'أحمد حسين عموش',
    coordinatorId: 'coord-2',
    coordinatorEmail: 'a.amooush0503@education.qa',
    teachers: [
      { id: 't7', name: 'أيمن موسى محمد متولي' },
      { id: 't8', name: 'خالد كمال سالم عباس' },
      { id: 't9', name: 'زكريا محمد زكريا إبراهيم' },
      { id: 't10', name: 'عبدالمعطى محمود عبدالمعطى أبطور' },
      { id: 't11', name: 'محمد إبراهيم شطح' },
      { id: 't12', name: 'محمد علي عبدالحميد المعصراوي' },
      { id: 't13', name: 'ممدوح شعبان إبراهيم عوض' },
      { id: 't14', name: 'نصرالدين سعيد أحمد الرجلاتي' },
      { id: 't15', name: 'عامر إسماعيل محمد بني سلمان' },
      { id: 't16', name: 'عبوده جمعه المتولى حسن صالح' },
    ],
  },
  {
    id: 's3',
    name: 'اللغة الإنجليزية',
    coordinatorName: 'محمد حامد عبدالفتاح محمد عبدالله',
    coordinatorId: 'coord-3',
    coordinatorEmail: 'm.abdallah0108@education.qa',
    teachers: [
      { id: 't17', name: 'أحمد عبدالرزاق على محمد الجزار' },
      { id: 't18', name: 'أسامة محمد فتحي عمر البرجي' },
      { id: 't19', name: 'علاء علي إبراهيم الحوامده' },
      { id: 't20', name: 'عماد محمد مسلم التلاحمه' },
      { id: 't21', name: 'محمد سيد توفيق محمد' },
      { id: 't22', name: 'محمد أشرف حنفي العطار' },
      { id: 't23', name: 'محمد أحمد العلوي' },
      { id: 't24', name: 'محمد عبدالحكيم سعد على' },
      { id: 't25', name: 'محمد علي يوسف حسين' },
      { id: 't26', name: 'محمد فراج محمد الباز أبوريا' },
    ],
  },
  {
    id: 's4',
    name: 'الرياضيات',
    coordinatorName: 'شريف عبدالمنعم عبدالحي البرلسي',
    coordinatorId: 'coord-4',
    coordinatorEmail: 'coordinator-math@ertiqa.edu.qa',
    teachers: [
      { id: 't27', name: 'أحمد أسعد بكرو' },
      { id: 't28', name: 'أحمد نبيل فؤاد بركات' },
      { id: 't29', name: 'أنور محمد محمود الجزازي' },
      { id: 't30', name: 'أيمن عبدالله عوض المصري' },
      { id: 't31', name: 'محمد بهاء حسين على ربابعه' },
      { id: 't32', name: 'محمود محمد محمود محمد' },
      { id: 't33', name: 'محمود مصطفى محمود عبدالله' },
      { id: 't34', name: 'نوفل بن خليفة تركي' },
      { id: 't35', name: 'ياسر سعيد أحمد الرجلاتي' },
      { id: 't36', name: 'نعيم عطالله عوض الخباص' },
      { id: 't37', name: 'معاويه عبدالعفو أنيس مصطفى' },
      { id: 't38', name: 'محمد نبيل محمد عبيدات' },
    ],
  },
  {
    id: 's5',
    name: 'الفيزياء',
    coordinatorName: 'أشرف السيد جودة السيد محمد',
    coordinatorId: 'coord-5',
    coordinatorEmail: 'coordinator-physics@ertiqa.edu.qa',
    teachers: [
      { id: 't39', name: 'حسن السيد حسن السيد منصور' },
      { id: 't40', name: 'محمد حسن البله عثمان' },
      { id: 't41', name: 'عبدالله محمد سليم قناش' },
      { id: 't42', name: 'فادي محمود حسين' },
      { id: 't43', name: 'محمد أحمد الزوباني' },
      { id: 't44', name: 'محمد سيد جلال موسى' },
    ],
  },
  {
    id: 's6',
    name: 'الكيمياء',
    coordinatorName: 'حسام محمد أبو النصر محمد الزياتي',
    coordinatorId: 'coord-6',
    coordinatorEmail: 'coordinator-chem@ertiqa.edu.qa',
    teachers: [
      { id: 't45', name: 'أحمد لطفي عبدالعال عبدالستار' },
      { id: 't46', name: 'إيهاب محمد إبراهيم عبدالله' },
      { id: 't47', name: 'شادي محمد علي يوسف بكر' },
      { id: 't48', name: 'عمر محمود حسن عناب' },
      { id: 't49', name: 'محمد عبدالرحمن محمد على الديب' },
      { id: 't50', name: 'ياسر حسانين علي سليمان' },
    ],
  },
  {
    id: 's7',
    name: 'الأحياء',
    coordinatorName: 'أحمد عبدالحميد أحمد عبدالمحسن',
    coordinatorId: 'coord-7',
    coordinatorEmail: 'coordinator-bio@ertiqa.edu.qa',
    teachers: [
      { id: 't51', name: 'إسماعيل محمد أحمد إسماعيل' },
      { id: 't52', name: 'أشرف رفعت إبراهيم سالم' },
      { id: 't53', name: 'أحمد عبدالمنعم محمود محمد' },
      { id: 't54', name: 'حاتم طه محمد عبدالمنعم محمود' },
      { id: 't55', name: 'محمود عبدالله عبدالعزيز طلفاح' },
      { id: 't56', name: 'عثمان علي محمد الشرفات' },
      { id: 't57', name: 'فادي عزمي عبدالرحمن يونس' },
      { id: 't58', name: 'محمد راتب إبراهيم الزغايبه' },
    ],
  },
  {
    id: 's8',
    name: 'الدراسات الاجتماعية',
    coordinatorName: 'علاء معوض إبراهيم حمودة',
    coordinatorId: 'coord-8',
    coordinatorEmail: 'coordinator-social@ertiqa.edu.qa',
    teachers: [
      { id: 't59', name: 'السيد أحمد محمد أحمد' },
      { id: 't60', name: 'إيهاب محمد عصام الدين رجائي أحمد' },
      { id: 't61', name: 'علاء على عبدالمطلب على' },
      { id: 't62', name: 'عمرو سيد إسماعيل عتريس الجابري' },
      { id: 't63', name: 'فادي موسى' },
    ],
  },
  {
    id: 's9',
    name: 'تكنولوجيا المعلومات',
    coordinatorName: 'محمد فتحي إبراهيم فريج',
    coordinatorId: 'coord-9',
    coordinatorEmail: 'coordinator-it@ertiqa.edu.qa',
    teachers: [
      { id: 't64', name: 'إسلام السيد محمد محمود عمر' },
      { id: 't65', name: 'طارق بن علي حميدي' },
      { id: 't66', name: 'مؤيد أحمد محمد البيروتي' },
      { id: 't67', name: 'حسن فايز حسين أحمد' },
    ],
  },
  {
    id: 's10',
    name: 'التربية البدنية',
    coordinatorName: 'محمد جواد علي أكبر محمد جواد لاري',
    coordinatorId: 'coord-10',
    coordinatorEmail: 'coordinator-pe@ertiqa.edu.qa',
    teachers: [
      { id: 't68', name: 'خالد يوسف على محمد الماجد' },
      { id: 't69', name: 'محمد إبراهيم أحمد أحمد يونس' },
      { id: 't70', name: 'ناصر سلطان حافظ الملا' },
      { id: 't71', name: 'هيثم نصر الجليدي' },
      { id: 't72', name: 'أحمد جميل أبوالندى' },
      { id: 't73', name: 'حسن يوسف حسن بوجسوم البدر' },
      { id: 't74', name: 'سليم بازارباشي' },
      { id: 't75', name: 'هشام محمد السيد إبراهيم' },
      { id: 't76', name: 'إسلام أحمد عبدالعزيز سيد أحمد' },
      { id: 't77', name: 'محمود عيد محمود إبراهيم' },
      { id: 't78', name: 'السيد السيد إسماعيل رخا' },
    ],
  },
  {
    id: 's11',
    name: 'التعليم الإلكتروني',
    coordinatorName: 'هيثم محمد محمد أحمد الشامي',
    coordinatorId: 'coord-11',
    coordinatorEmail: 'coordinator-el@ertiqa.edu.qa',
    teachers: [],
  },
  {
    id: 's12',
    name: 'اللغة الفرنسية',
    coordinatorName: '—',
    coordinatorId: 'coord-12',
    coordinatorEmail: 'coordinator-french@ertiqa.edu.qa',
    teachers: [
      { id: 't79', name: 'إسلام أحمد عبدالعزيز سيد أحمد' },
    ],
  },
  {
    id: 's13',
    name: 'اللغة الألمانية',
    coordinatorName: '—',
    coordinatorId: 'coord-13',
    coordinatorEmail: 'coordinator-german@ertiqa.edu.qa',
    teachers: [
      { id: 't82', name: 'هشام محمد السيد إبراهيم' },
    ],
  },
  {
    id: 's14',
    name: 'اللغة اليابانية',
    coordinatorName: '—',
    coordinatorId: 'coord-14',
    coordinatorEmail: 'coordinator-japanese@ertiqa.edu.qa',
    teachers: [
      { id: 't85', name: 'محمود عيد محمود إبراهيم' },
    ],
  },
  {
    id: 's15',
    name: 'المهارات الحياتية',
    coordinatorName: '—',
    coordinatorId: 'coord-15',
    coordinatorEmail: 'coordinator-life@ertiqa.edu.qa',
    teachers: [
      { id: 't88', name: 'أحمد جميل أبوالندى' },
      { id: 't89', name: 'حسن يوسف حسن بوجسوم البدر' },
      { id: 't90', name: 'سليم بازارباشي' },
    ],
  },
  {
    id: 's16',
    name: 'فنون بصرية',
    coordinatorName: '—',
    coordinatorId: 'coord-16',
    coordinatorEmail: 'coordinator-arts@ertiqa.edu.qa',
    teachers: [
      { id: 't91', name: 'السيد السيد إسماعيل رخا' },
    ],
  },
];

/* ═══════════════════════════════════════════
   معلمون مسطحون (للبحث السريع)
   ═══════════════════════════════════════════ */

export const teachers: Teacher[] = subjects.flatMap(s =>
  s.teachers.map(t => ({ id: t.id, name: t.name, subjectId: s.id }))
);

/* ═══════════════════════════════════════════
   معايير التقييم (5 نجوم)
   ═══════════════════════════════════════════ */

export const evaluationCriteria = [
  { id: 'scoreObjectives', label: 'الأهداف معروضة وواضحة' },
  { id: 'scoreStudentEngagement', label: 'الطلبة متفاعلون' },
  { id: 'scoreDiscipline', label: 'مدى الانضباط والنظام داخل الصف' },
  { id: 'scoreTeacherEngagement', label: 'المعلم متفاعل مع الطلاب' },
  { id: 'scoreEnvironment', label: 'يوفر المعلم بيئة صفية آمنة ومنظمة ومحفزة' },
];

export const scoreLabels: Record<number, string> = {
  1: 'ضعيف',
  2: 'مقبول',
  3: 'جيد',
  4: 'جيد جدا',
  5: 'ممتاز',
};

/* ═══════════════════════════════════════════
   بيانات الإحصائيات
   ═══════════════════════════════════════════ */

export const monthlyVisitData = [
  { month: 'مارس', visits: 15 },
  { month: 'أبريل', visits: 22 },
  { month: 'مايو', visits: 28 },
  { month: 'يونيو', visits: 20 },
  { month: 'يوليو', visits: 18 },
  { month: 'أغسطس', visits: 25 },
  { month: 'سبتمبر', visits: 30 },
  { month: 'أكتوبر', visits: 35 },
  { month: 'نوفمبر', visits: 42 },
  { month: 'ديسمبر', visits: 38 },
];

export const subjectPerformanceData = [
  { subject: 'الرياضيات', avgScore: 4.2 },
  { subject: 'الفيزياء', avgScore: 3.8 },
  { subject: 'الكيمياء', avgScore: 3.5 },
  { subject: 'الأحياء', avgScore: 3.9 },
  { subject: 'اللغة الإنجليزية', avgScore: 4.1 },
  { subject: 'التربية الإسلامية', avgScore: 4.5 },
  { subject: 'اللغة العربية', avgScore: 4.0 },
  { subject: 'الدراسات', avgScore: 3.7 },
];

export const visitDistributionData = [
  { name: 'مدير المدرسة', value: 85, color: '#8A1538' },
  { name: 'النائب الأكاديمي', value: 120, color: '#4A7FB5' },
  { name: 'منسق مادة', value: 195, color: '#D4AF37' },
  { name: 'النائب الإداري', value: 65, color: '#2E7D5A' },
];
