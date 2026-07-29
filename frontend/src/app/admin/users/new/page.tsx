'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/services/api';

export default function AdminNewUserPage() {
  const API_BASE = getApiBase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'PARTICIPANT'>('PARTICIPANT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        role,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message || err.error || 'Erreur'); });
        return res.json();
      })
      .then(() => router.push('/admin/users'))
      .catch((err) => setError(err.message || 'Erreur'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 pb-10 pt-6 text-gray-900 dark:text-slate-50">
      <div className="mx-auto max-w-lg">
        <header className="mb-6">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-300"
          >
            <span aria-hidden>⚙️</span>
            Retour aux utilisateurs
          </Link>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span aria-hidden className="text-blue-400">👤</span>
            Nouvel utilisateur
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
            Remplissez les informations pour créer un nouveau compte.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xl shadow-gray-200 dark:shadow-slate-950/60"
        >
          {error && <p className="mb-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>📧</span> Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="utilisateur@example.com"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>🔑</span> Mot de passe *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="Min. 8 caractères"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>👤</span> Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="Nom complet"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>🏷️</span> Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'PARTICIPANT')}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                <option value="PARTICIPANT">Participant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-50"
            >
              <span aria-hidden>✅</span>
              {loading ? 'Création\u2026' : 'Créer'}
            </button>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-slate-600 px-5 py-2 text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <span aria-hidden>↩️</span> Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
