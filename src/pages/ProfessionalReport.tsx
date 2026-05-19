import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Printer, Archive, User, BookOpen, Award, FileText
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface ArchivedReport {
  id: string;
  title: string;
  date: string;
  data: any;
  createdAt: string;
}

interface VisitData {
  id: string;
  visitorName: string;
  visitorRole: string;
  teacherName: string;
  subjectName: string;
  className: string;
  visitDate: string;
  visitTime: string;
  scoreObjectives: number;
  scoreStudentEngagement: number;
  scoreDiscipline: number;
  scoreTeacherEngagement: number;
  scoreEnvironment: number;
  scoreTotal: number;
  notes: string;
  deviceId?: string;
}

export default function ProfessionalReport() {
  const { user } = useAuth();
  const [selectedVisit, setSelectedVisit] = useState<VisitData | null>(null);
  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>(() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_archived_reports') || '[]'); }
    catch { return []; }
  });
  const [showArchive, setShowArchive] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load visits from localStorage
  const visits: VisitData[] = (() => {
    try { return JSON.parse(localStorage.getItem('ertiqa_visits') || '[]'); }
    catch { return []; }
  })();

  const saveToArchive = () => {
    if (!selectedVisit) return;
    const report: ArchivedReport = {
      id: `rep_${Date.now()}`,
      title: `تقرير زيارة ${selectedVisit.teacherName}`,
      date: selectedVisit.visitDate,
      data: selectedVisit,
      createdAt: new Date().toISOString(),
    };
    const updated = [report, ...archivedReports];
    setArchivedReports(updated);
    localStorage.setItem('ertiqa_archived_reports', JSON.stringify(updated));
    alert('تم حفظ التقرير في الأرشيف');
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير زيارة صفية - ارتقاء</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Tajawal', sans-serif;
            background: #fff;
            color: #1a1a2e;
            padding: 0;
          }
          .report-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            background: #fff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #8A1538;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .header img {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            border: 2px solid #D4AF37;
          }
          .header h1 {
            font-family: 'Cairo', sans-serif;
            font-size: 22px;
            font-weight: 900;
            color: #8A1538;
          }
          .header h2 {
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #1B3A5C;
          }
          .header .report-type {
            text-align: center;
          }
          .header .report-type h3 {
            font-family: 'Cairo', sans-serif;
            font-size: 18px;
            font-weight: 700;
            color: #8A1538;
            border: 2px solid #D4AF37;
            padding: 8px 20px;
            border-radius: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
          }
          .info-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 12px 15px;
          }
          .info-box .label {
            font-size: 11px;
            color: #6c757d;
            font-weight: 500;
            margin-bottom: 4px;
          }
          .info-box .value {
            font-size: 14px;
            font-weight: 700;
            color: #1a1a2e;
          }
          .scores-section {
            margin: 20px 0;
          }
          .scores-section h3 {
            font-family: 'Cairo', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #8A1538;
            margin-bottom: 15px;
            border-right: 4px solid #D4AF37;
            padding-right: 12px;
          }
          .score-bar {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 10px;
          }
          .score-bar .label {
            width: 120px;
            font-size: 12px;
            font-weight: 600;
            text-align: left;
          }
          .score-bar .bar-bg {
            flex: 1;
            height: 24px;
            background: #e9ecef;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
          }
          .score-bar .bar-fill {
            height: 100%;
            border-radius: 12px;
            transition: width 0.5s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            color: white;
          }
          .score-bar .score-value {
            width: 40px;
            text-align: center;
            font-weight: 700;
            font-size: 14px;
          }
          .total-score {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #8A1538, #6B1029);
            border-radius: 15px;
            color: white;
          }
          .total-score .circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid #D4AF37;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 900;
          }
          .notes-section {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #e9ecef;
          }
          .notes-section h4 {
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: #8A1538;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #D4AF37;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer .signature {
            text-align: center;
          }
          .footer .signature .line {
            width: 150px;
            border-bottom: 1px solid #333;
            margin: 30px auto 5px;
          }
          .footer .arkan {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .footer .arkan img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }
          @media print {
            body { background: white; }
            .report-page { padding: 15mm; }
          }
        </style>
      </head>
      <body>
        ${reportRef.current.innerHTML}
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return '#22C55E';
    if (score >= 3) return '#3B82F6';
    if (score >= 2) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'ممتاز';
    if (score >= 3.5) return 'جيد جداً';
    if (score >= 2.5) return 'جيد';
    if (score >= 1.5) return 'مقبول';
    return 'ضعيف';
  };

  return (
    <DashboardLayout pageTitle="تقارير زيارات الصفية">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowArchive(!showArchive)}
          className="px-4 py-2 rounded-xl bg-[#1B3A5C] text-white font-cairo text-sm flex items-center gap-2 hover:bg-[#122942] transition-all">
          <Archive size={16} /> الأرشيف ({archivedReports.length})
        </button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar — Visit List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-cairo font-bold text-sm text-[#1B3A5C]">قائمة الزيارات ({visits.length})</h3>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {visits.map(v => (
                <button key={v.id} onClick={() => setSelectedVisit(v)}
                  className={`w-full text-right px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-all flex items-center gap-3 ${selectedVisit?.id === v.id ? 'bg-[#8A1538]/5 border-r-4 border-r-[#8A1538]' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-[#8A1538]/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-[#8A1538]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-tajawal text-sm font-bold truncate">{v.teacherName}</p>
                    <p className="font-tajawal text-xs text-gray-500">{v.visitorName} — {v.visitDate}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-xs font-cairo font-bold flex-shrink-0" style={{
                    background: getScoreColor(v.scoreTotal) + '20',
                    color: getScoreColor(v.scoreTotal)
                  }}>{v.scoreTotal}</span>
                </button>
              ))}
              {visits.length === 0 && (
                <div className="p-8 text-center font-cairo text-gray-400 text-sm">لا يوجد زيارات</div>
              )}
            </div>
          </div>
        </div>

        {/* Main — Report Preview */}
        <div className="flex-1">
          {showArchive ? (
            /* Archive View */
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="font-cairo font-bold text-lg text-[#1B3A5C] mb-4 flex items-center gap-2">
                <Archive size={20} className="text-[#D4AF37]" /> الأرشيف
              </h2>
              {archivedReports.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 rounded-xl transition-all">
                  <div>
                    <p className="font-cairo font-bold text-sm">{r.title}</p>
                    <p className="font-tajawal text-xs text-gray-500">{r.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedVisit(r.data)}
                      className="px-3 py-1.5 rounded-lg bg-[#8A1538] text-white font-cairo text-xs">عرض</button>
                    <button onClick={() => {
                      const updated = archivedReports.filter(a => a.id !== r.id);
                      setArchivedReports(updated);
                      localStorage.setItem('ertiqa_archived_reports', JSON.stringify(updated));
                    }} className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-cairo text-xs">حذف</button>
                  </div>
                </div>
              ))}
              {archivedReports.length === 0 && (
                <p className="text-center font-cairo text-gray-400 py-8">لا يوجد تقارير مؤرشفة</p>
              )}
            </div>
          ) : selectedVisit ? (
            <>
              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-[#8A1538] text-white font-cairo font-bold text-sm flex items-center gap-2 hover:bg-[#6B1029] transition-all shadow-md">
                  <Printer size={16} /> طباعة / PDF
                </button>
                <button onClick={saveToArchive}
                  className="px-4 py-2 rounded-xl bg-[#1B3A5C] text-white font-cairo font-bold text-sm flex items-center gap-2 hover:bg-[#122942] transition-all shadow-md">
                  <Archive size={16} /> حفظ في الأرشيف
                </button>
              </div>

              {/* Report Preview */}
              <div ref={reportRef} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-[#8A1538]">
                  <div className="flex items-center gap-4">
                    <img src="/pwa-icon-192.png" alt="شعار" className="w-16 h-16 rounded-full border-2 border-[#D4AF37]" />
                    <div>
                      <h1 className="font-cairo font-black text-xl text-[#8A1538]">نظام ارتقاء</h1>
                      <p className="font-cairo font-semibold text-sm text-[#1B3A5C]">مدرسة طارق بن زياد الثانوية للبنين</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-cairo font-bold text-lg text-[#8A1538] border-2 border-[#D4AF37] px-6 py-2 rounded-xl">
                      تقرير زيارة صفية
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="font-cairo text-xs text-gray-500 mb-1">الزائر</p>
                      <p className="font-tajawal font-bold text-sm">{selectedVisit.visitorName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="font-cairo text-xs text-gray-500 mb-1">المعلم</p>
                      <p className="font-tajawal font-bold text-sm">{selectedVisit.teacherName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="font-cairo text-xs text-gray-500 mb-1">المادة / الصف</p>
                      <p className="font-tajawal font-bold text-sm">{selectedVisit.subjectName} — {selectedVisit.className}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="font-cairo text-xs text-gray-500 mb-1">التاريخ / الوقت</p>
                      <p className="font-tajawal font-bold text-sm">{selectedVisit.visitDate} — {selectedVisit.visitTime}</p>
                    </div>
                  </div>

                  {/* Scores */}
                  <h3 className="font-cairo font-bold text-base text-[#8A1538] mb-4 border-r-4 border-[#D4AF37] pr-3">
                    معايير التقييم
                  </h3>

                  {[
                    { label: 'الأهداف معروضة وواضحة', score: selectedVisit.scoreObjectives || 0 },
                    { label: 'الطلبة متفاعلون', score: selectedVisit.scoreStudentEngagement || 0 },
                    { label: 'مدى الانضباط والنظام داخل الصف', score: selectedVisit.scoreDiscipline || 0 },
                    { label: 'المعلم متفاعل مع الطلاب', score: selectedVisit.scoreTeacherEngagement || 0 },
                    { label: 'يوفر المعلم بيئة صفية آمنة ومنظمة ومحفزة', score: selectedVisit.scoreEnvironment || 0 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 mb-3">
                      <span className="w-24 font-cairo text-xs font-bold text-right">{item.label}</span>
                      <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full flex items-center justify-center text-xs font-bold text-white transition-all"
                          style={{ width: `${(item.score / 5) * 100}%`, background: getScoreColor(item.score) }}>
                          {item.score}/5
                        </div>
                      </div>
                      <span className="w-12 font-cairo text-xs font-bold text-center" style={{ color: getScoreColor(item.score) }}>
                        {getScoreLabel(item.score)}
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex items-center justify-center gap-6 my-6 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #8A1538, #6B1029)' }}>
                    <div className="w-20 h-20 rounded-full border-4 border-[#D4AF37] flex items-center justify-center">
                      <span className="font-cairo font-black text-3xl text-white">{selectedVisit.scoreTotal}</span>
                    </div>
                    <div className="text-white text-center">
                      <p className="font-cairo font-bold text-lg">المجموع الكلي</p>
                      <p className="font-cairo text-3xl font-black">{getScoreLabel(selectedVisit.scoreTotal)}</p>
                    </div>
                    <Award size={48} className="text-[#D4AF37]" />
                  </div>

                  {/* Notes */}
                  {selectedVisit.notes && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="font-cairo font-bold text-sm text-[#8A1538] mb-2">ملاحظات</h4>
                      <p className="font-tajawal text-sm leading-relaxed">{selectedVisit.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-8 pt-4 border-t-2 border-[#D4AF37] flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-36 border-b border-gray-400 mb-2 pt-8"></div>
                      <p className="font-cairo text-xs text-gray-500">توقيع المنسق</p>
                    </div>
                    <div className="text-center">
                      <div className="w-36 border-b border-gray-400 mb-2 pt-8"></div>
                      <p className="font-cairo text-xs text-gray-500">توقيع المدير</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src="/assets/arkan-logo.jpg" alt="أركان" className="w-10 h-10 rounded-full" />
                      <span className="font-cairo text-xs text-gray-400">تصميم وتطوير أركان</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText size={64} className="mb-4 opacity-30" />
              <p className="font-cairo text-lg">اختر زيارة من القائمة لعرض التقرير</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
