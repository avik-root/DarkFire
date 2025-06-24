"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="py-6 px-8 mt-auto border-t border-card">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DarkFire. All rights reserved.</p>
        {!isAuthenticated && (
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/login" className="hover:text-primary transition-colors">Admin Login</Link>
            <Link href="/signup" className="hover:text-primary transition-colors">Create Account</Link>
          </div>
        )}
      </div>
    </footer>
  );
}
