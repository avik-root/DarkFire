
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface FooterProps {
  adminLoginUrl: string;
}

export default function Footer({ adminLoginUrl }: FooterProps) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // This runs only on the client, after the initial render,
    // which prevents a hydration mismatch.
    setYear(new Date().getFullYear());
  }, []);

  const adminLinkText = adminLoginUrl === '/signup' ? 'Create Admin Account' : 'Admin Login';

  return (
    <footer className="py-6 px-8 mt-auto border-t border-card">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
        {/* The year is rendered only on the client after hydration, preventing a mismatch */}
        <p>&copy; {year || ''} DarkFire by MintFire. All rights reserved.</p>
        <div className="flex gap-x-6">
            <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href={adminLoginUrl} className="hover:text-primary transition-colors">{adminLinkText}</Link>
        </div>
      </div>
    </footer>
  );
}
