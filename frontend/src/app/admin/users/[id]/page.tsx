'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
}

export default function AdminEditUserPage() {
  const API_BASE = getApiBase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const role = 'PARTICIPANT';
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadUser, setLoadUser] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token || !id) return;
    fetch(`${API_BASE}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 403) router.push('/admin/users');
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name ?? '');
          setIsActive(data.isActive);
        }
      })
      .finally(() => setLoadUser(false));
  }, [id, token, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    setLoading(true);
    setError('');
    const body: { name?: string; isActive?: boolean; password?: string } = {
      name: name.trim() || undefined,
      isActive,
    };
    if (password.length) body.password = password;
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => { throw new Error(err.message || err.error || 'Erreur'); });
        return res.json();
      })
      .then((updated) => {
        setUser(updated);
        setPassword('');
      })
      .catch((err) => setError(err.message || 'Erreur'))
      .finally(() => setLoading(false));
  };

  if (loadUser || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-700 dark:text-slate-200">
        <p className="text-sm">Chargement&hellip;</p>
      </div>
    );
  }

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
            <span aria-hidden className="text-sky-400">✏️</span>
            Modifier {user.email}
          </h1>
        </header>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xl shadow-gray-200 dark:shadow-slate-950/60"
        >
          {error && <p className="mb-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>📧</span> Email
              </label>
              <p className="mt-1 text-sm text-gray-400 dark:text-slate-400">{user.email}</p>
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
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>🏷️</span> Rôle
              </label>
              <select disabled
                value={role}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                <option value="PARTICIPANT">Participant</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 dark:border-slate-600"
                />
                <span className="inline-flex items-center gap-1">
                  {isActive ? <span aria-hidden>✅</span> : <span aria-hidden>❌</span>}
                  Compte actif
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>🔑</span> Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                placeholder="Laisser vide pour ne pas changer"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-50"
            >
              <span aria-hidden>💾</span>
              {loading ? 'Enregistrement\u2026' : 'Enregistrer'}
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
