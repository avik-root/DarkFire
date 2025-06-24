
"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-6 px-8 mt-auto border-t border-card">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
        <p>&copy; {new Date().getFullYear()} DarkFire. All rights reserved.</p>
        <div className="flex gap-x-6">
            <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
