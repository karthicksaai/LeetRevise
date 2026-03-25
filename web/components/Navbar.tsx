'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface NavbarProps {
  userEmail?: string;
  userName?: string;
}

export default function Navbar({ userEmail, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="px-5 py-4 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight">
          LeetRevise
        </Link>
        <div className="flex gap-4">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/analytics', label: 'Analytics' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-xs text-white/30 hidden sm:block">{userName}</span>
        )}
        <button
          onClick={handleSignOut}
          className="text-xs text-white/20 hover:text-white/50 transition-colors"
        >
          sign out
        </button>
      </div>
    </nav>
  );
}
