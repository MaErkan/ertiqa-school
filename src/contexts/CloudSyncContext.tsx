import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

export interface VisitData {
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
  scoreStudentEngagement: number;
  scoreDiscipline: number;
  scoreTeacherEngagement: number;
  scoreEnvironment: number;
  scoreTotal: number;
  notes: string;
  status: 'sent' | 'draft';
  visibleTo: string[];
  createdAt: string;
  deviceId?: string;
}

interface CloudSyncContextType {
  visits: VisitData[];
  subjects: { id: string; name: string; coordinatorName: string; teachers: { id: string; name: string }[] }[];
  teachers: { id: string; name: string; subjectId: string }[];
  addVisit: (v: any) => void;
}

const subjectsData = [
  { id: 's1', name: 'التربية الإسلامية', coordinatorName: 'أحمد محمد', teachers: [{ id: 't1', name: 'علي عبدالله' }, { id: 't2', name: 'خالد سعيد' }] },
  { id: 's2', name: 'اللغة العربية', coordinatorName: 'محمد أحمد', teachers: [{ id: 't3', name: 'عبدالرحمن علي' }, { id: 't4', name: 'يوسف إبراهيم' }] },
  { id: 's3', name: 'الرياضيات', coordinatorName: 'خالد عمر', teachers: [{ id: 't5', name: 'سعد محمد' }, { id: 't6', name: 'فهد عبدالله' }] },
  { id: 's4', name: 'اللغة الفرنسية', coordinatorName: '—', teachers: [{ id: 't79', name: 'إسلام أحمد عبدالعزيز سيد أحمد' }] },
  { id: 's5', name: 'اللغة الألمانية', coordinatorName: '—', teachers: [{ id: 't82', name: 'هشام محمد السيد إبراهيم' }] },
  { id: 's6', name: 'اللغة اليابانية', coordinatorName: '—', teachers: [{ id: 't85', name: 'محمود عيد محمود إبراهيم' }] },
];

const teachersData = subjectsData.flatMap(s => s.teachers.map(t => ({ ...t, subjectId: s.id })));

const CloudSyncContext = createContext<CloudSyncContextType>({
  visits: [], subjects: subjectsData, teachers: teachersData, addVisit: () => {}
});

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const addVisit = (v: any) => {
    const visits = JSON.parse(localStorage.getItem('ertiqa_visits') || '[]');
    visits.unshift(v);
    localStorage.setItem('ertiqa_visits', JSON.stringify(visits));
  };

  return (
    <CloudSyncContext.Provider value={{
      visits: JSON.parse(localStorage.getItem('ertiqa_visits') || '[]'),
      subjects: subjectsData,
      teachers: teachersData,
      addVisit
    }}>
      {children}
    </CloudSyncContext.Provider>
  );
}

export const useCloudSync = () => useContext(CloudSyncContext);
