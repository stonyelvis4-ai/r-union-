'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Vue d’ensemble', icon: '⌂' },
  { href: '/meetings', label: 'Réunions', icon: '◷' },
  { href: '/trainings', label: 'Formations', icon: '◇' },
  { href: '/admin/users', label: 'Participants', icon: '◉' },
  { href: '/settings', label: 'Réglages', icon: '⚙' },
];

function isActive(pathname: string, href: string) {
  return href === '/dashboard'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation administrateur"
      className="mb-7 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/75 p-2 shadow-xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex min-w-max gap-1.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${isActive(pathname, link.href) ? 'bg-gradient-to-br from-cyan-200 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'}`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
