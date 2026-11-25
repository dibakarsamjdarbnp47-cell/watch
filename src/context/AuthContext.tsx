import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AdminSettings, AppNotification } from '../types/index.js';
import { initialUsers, initialSettings, initialNotifications } from '../../server/data.js';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  settings: AdminSettings | null;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  isAdmin: boolean;
  login: (loginId: string) => Promise<boolean>;
  logout: () => void;
  updateMyProfile: (updates: Partial<User>) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>({ ...initialSettings });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // Helper to construct secure request headers
  const getAuthHeaders = () => {
    const userId = currentUser?.id || localStorage.getItem('wdh_auth_user_id') || '';
    const role = currentUser?.role || localStorage.getItem('wdh_auth_role') || 'member';
    const token = localStorage.getItem('wdh_auth_token') || `demo-jwt-token-${userId}`;
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': role,
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch notifications for a specific user ID
  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications/${userId}`, {
        headers: getAuthHeaders(),
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      setNotifications(initialNotifications.filter((n) => n.userId === 'ALL' || n.userId === userId));
    }
  };

  // Fetch admin-only full users list
  const fetchAdminUsersList = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load admin user list:', e);
    }
    // Fallback if API fails
    setUsers([...initialUsers]);
  };

  // Initialize session and restore user data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      // Determine stored session ID or initialize with default member
      let activeId = localStorage.getItem('wdh_auth_user_id');
      if (!activeId) {
        activeId = 'WDH-100001';
        localStorage.setItem('wdh_auth_user_id', activeId);
        localStorage.setItem('wdh_auth_role', 'member');
        localStorage.setItem('wdh_auth_token', `demo-jwt-token-${activeId}`);
      }

      // Fetch active user profile from secure endpoint
      const userRes = await fetch(`/api/users/${activeId}`, {
        headers: {
          'x-user-id': activeId,
          'x-user-role': localStorage.getItem('wdh_auth_role') || 'member',
          Authorization: `Bearer ${localStorage.getItem('wdh_auth_token')}`,
        },
      });

      let loadedUser: User | null = null;
      if (userRes.ok) {
        loadedUser = await userRes.json();
      } else {
        // Fallback to local data matching ID
        loadedUser = initialUsers.find((u) => u.id.toLowerCase() === activeId!.toLowerCase()) || null;
      }

      if (loadedUser) {
        setCurrentUser(loadedUser);
        localStorage.setItem('wdh_auth_role', loadedUser.role);
        fetchNotifications(loadedUser.id);

        // Security check: only administrators receive the full user directory
        if (loadedUser.role === 'admin' || loadedUser.role === 'superadmin') {
          await fetchAdminUsersList();
        } else {
          // Regular users ONLY have their own record in memory
          setUsers([loadedUser]);
        }
      }

      // Fetch public/admin settings
      const settingsRes = await fetch('/api/admin/settings', {
        headers: {
          'x-user-id': activeId,
          'x-user-role': loadedUser?.role || 'member',
        },
      }).catch(() => null);

      if (settingsRes && settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh current user's profile
  const refreshUserData = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const updated: User = await res.json();
        setCurrentUser(updated);
        fetchNotifications(updated.id);
        if (!isAdmin) {
          setUsers([updated]);
        }
      }
    } catch (e) {
      console.warn('Failed to refresh current user');
    }
  };

  // Update current user's own profile and account details
  const updateMyProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          if (isAdmin) {
            setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
          } else {
            setUsers([data.user]);
          }
          return true;
        }
      }
    } catch (e) {
      console.error('Profile update failed:', e);
    }
    return false;
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Secure login handler
  const login = async (loginId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const authenticatedUser: User = data.user;
          const token = data.token || `demo-jwt-token-${authenticatedUser.id}`;

          // Persist session securely
          localStorage.setItem('wdh_auth_user_id', authenticatedUser.id);
          localStorage.setItem('wdh_auth_role', authenticatedUser.role);
          localStorage.setItem('wdh_auth_token', token);

          setCurrentUser(authenticatedUser);
          fetchNotifications(authenticatedUser.id);

          // Role-based data loading
          if (authenticatedUser.role === 'admin' || authenticatedUser.role === 'superadmin') {
            await fetchAdminUsersList();
          } else {
            // Member isolation: non-admin only sees themselves
            setUsers([authenticatedUser]);
          }

          return true;
        }
      }
    } catch (e) {
      console.warn('API login error, trying fallback authentication:', e);
    }

    // Client-side fallback authentication
    const clean = loginId.trim().toLowerCase();
    const fallbackUser = initialUsers.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        u.mobile === loginId.trim()
    );

    if (fallbackUser) {
      localStorage.setItem('wdh_auth_user_id', fallbackUser.id);
      localStorage.setItem('wdh_auth_role', fallbackUser.role);
      localStorage.setItem('wdh_auth_token', `demo-jwt-token-${fallbackUser.id}`);

      setCurrentUser(fallbackUser);
      fetchNotifications(fallbackUser.id);

      if (fallbackUser.role === 'admin' || fallbackUser.role === 'superadmin') {
        setUsers([...initialUsers]);
      } else {
        setUsers([fallbackUser]);
      }
      return true;
    }

    return false;
  };

  // Secure logout handler
  const logout = () => {
    localStorage.removeItem('wdh_auth_user_id');
    localStorage.removeItem('wdh_auth_role');
    localStorage.removeItem('wdh_auth_token');
    setCurrentUser(null);
    setUsers([]);
    setNotifications([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        settings,
        notifications,
        unreadCount,
        loading,
        isAdmin,
        login,
        logout,
        updateMyProfile,
        updateProfile: updateMyProfile,
        refreshUserData,
        refreshAllData,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

