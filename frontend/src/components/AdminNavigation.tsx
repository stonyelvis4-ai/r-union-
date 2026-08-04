'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/settings', label: 'Réglages', icon: '⚙' },
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/meetings', label: 'Réunions', icon: '◷' },
  { href: '/trainings', label: 'Formations', icon: '▣' },
  { href: '/admin/users', label: 'Participants', icon: '◉' },
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
      className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-lg shadow-slate-950/15"
    >
      <div className="flex min-w-max gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive(pathname, link.href) ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/15' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
