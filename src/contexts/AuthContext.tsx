import React, { createContext, useContext, useState, useCallback } from 'react';
import { users, type User } from '@/data/demoData';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string, roleType?: string) => {
    let foundUser: User | undefined;

    // Try to find by exact email first
    foundUser = users.find(u => u.email === email);

    // Fallback by role type if no email match
    if (!foundUser && roleType) {
      if (roleType === 'administration') {
        foundUser = users.find(u => ['manager', 'academic_vp', 'admin_vp'].includes(u.role));
      } else if (roleType === 'coordinator') {
        foundUser = users.find(u => u.role === 'coordinator');
      } else if (roleType === 'sysadmin') {
        foundUser = users.find(u => u.role === 'sysadmin');
      }
    }

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('ertiqa_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ertiqa_user');
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem('ertiqa_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
