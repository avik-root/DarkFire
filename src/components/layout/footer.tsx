"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // This runs only on the client, after the initial render,
    // which prevents a hydration mismatch.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-6 px-8 mt-auto border-t border-card">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
        {/* The year is rendered only on the client after hydration, preventing a mismatch */}
        <p>&copy; {year || ''} DarkFire. All rights reserved.</p>
        <div className="flex gap-x-6">
            <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
