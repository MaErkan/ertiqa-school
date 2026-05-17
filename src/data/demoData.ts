export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'academic_vp' | 'admin_vp' | 'coordinator' | 'sysadmin';
  roleLabel: string;
  subjectId?: string;
  avatar?: string;
}

export interface Subject {
  id: string;
  name: string;
  coordinatorId: string;
  coordinatorName: string;
  coordinatorEmail?: string;
  teachers: Teacher[];
}

export interface Teacher {
  id: string;
  name: string;
  subjectId: string;
  email?: string;
}

export interface Visit {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorRole: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  coordinatorId: string;
  coordinatorName: string;
  className: string;
  visitDate: string;
  visitTime: string;
  visitDuration: string;
  scoreObjectives: number;
  scoreStudents: number;
  scoreDiscipline: number;
  scoreTeacherInteraction: number;
  scoreSafeEnvironment: number;
  averageScore: number;
  keyObservations: string;
  status: 'sent' | 'draft';
  visibleTo: string[];
  createdAt: string;
}

export const ROLE_LABELS: Record<string, string> = {
  manager: 'مدير المدرسة',
  academic_vp: 'النائب الأكاديمي',
  admin_vp: 'النائب الإداري',
  coordinator: 'منسق المادة',
  sysadmin: 'مسؤول النظام',
};

export const ROLE_CARDS = [
  {
    id: 'administration',
    title: 'إدارة المدرسة',
    description: 'وصول شامل لإدارة الزيارات والمعلمين والتقارير',
    roles: ['مدير المدرسة', 'النائب الأكاديمي', 'النائب الإداري'],
    icon: 'Shield',
    color: '#8A1538',
    allowedRoles: ['manager', 'academic_vp', 'admin_vp'],
  },
  {
    id: 'coordinator',
    title: 'منسقو المواد',
    description: 'متابعة معلمي المادة والزيارات والتقارير الخاصة',
    roles: ['منسقو المواد الدراسية'],
    icon: 'Users',
    color: '#D4AF37',
    allowedRoles: ['coordinator'],
  },
  {
    id: 'sysadmin',
    title: 'مسؤولو النظام',
    description: 'إدارة المستخدمين والصلاحيات والنسخ الاحتياطي',
    roles: ['مسؤولو النظام'],
    icon: 'Settings',
    color: '#4A7FB5',
    allowedRoles: ['sysadmin'],
  },
];

/* ═══════════════════════════════════════════════
   بيانات الإدارة العليا والمنسقين والمعلمين
   مستخرجة من ملف: قائمة الموظفين.xlsx
   مدرسة طارق بن زياد الثانوية للبنين 2025-2026
   ═══════════════════════════════════════════════ */

// الإدارة العليا
export const adminUsers: User[] = [
  { id: 'u1', name: 'يوسف إبراهيم يوسف جاسم الجاسم', email: 'y.al-jassim0101@education.qa', role: 'manager', roleLabel: 'مدير المدرسة' },
  { id: 'u2', name: 'أحمد محمد رمضان محمد', email: 'a.mohamed2211@education.qa', role: 'academic_vp', roleLabel: 'النائب الأكاديمي' },
  { id: 'u3', name: 'حمد هادي محمد الغفراني المري', email: 'h.almarri23103@education.qa', role: 'admin_vp', roleLabel: 'النائب الإداري' },
];

