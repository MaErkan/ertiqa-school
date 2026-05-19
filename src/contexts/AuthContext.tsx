import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'academic_vp' | 'admin_vp' | 'coordinator' | 'sysadmin';
  roleLabel: string;
  subjectId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, roleType?: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
});

const USERS_KEY = 'ertiqa_users';
const CURRENT_USER_KEY = 'ertiqa_current_user';

/* ═══════════════════════════════════════════
   بيانات الموظفين من ملف قائمة الموظفين
   ═══════════════════════════════════════════ */

const defaultUsers: User[] = [
  // ═══ الإدارة العليا (3) ═══
  { id: 'admin-1', name: 'يوسف إبراهيم يوسف جاسم الجاسم', email: 'y.al-jassim0101@education.qa', role: 'manager', roleLabel: 'مدير المدرسة' },
  { id: 'admin-2', name: 'أحمد محمد رمضان محمد', email: 'a.mohamed2211@education.qa', role: 'academic_vp', roleLabel: 'النائب الأكاديمي' },
  { id: 'admin-3', name: 'حمد هادي محمد الغفراني المري', email: 'h.almarri23103@education.qa', role: 'admin_vp', roleLabel: 'النائب الإداري' },

  // ═══ منسقو المواد (11) ═══
  { id: 'coord-1', name: 'عبدالله الشافعي محمد نعسان السيد', email: 'a.alsayed0101@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's1' },
  { id: 'coord-2', name: 'أحمد حسين عموش', email: 'a.amooush0503@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's2' },
  { id: 'coord-3', name: 'محمد حامد عبدالفتاح محمد عبدالله', email: 'm.abdallah0108@education.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's3' },
  { id: 'coord-4', name: 'شريف عبدالمنعم عبدالحي البرلسي', email: 'coordinator-math@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's4' },
  { id: 'coord-5', name: 'أشرف السيد جودة السيد محمد', email: 'coordinator-physics@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's5' },
  { id: 'coord-6', name: 'حسام محمد أبو النصر محمد الزياتي', email: 'coordinator-chem@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's6' },
  { id: 'coord-7', name: 'أحمد عبدالحميد أحمد عبدالمحسن', email: 'coordinator-bio@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's7' },
  { id: 'coord-8', name: 'علاء معوض إبراهيم حمودة', email: 'coordinator-social@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's8' },
  { id: 'coord-9', name: 'محمد فتحي إبراهيم فريج', email: 'coordinator-it@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's9' },
  { id: 'coord-10', name: 'محمد جواد علي أكبر محمد جواد لاري', email: 'coordinator-pe@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's10' },
  { id: 'coord-11', name: 'هيثم محمد محمد أحمد الشامي', email: 'coordinator-el@ertiqa.edu.qa', role: 'coordinator', roleLabel: 'منسق مادة', subjectId: 's11' },

  // ═══ مسؤولو النظام (2) ═══
  { id: 'sys-1', name: 'الأستاذ يوسف الجاسم', email: 'sysadmin1@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام' },
  { id: 'sys-2', name: 'الدكتور أحمد رمضان', email: 'sysadmin2@ertiqa.edu.qa', role: 'sysadmin', roleLabel: 'مسؤول النظام' },
];

function getStoredUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  });

  const login = useCallback((email: string, _password: string, _roleType?: string): boolean => {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email);
    if (!found) return false;
    setUser(found);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
