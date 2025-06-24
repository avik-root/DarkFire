
"use client";

import Link from 'next/link';
import { ShieldAlert, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();

  return (
    <header className="py-4 px-8 border-b border-card">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
          <ShieldAlert className="h-8 w-8" />
          <h1>DarkFire</h1>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
               {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
             <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
