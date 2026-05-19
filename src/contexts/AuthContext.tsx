import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'academic_vp' | 'admin_vp' | 'coordinator' | 'sysadmin';
  subjectId?: string;
  subjectName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const defaultUsers: User[] = [
  { id: '1', name: 'مدير المدرسة', email: 'manager@ertiqa.qa', role: 'manager' },
  { id: '2', name: 'النائب الأكاديمي', email: 'academic@ertiqa.qa', role: 'academic_vp' },
  { id: '3', name: 'مسؤول النظام', email: 'admin@ertiqa.qa', role: 'sysadmin' },
];

const AuthContext = createContext<AuthContextType>({ user: null, login: () => false, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, password: string) => {
    if (password !== 'admin123') return false;
    const found = defaultUsers.find(u => u.email.startsWith(username) || u.id === username);
    if (found) { setUser(found); return true; }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