// منسقو المواد
export const coordinatorUsers: User[] = [
  { id: 'c1', name: 'عبدالله الشافعي محمد نعسان السيد', email: 'a.alsayed0101@education.qa', role: 'coordinator', roleLabel: 'منسق التربية الإسلامية', subjectId: 's1' },
  { id: 'c2', name: 'أحمد حسين عموش', email: 'a.amooush0503@education.qa', role: 'coordinator', roleLabel: 'منسق اللغة العربية', subjectId: 's2' },
  { id: 'c3', name: 'محمد حامد عبدالفتاح محمد عبدالله', email: 'm.abdallah0108@education.qa', role: 'coordinator', roleLabel: 'منسق اللغة الإنجليزية', subjectId: 's3' },
  { id: 'c4', name: 'شريف عبدالمنعم عبدالحي البرلسي', email: '', role: 'coordinator', roleLabel: 'منسق الرياضيات', subjectId: 's4' },
  { id: 'c5', name: 'أشرف السيد جودة السيد محمد', email: '', role: 'coordinator', roleLabel: 'منسق الفيزياء', subjectId: 's5' },
  { id: 'c6', name: 'حسام محمد أبو النصر محمد الزياتي', email: '', role: 'coordinator', roleLabel: 'منسق الكيمياء', subjectId: 's6' },
  { id: 'c7', name: 'أحمد عبدالحميد أحمد عبدالمحسن', email: '', role: 'coordinator', roleLabel: 'منسق الأحياء', subjectId: 's7' },
  { id: 'c8', name: 'علاء معوض إبراهيم حمودة', email: '', role: 'coordinator', roleLabel: 'منسق الدراسات الاجتماعية', subjectId: 's8' },
  { id: 'c9', name: 'محمد فتحي إبراهيم فريج', email: '', role: 'coordinator', roleLabel: 'منسق تكنولوجيا المعلومات', subjectId: 's9' },
  { id: 'c10', name: 'محمد جواد علي أكبر محمد جواد لاري', email: '', role: 'coordinator', roleLabel: 'منسق التربية البدنية', subjectId: 's10' },
  { id: 'c11', name: 'هيثم محمد محمد أحمد الشامي', email: '', role: 'coordinator', roleLabel: 'منسق التعليم الإلكتروني', subjectId: 's11' },
];

export const users: User[] = [
  ...adminUsers,
  ...coordinatorUsers,
  { id: 'u15', name: 'مسؤول النظام', email: 'sysadmin@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام' },
];

