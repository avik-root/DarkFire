
"use client";

import Link from 'next/link';
import { ShieldAlert, LogOut, ShieldCheck, HardHat, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 py-4 px-8 border-b border-card bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
          <ShieldAlert className="h-8 w-8" />
          <h1>DarkFire</h1>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">Welcome, {user?.name}</span>
               {isAdmin ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              ) : (
                <>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/purchase">
                            <Heart className="mr-2 h-4 w-4" />
                            Purchase Key
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                    <Link href="/playground">
                        <HardHat className="mr-2 h-4 w-4" />
                        Playground
                    </Link>
                    </Button>
                </>
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
