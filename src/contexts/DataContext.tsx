import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/contexts/AuthContext';
import type { RouterOutputs } from '@/providers/trpc';

/* ─── Types ─── */
type SchoolUser = RouterOutputs['user']['list'][number];
type Subject = RouterOutputs['subject']['list'][number];
type Teacher = RouterOutputs['teacher']['list'][number];
type Visit = RouterOutputs['visit']['list'][number];
type Notification = RouterOutputs['notification']['list'][number];

interface DataContextType {
  // Data
  users: SchoolUser[];
  subjects: Subject[];
  teachers: Teacher[];
  visits: Visit[];
  notifications: Notification[];
  myNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  syncStatus: 'online' | 'offline' | 'syncing';
  lastSyncTime: string;

  // Actions
  refetchAll: () => void;
  refetchVisits: () => void;
  refetchNotifications: () => void;
  markNotificationRead: (id: number) => void;
  markAllRead: () => void;

  // Auth login
  loginUser: (name: string, password: string) => Promise<SchoolUser | null>;

  // Friday/Saturday check
  isWeekend: (date: string) => boolean;
}

const DataContext = createContext<DataContextType>({
  users: [],
  subjects: [],
  teachers: [],
  visits: [],
  notifications: [],
  myNotifications: [],
  unreadCount: 0,
  isLoading: true,
  syncStatus: 'syncing',
  lastSyncTime: '',
  refetchAll: () => {},
  refetchVisits: () => {},
  refetchNotifications: () => {},
  markNotificationRead: () => {},
  markAllRead: () => {},
  loginUser: async () => null,
  isWeekend: () => false,
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState('');

  const utils = trpc.useUtils();

  // ─── tRPC Queries ───
  const { data: usersData, isLoading: usersLoading } = trpc.user.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: 3,
  });

  const { data: subjectsData, isLoading: subjectsLoading } = trpc.subject.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: 3,
  });

  const { data: teachersData, isLoading: teachersLoading } = trpc.teacher.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: 3,
  });

  const { data: visitsData, isLoading: visitsLoading, refetch: refetchVisits } = trpc.visit.list.useQuery(undefined, {
    staleTime: 1000 * 30,
    refetchInterval: 5000, // Poll every 5 seconds for cross-device sync
    retry: 3,
  });

  const { data: notificationsData, isLoading: notifsLoading, refetch: refetchNotifications } = trpc.notification.list.useQuery(undefined, {
    staleTime: 1000 * 15,
    refetchInterval: 5000,
    retry: 3,
  });

  // ─── Filter notifications for current user ───
  const myNotifications = React.useMemo(() => {
    if (!notificationsData || !user?.role) return [];

    return notificationsData.filter(n => {
      if (!n.targetRoles) return false;
      const roles = n.targetRoles as string[];

      const roleMatch = roles.some((r: string) => {
        if (user.role === 'manager') return r === 'manager';
        if (user.role === 'academic_vp') return r === 'academic_vp' || r === 'manager';
        if (user.role === 'admin_vp') return r === 'admin_vp' || r === 'manager';
        if (user.role === 'coordinator') return r === 'coordinator';
        if (user.role === 'sysadmin') return true;
        return false;
      });

      if (user.role === 'coordinator' && n.targetSubjectId && user.subjectId) {
        return roleMatch && n.targetSubjectId === Number(user.subjectId);
      }

      return roleMatch;
    });
  }, [notificationsData, user]);

  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  // ─── Mark notification read ───
  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });
  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const markNotificationRead = useCallback((id: number) => {
    markReadMutation.mutate({ id });
  }, [markReadMutation]);

  const markAllRead = useCallback(() => {
    if (!user?.role) return;
    markAllReadMutation.mutate({
      role: user.role,
      subjectId: user.subjectId ? Number(user.subjectId) : undefined,
    });
  }, [markAllReadMutation, user]);

  // ─── Sync status ───
  useEffect(() => {
    const allLoaded = !usersLoading && !subjectsLoading && !teachersLoading && !visitsLoading && !notifsLoading;
    if (allLoaded) {
      setSyncStatus('online');
      setLastSyncTime(new Date().toLocaleTimeString('ar-QA'));
    } else {
      setSyncStatus('syncing');
    }
  }, [usersLoading, subjectsLoading, teachersLoading, visitsLoading, notifsLoading]);

  // ─── Refetch all ───
  const refetchAll = useCallback(() => {
    utils.user.list.invalidate();
    utils.subject.list.invalidate();
    utils.teacher.list.invalidate();
    utils.visit.list.invalidate();
    utils.notification.list.invalidate();
    setLastSyncTime(new Date().toLocaleTimeString('ar-QA'));
  }, [utils]);

  // ─── Login via tRPC ───
  const loginUser = useCallback(async (name: string, password: string): Promise<SchoolUser | null> => {
    try {
      const result = await utils.client.user.login.mutate({ name, password });
      return result as SchoolUser | null;
    } catch {
      return null;
    }
  }, [utils]);

  // ─── Weekend check ───
  const isWeekend = useCallback((dateStr: string): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 5 || day === 6; // Friday=5, Saturday=6
  }, []);

  const isLoading = usersLoading || subjectsLoading || teachersLoading || visitsLoading || notifsLoading;

  return (
    <DataContext.Provider value={{
      users: usersData ?? [],
      subjects: subjectsData ?? [],
      teachers: teachersData ?? [],
      visits: visitsData ?? [],
      notifications: notificationsData ?? [],
      myNotifications,
      unreadCount,
      isLoading,
      syncStatus,
      lastSyncTime,
      refetchAll,
      refetchVisits,
      refetchNotifications,
      markNotificationRead,
      markAllRead,
      loginUser,
      isWeekend,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
