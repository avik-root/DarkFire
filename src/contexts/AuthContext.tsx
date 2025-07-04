
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import type { PublicUser } from '@/lib/auth-shared';
import { USER_COOKIE } from '@/lib/auth-shared';


interface AuthContextType {
  user: PublicUser | null;
  login: (data: PublicUser) => void;
  logout: () => void;
  signup: (data: PublicUser) => void;
  updateUser: (data: PublicUser) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = Cookies.get(USER_COOKIE);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        Cookies.remove(USER_COOKIE);
      }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === 'admin';

  const login = (userData: PublicUser) => {
    Cookies.set(USER_COOKIE, JSON.stringify(userData), { expires: 7 });
    setUser(userData);
    if (userData.role === 'admin') {
        router.push('/admin/dashboard');
    } else if (!userData.formSubmitted) {
        router.push('/request-access');
    } else {
        router.push('/playground');
    }
  };

  const logout = () => {
    Cookies.remove(USER_COOKIE);
    setUser(null);
    router.push('/login');
  };
  
  const signup = (userData: PublicUser) => {
    Cookies.set(USER_COOKIE, JSON.stringify(userData), { expires: 7 });
    setUser(userData);
    router.push('/request-access');
  };

  const updateUser = (userData: PublicUser) => {
    Cookies.set(USER_COOKIE, JSON.stringify(userData), { expires: 7 });
    setUser(userData);
  };

  const value = { 
    user, 
    login, 
    logout, 
    signup,
    updateUser, 
    isAuthenticated: !loading && !!user, 
    isAdmin: !loading && isAdmin,
    loading
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