// المواد والمعلمين — البيانات من ملف قائمة الموظفين.xlsx
export const subjects: Subject[] = [
  {
    id: 's1',
    name: 'التربية الإسلامية',
    coordinatorId: 'c1',
    coordinatorName: 'عبدالله الشافعي محمد نعسان السيد',
    coordinatorEmail: 'a.alsayed0101@education.qa',
    teachers: [
      { id: 't101', name: 'أحمد محمد أحمد سرحان', subjectId: 's1', email: 'a.sarhan1509@education.qa' },
      { id: 't102', name: 'أشرف السيد محمد يوسف', subjectId: 's1', email: 'a.youssef2006@education.qa' },
      { id: 't103', name: 'علاء إبراهيم عبدالواحد بصيلة', subjectId: 's1', email: 'a.boseila1912@education.qa' },
      { id: 't104', name: 'محمد الشحات محمد حسين', subjectId: 's1', email: 'm.hussein20081@education.qa' },
      { id: 't105', name: 'محمود أحمد شوفان', subjectId: 's1', email: 'm.choofan2806@education.qa' },
      { id: 't106', name: 'محمود عبدو البزيعي', subjectId: 's1', email: 'm.albze0303@education.qa' },
    ],
  },
  {
    id: 's2',
    name: 'اللغة العربية',
    coordinatorId: 'c2',
    coordinatorName: 'أحمد حسين عموش',
    coordinatorEmail: 'a.amooush0503@education.qa',
    teachers: [
      { id: 't201', name: 'أيمن موسى محمد متولي', subjectId: 's2', email: 'a.metwaly1501@education.qa' },
      { id: 't202', name: 'خالد كمال سالم عباس', subjectId: 's2', email: 'k.abbaas2306@education.qa' },
      { id: 't203', name: 'زكريا محمد زكريا إبراهيم', subjectId: 's2', email: 'z.ibrahim0102@education.qa' },
      { id: 't204', name: 'عبدالمعطى محمود عبدالمعطى أبو طور', subjectId: 's2', email: 'a.aboutour0607@education.qa' },
      { id: 't205', name: 'محمد إبراهيم شطح', subjectId: 's2', email: 'm.shatah1201@education.qa' },
      { id: 't206', name: 'محمد علي عبدالحميد المعصراوي', subjectId: 's2', email: 'm.elmassarawy1702@education.qa' },
      { id: 't207', name: 'ممدوح شعبان إبراهيم عوض', subjectId: 's2', email: 'm.awad1210@education.qa' },
      { id: 't208', name: 'نصرالدين سعيد أحمد الرجلاتي', subjectId: 's2', email: 'n.alregalaty0612@education.qa' },
      { id: 't209', name: 'عامر إسماعيل محمد بني سلمان', subjectId: 's2', email: 'a.banisalman0805@education.qa' },
      { id: 't210', name: 'عبودة جمعة المتولي حسن صالح', subjectId: 's2', email: 'a.saleh15101@education.qa' },
    ],
  },
  {
    id: 's3',
    name: 'اللغة الإنجليزية',
    coordinatorId: 'c3',
    coordinatorName: 'محمد حامد عبدالفتاح محمد عبدالله',
    coordinatorEmail: 'm.abdallah0108@education.qa',
    teachers: [
      { id: 't301', name: 'أحمد عبدالرزاق علي محمد الجزار', subjectId: 's3' },
      { id: 't302', name: 'أسامة محمد فتحي عمر البرجي', subjectId: 's3' },
      { id: 't303', name: 'علاء علي إبراهيم الحوامدة', subjectId: 's3' },
      { id: 't304', name: 'عماد محمد مسلم التلاحمة', subjectId: 's3' },
      { id: 't305', name: 'محمد سيد توفيق محمد', subjectId: 's3' },
      { id: 't306', name: 'محمد أشرف حنفي العطار', subjectId: 's3' },
      { id: 't307', name: 'محمد أحمد العلوي', subjectId: 's3' },
      { id: 't308', name: 'محمد عبدالحكيم سعد علي', subjectId: 's3' },
      { id: 't309', name: 'محمد علي يوسف حسين', subjectId: 's3' },
      { id: 't310', name: 'محمد فراج محمد الباز أبوريا', subjectId: 's3' },
    ],
  },
  {
    id: 's4',
    name: 'الرياضيات',
    coordinatorId: 'c4',
    coordinatorName: 'شريف عبدالمنعم عبدالحي البرلسي',
    teachers: [
      { id: 't401', name: 'أحمد أسعد بكرو', subjectId: 's4' },
      { id: 't402', name: 'أحمد نبيل فؤاد بركات', subjectId: 's4' },
      { id: 't403', name: 'أنور محمد محمود الجزازي', subjectId: 's4' },
      { id: 't404', name: 'أيمن عبدالله عوض المصري', subjectId: 's4' },
      { id: 't405', name: 'محمد بهاء حسين علي ربابعة', subjectId: 's4' },
      { id: 't406', name: 'محمود محمد محمود محمد', subjectId: 's4' },
      { id: 't407', name: 'محمود مصطفى محمود عبدالله', subjectId: 's4' },
      { id: 't408', name: 'نوفل بن خليفة تركي', subjectId: 's4' },
      { id: 't409', name: 'ياسر سعيد أحمد الرجلاتي', subjectId: 's4' },
      { id: 't410', name: 'نعيم عطالله عوض الخباص', subjectId: 's4' },
      { id: 't411', name: 'معاوية عبدالعفو أنيس مصطفى', subjectId: 's4' },
      { id: 't412', name: 'محمد نبيل محمد عبيدات', subjectId: 's4' },
    ],
  },
  {
    id: 's5',
    name: 'الفيزياء',
    coordinatorId: 'c5',
    coordinatorName: 'أشرف السيد جودة السيد محمد',
    teachers: [
      { id: 't501', name: 'حسن السيد حسن السيد منصور', subjectId: 's5' },
      { id: 't502', name: 'محمد حسن البله عثمان', subjectId: 's5' },
      { id: 't503', name: 'عبدالله محمد سليم قناش', subjectId: 's5' },
      { id: 't504', name: 'فادي محمود حسين', subjectId: 's5' },
      { id: 't505', name: 'محمد أحمد الزوباني', subjectId: 's5' },
      { id: 't506', name: 'محمد سيد جلال موسى', subjectId: 's5' },
    ],
  },
  {
    id: 's6',
    name: 'الكيمياء',
    coordinatorId: 'c6',
    coordinatorName: 'حسام محمد أبو النصر محمد الزياتي',
    teachers: [
      { id: 't601', name: 'أحمد لطفي عبدالعال عبدالستار', subjectId: 's6' },
      { id: 't602', name: 'إيهاب محمد إبراهيم عبدالله', subjectId: 's6' },
      { id: 't603', name: 'شادي محمد علي يوسف بكر', subjectId: 's6' },
      { id: 't604', name: 'عمر محمود حسن عناب', subjectId: 's6' },
      { id: 't605', name: 'محمد عبدالرحمن محمد علي الديب', subjectId: 's6' },
      { id: 't606', name: 'ياسر حسانين علي سليمان', subjectId: 's6' },
    ],
  },
  {
    id: 's7',
    name: 'الأحياء',
    coordinatorId: 'c7',
    coordinatorName: 'أحمد عبدالحميد أحمد عبدالمحسن',
    teachers: [
      { id: 't701', name: 'إسماعيل محمد أحمد إسماعيل', subjectId: 's7' },
      { id: 't702', name: 'أشرف رفعت إبراهيم سالم', subjectId: 's7' },
      { id: 't703', name: 'أحمد عبدالمنعم محمود محمد', subjectId: 's7' },
      { id: 't704', name: 'حاتم طه محمد عبدالمنعم محمود', subjectId: 's7' },
      { id: 't705', name: 'محمود عبدالله عبدالعزيز طلفاح', subjectId: 's7' },
      { id: 't706', name: 'عثمان علي محمد الشرفات', subjectId: 's7' },
    ],
  },
  {
    id: 's8',
    name: 'الدراسات الاجتماعية',
    coordinatorId: 'c8',
    coordinatorName: 'علاء معوض إبراهيم حمودة',
    teachers: [
      { id: 't801', name: 'السيد أحمد محمد أحمد', subjectId: 's8' },
      { id: 't802', name: 'إيهاب محمد عصام الدين رجائي أحمد', subjectId: 's8' },
      { id: 't803', name: 'علاء علي عبدالمطلب علي', subjectId: 's8' },
      { id: 't804', name: 'عمرو سيد إسماعيل عتريس الجابري', subjectId: 's8' },
      { id: 't805', name: 'فادي موسى', subjectId: 's8' },
    ],
  },
  {
    id: 's9',
    name: 'تكنولوجيا المعلومات',
    coordinatorId: 'c9',
    coordinatorName: 'محمد فتحي إبراهيم فريج',
    teachers: [
      { id: 't901', name: 'إسلام السيد محمد محمود عمر', subjectId: 's9' },
      { id: 't902', name: 'طارق بن علي حميدي', subjectId: 's9' },
      { id: 't903', name: 'مؤيد أحمد محمد البيروتي', subjectId: 's9' },
      { id: 't904', name: 'حسن فايز حسين أحمد', subjectId: 's9' },
    ],
  },
  {
    id: 's10',
    name: 'التربية البدنية',
    coordinatorId: 'c10',
    coordinatorName: 'محمد جواد علي أكبر محمد جواد لاري',
    teachers: [
      { id: 't1001', name: 'خالد يوسف علي محمد الماجد', subjectId: 's10' },
      { id: 't1002', name: 'محمد إبراهيم أحمد أحمد يونس', subjectId: 's10' },
      { id: 't1003', name: 'ناصر سلطان حافظ الملا', subjectId: 's10' },
      { id: 't1004', name: 'هيثم نصر الجليدي', subjectId: 's10' },
    ],
  },
  {
    id: 's11',
    name: 'التعليم الإلكتروني',
    coordinatorId: 'c11',
    coordinatorName: 'هيثم محمد محمد أحمد الشامي',
    teachers: [
      { id: 't1101', name: 'سامي عبدالله أحمد', subjectId: 's11' },
      { id: 't1102', name: 'فهد محمود سالم', subjectId: 's11' },
    ],
  },
];

