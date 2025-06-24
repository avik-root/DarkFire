
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { addUser as addUserToRegistry } from '@/services/userService';

export interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: any) => void;
  logout: () => void;
  signup: (data: any) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'admin@darkfire.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const login = (data: { email: string }) => {
    const newUser = { email: data.email };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    if (data.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
    } else {
        router.push('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };
  
  const signup = (data: { email: string }) => {
    const newUser = { email: data.email };
    addUserToRegistry(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    router.push('/');
  };

  const value = { 
    user, 
    login, 
    logout, 
    signup, 
    isAuthenticated: !loading && !!user, 
    isAdmin: !loading && isAdmin 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
