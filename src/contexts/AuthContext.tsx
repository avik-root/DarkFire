
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { addUser as addUserToRegistry } from '@/services/userService';
import Cookies from 'js-cookie';
import { ADMIN_EMAIL, USER_COOKIE } from '@/lib/auth-constants';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from cookies
    const storedUser = Cookies.get(USER_COOKIE);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        Cookies.remove(USER_COOKIE);
      }
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const login = (data: { email: string }) => {
    const newUser = { email: data.email };
    Cookies.set(USER_COOKIE, JSON.stringify(newUser), { expires: 7 });
    setUser(newUser);
    if (data.email === ADMIN_EMAIL) {
        router.push('/admin/dashboard');
    } else {
        router.push('/');
    }
  };

  const logout = () => {
    Cookies.remove(USER_COOKIE);
    setUser(null);
    router.push('/login');
  };
  
  const signup = (data: { email: string }) => {
    const newUser = { email: data.email };
    addUserToRegistry(newUser);
    Cookies.set(USER_COOKIE, JSON.stringify(newUser), { expires: 7 });
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
