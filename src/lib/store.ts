import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  data: Record<string, any>;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  notifications: Notification[];
  unreadCount: number;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isAdmin: () => boolean;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  notifications: [],
  unreadCount: 0,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  }),
  markNotificationRead: (id) => set(state => {
    const notifications = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    return {
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    };
  }),
  markAllNotificationsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  isAdmin: () => get().profile?.is_admin || false,
  clearAuth: () => set({ user: null, profile: null, notifications: [], unreadCount: 0 })
}));