export const sampleVisits: Visit[] = [
  {
    id: 'v1', visitorId: 'u1', visitorName: 'يوسف إبراهيم يوسف جاسم الجاسم', visitorRole: 'مدير المدرسة',
    teacherId: 't201', teacherName: 'أيمن موسى محمد متولي', subjectId: 's2', subjectName: 'اللغة العربية',
    coordinatorId: 'c2', coordinatorName: 'أحمد حسين عموش',
    className: '10/2', visitDate: '2025-05-10', visitTime: '08:30', visitDuration: '20 دقيقة',
    scoreObjectives: 5, scoreStudents: 4, scoreDiscipline: 5, scoreTeacherInteraction: 4, scoreSafeEnvironment: 5,
    averageScore: 4.6, keyObservations: 'أداء متميز في توصيل الأهداف، تفاعل إيجابي من الطلاب',
    status: 'sent', visibleTo: ['u1', 'u2', 'c2', 't201'], createdAt: '2025-05-10T08:30:00',
  },
  {
    id: 'v2', visitorId: 'u2', visitorName: 'أحمد محمد رمضان محمد', visitorRole: 'النائب الأكاديمي',
    teacherId: 't202', teacherName: 'خالد كمال سالم عباس', subjectId: 's2', subjectName: 'اللغة العربية',
    coordinatorId: 'c2', coordinatorName: 'أحمد حسين عموش',
    className: '11/1', visitDate: '2025-05-09', visitTime: '10:00', visitDuration: '15 دقيقة',
    scoreObjectives: 4, scoreStudents: 4, scoreDiscipline: 3, scoreTeacherInteraction: 4, scoreSafeEnvironment: 4,
    averageScore: 3.8, keyObservations: '',
    status: 'sent', visibleTo: ['u1', 'u2', 'c2', 't202'], createdAt: '2025-05-09T10:00:00',
  },
  {
    id: 'v3', visitorId: 'u3', visitorName: 'حمد هادي محمد الغفراني المري', visitorRole: 'النائب الإداري',
    teacherId: 't701', teacherName: 'إسماعيل محمد أحمد إسماعيل', subjectId: 's7', subjectName: 'الأحياء',
    coordinatorId: 'c7', coordinatorName: 'أحمد عبدالحميد أحمد عبدالمحسن',
    className: '12/3', visitDate: '2025-05-08', visitTime: '09:15', visitDuration: '20 دقيقة',
    scoreObjectives: 5, scoreStudents: 5, scoreDiscipline: 4, scoreTeacherInteraction: 5, scoreSafeEnvironment: 5,
    averageScore: 4.8, keyObservations: 'حصة متميزة مع تفاعل عالٍ من الطلاب',
    status: 'sent', visibleTo: ['u1', 'u2', 'u3', 'c7', 't701'], createdAt: '2025-05-08T09:15:00',
  },
  {
    id: 'v4', visitorId: 'u1', visitorName: 'يوسف إبراهيم يوسف جاسم الجاسم', visitorRole: 'مدير المدرسة',
    teacherId: 't401', teacherName: 'أحمد أسعد بكرو', subjectId: 's4', subjectName: 'الرياضيات',
    coordinatorId: 'c4', coordinatorName: 'شريف عبدالمنعم عبدالحي البرلسي',
    className: '10/1', visitDate: '2025-05-07', visitTime: '11:00', visitDuration: '30 دقيقة',
    scoreObjectives: 4, scoreStudents: 3, scoreDiscipline: 4, scoreTeacherInteraction: 4, scoreSafeEnvironment: 4,
    averageScore: 3.8, keyObservations: '',
    status: 'sent', visibleTo: ['u1', 'u2', 'c4', 't401'], createdAt: '2025-05-07T11:00:00',
  },
  {
    id: 'v5', visitorId: 'c2', visitorName: 'أحمد حسين عموش', visitorRole: 'منسق اللغة العربية',
    teacherId: 't203', teacherName: 'زكريا محمد زكريا إبراهيم', subjectId: 's2', subjectName: 'اللغة العربية',
    coordinatorId: 'c2', coordinatorName: 'أحمد حسين عموش',
    className: '9/2', visitDate: '2025-05-06', visitTime: '08:00', visitDuration: '20 دقيقة',
    scoreObjectives: 5, scoreStudents: 5, scoreDiscipline: 5, scoreTeacherInteraction: 5, scoreSafeEnvironment: 5,
    averageScore: 5.0, keyObservations: 'أداء استثنائي، نموذج يحتذى به',
    status: 'sent', visibleTo: ['u1', 'u2', 'c2', 't203'], createdAt: '2025-05-06T08:00:00',
  },
  {
    id: 'v6', visitorId: 'u2', visitorName: 'أحمد محمد رمضان محمد', visitorRole: 'النائب الأكاديمي',
    teacherId: 't301', teacherName: 'أحمد عبدالرزاق علي محمد الجزار', subjectId: 's3', subjectName: 'اللغة الإنجليزية',
    coordinatorId: 'c3', coordinatorName: 'محمد حامد عبدالفتاح محمد عبدالله',
    className: '11/2', visitDate: '2025-05-05', visitTime: '09:45', visitDuration: '15 دقيقة',
    scoreObjectives: 4, scoreStudents: 4, scoreDiscipline: 4, scoreTeacherInteraction: 3, scoreSafeEnvironment: 4,
    averageScore: 3.8, keyObservations: '',
    status: 'sent', visibleTo: ['u1', 'u2', 'c3', 't301'], createdAt: '2025-05-05T09:45:00',
  },
  {
    id: 'v7', visitorId: 'u1', visitorName: 'يوسف إبراهيم يوسف جاسم الجاسم', visitorRole: 'مدير المدرسة',
    teacherId: 't501', teacherName: 'حسن السيد حسن السيد منصور', subjectId: 's5', subjectName: 'الفيزياء',
    coordinatorId: 'c5', coordinatorName: 'أشرف السيد جودة السيد محمد',
    className: '12/1', visitDate: '2025-05-04', visitTime: '10:30', visitDuration: '20 دقيقة',
    scoreObjectives: 4, scoreStudents: 3, scoreDiscipline: 4, scoreTeacherInteraction: 4, scoreSafeEnvironment: 3,
    averageScore: 3.6, keyObservations: 'تحسين ملحوظ في تفاعل الطلاب',
    status: 'sent', visibleTo: ['u1', 'u2', 'c5', 't501'], createdAt: '2025-05-04T10:30:00',
  },
  {
    id: 'v8', visitorId: 'c7', visitorName: 'أحمد عبدالحميد أحمد عبدالمحسن', visitorRole: 'منسق الأحياء',
    teacherId: 't702', teacherName: 'أشرف رفعت إبراهيم سالم', subjectId: 's7', subjectName: 'الأحياء',
    coordinatorId: 'c7', coordinatorName: 'أحمد عبدالحميد أحمد عبدالمحسن',
    className: '10/3', visitDate: '2025-05-03', visitTime: '08:15', visitDuration: '20 دقيقة',
    scoreObjectives: 5, scoreStudents: 4, scoreDiscipline: 5, scoreTeacherInteraction: 5, scoreSafeEnvironment: 5,
    averageScore: 4.8, keyObservations: '',
    status: 'sent', visibleTo: ['u1', 'u2', 'c7', 't702'], createdAt: '2025-05-03T08:15:00',
  },
  {
    id: 'v9', visitorId: 'u1', visitorName: 'يوسف إبراهيم يوسف جاسم الجاسم', visitorRole: 'مدير المدرسة',
    teacherId: 't101', teacherName: 'أحمد محمد أحمد سرحان', subjectId: 's1', subjectName: 'التربية الإسلامية',
    coordinatorId: 'c1', coordinatorName: 'عبدالله الشافعي محمد نعسان السيد',
    className: '10/1', visitDate: '2025-05-02', visitTime: '07:30', visitDuration: '20 دقيقة',
    scoreObjectives: 5, scoreStudents: 5, scoreDiscipline: 5, scoreTeacherInteraction: 5, scoreSafeEnvironment: 5,
    averageScore: 5.0, keyObservations: 'حصة قرآنية متميزة، حفظ وتجويد ممتاز',
    status: 'sent', visibleTo: ['u1', 'u2', 'c1', 't101'], createdAt: '2025-05-02T07:30:00',
  },
  {
    id: 'v10', visitorId: 'c4', visitorName: 'شريف عبدالمنعم عبدالحي البرلسي', visitorRole: 'منسق الرياضيات',
    teacherId: 't402', teacherName: 'أحمد نبيل فؤاد بركات', subjectId: 's4', subjectName: 'الرياضيات',
    coordinatorId: 'c4', coordinatorName: 'شريف عبدالمنعم عبدالحي البرلسي',
    className: '11/3', visitDate: '2025-05-01', visitTime: '09:00', visitDuration: '15 دقيقة',
    scoreObjectives: 4, scoreStudents: 4, scoreDiscipline: 4, scoreTeacherInteraction: 4, scoreSafeEnvironment: 4,
    averageScore: 4.0, keyObservations: 'شرح واضح للمسائل الرياضية',
    status: 'sent', visibleTo: ['u1', 'u2', 'c4', 't402'], createdAt: '2025-05-01T09:00:00',
  },
];

