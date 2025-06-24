import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-4 px-8 border-b border-card">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
          <ShieldAlert className="h-8 w-8" />
          <h1>DarkFire</h1>
        </Link>
      </div>
    </header>
  );
}
