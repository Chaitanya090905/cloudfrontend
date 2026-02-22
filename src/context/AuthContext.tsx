import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/utils';

export type UserRole = 'super_admin' | 'admin' | 'hod' | 'faculty' | 'student';

export interface User {
  uid: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  user_id: string;
  department_id?: string | null;
  department?: string;
  tenant_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  availableUsers: User[];
  fetchAvailableUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Institution Admin',
  hod: 'Head of Department',
  faculty: 'Faculty',
  student: 'Student',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: '#7c3aed',
  admin: '#2563eb',
  hod: '#6366f1',
  faculty: '#059669',
  student: '#ea580c',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const stored = localStorage.getItem('auth_user');
    if (token && stored) {
      try {
        api.setToken(token);
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const res = await api.get<any[]>('/api/auth/available-users');
      if (res.success && res.data) {
        setAvailableUsers(res.data.map((u: any) => ({
          uid: u.uid || u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          tenant_id: u.tenant_id,
          user_id: u.id,
          department_id: u.department_id,
          department: u.department_name || u.departments?.name,
          tenant_name: u.tenant_name || u.tenants?.name,
        })));
      }
    } catch {
      // Backend not ready, keep empty
    }
  };

  const login = (u: User, token: string) => {
    api.setToken(token);
    setUser(u);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const logout = () => {
    api.setToken('');
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, availableUsers, fetchAvailableUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