export const evaluationCriteria = [
  { id: 'scoreObjectives', label: 'الأهداف معروضة وواضحة' },
  { id: 'scoreStudents', label: 'الطلبة متفاعلون' },
  { id: 'scoreDiscipline', label: 'مدى الانضباط والنظام داخل الصف' },
  { id: 'scoreTeacherInteraction', label: 'المعلم متفاعل مع الطلاب' },
  { id: 'scoreSafeEnvironment', label: 'يوفر المعلم بيئة صفية آمنة ومنظمة ومحفزة' },
];

export const scoreLabels = ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];

export const monthlyVisitData = [
  { month: 'أغسطس', visits: 12, avgScore: 4.1 },
  { month: 'سبتمبر', visits: 28, avgScore: 4.2 },
  { month: 'أكتوبر', visits: 35, avgScore: 3.9 },
  { month: 'نوفمبر', visits: 42, avgScore: 4.3 },
  { month: 'ديسمبر', visits: 38, avgScore: 4.0 },
  { month: 'يناير', visits: 24, avgScore: 4.2 },
];

export const subjectPerformanceData = [
  { subject: 'التربية الإسلامية', avgScore: 4.5, visits: 14 },
  { subject: 'اللغة العربية', avgScore: 4.4, visits: 18 },
  { subject: 'الأحياء', avgScore: 4.7, visits: 12 },
  { subject: 'الرياضيات', avgScore: 3.9, visits: 15 },
  { subject: 'الفيزياء', avgScore: 3.8, visits: 10 },
  { subject: 'اللغة الإنجليزية', avgScore: 4.1, visits: 14 },
  { subject: 'الكيمياء', avgScore: 4.0, visits: 8 },
  { subject: 'الدراسات الاجتماعية', avgScore: 3.8, visits: 9 },
];

export const visitDistributionData = [
  { name: 'مدير المدرسة', value: 35, color: '#8A1538' },
  { name: 'النائب الأكاديمي', value: 30, color: '#D4AF37' },
  { name: 'منسقو المواد', value: 25, color: '#4A7FB5' },
  { name: 'النائب الإداري', value: 10, color: '#2E7D5A' },
];

export const notifications = [
  { id: 'n1', title: 'زيارة صفية جديدة', message: 'قام يوسف إبراهيم بزيارة أيمن موسى - اللغة العربية', time: 'منذ 5 دقائق', read: false, type: 'visit' },
  { id: 'n2', title: 'تم إرسال تقرير', message: 'تم إنشاء تقرير زيارة خالد كمال - اللغة العربية', time: 'منذ ساعة', read: false, type: 'report' },
  { id: 'n3', title: 'تسجيل دخول', message: 'أحمد حسين عموش سجل الدخول إلى النظام', time: 'منذ ساعتين', read: true, type: 'login' },
  { id: 'n4', title: 'زيارة صفية', message: 'قام حمد هادي بزيارة إسماعيل محمد - الأحياء', time: 'منذ 3 ساعات', read: true, type: 'visit' },
];
