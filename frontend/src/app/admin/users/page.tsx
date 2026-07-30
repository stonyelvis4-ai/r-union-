'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiBase } from '@/services/api';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const API_BASE = getApiBase();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      setError('Non autorisé');
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 403) {
          setError('Accès réservé aux administrateurs');
          return [];
        }
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError('Erreur'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDeactivate = (id: string) => {
    if (!token || !confirm('Désactiver cet utilisateur ?')) return;
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.status === 204) setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: false } : u)));
    });
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-900 dark:text-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white dark:bg-slate-900/80 p-6 text-center shadow-lg">
          <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-sky-500 dark:text-sky-300 hover:text-sky-400 dark:hover:text-sky-200">
            <span aria-hidden>🏠</span> Accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 pb-10 pt-6 text-gray-900 dark:text-slate-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
              <span aria-hidden className="text-amber-400">⚙️</span>
              Gestion des participants
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
              Créez et gérez uniquement les participants rattachés à votre espace.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/users/new"
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400"
            >
              <span aria-hidden>➕</span>
              Nouveau participant
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-slate-600 px-4 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <span aria-hidden>🏠</span>
              Accueil
            </Link>
          </div>
        </header>

        {loading ? (
          <p className="mt-8 text-sm text-gray-500 dark:text-slate-300">Chargement&hellip;</p>
        ) : users.length === 0 ? (
          <p className="mt-8 text-sm text-gray-500 dark:text-slate-300">Aucun participant dans votre espace.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-lg shadow-gray-200 dark:shadow-slate-950/60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700/80 text-xs uppercase tracking-wide text-gray-400 dark:text-slate-400">
                  <th className="px-4 py-3"><span className="inline-flex items-center gap-1">📧 Email</span></th>
                  <th className="px-4 py-3"><span className="inline-flex items-center gap-1">👤 Nom</span></th>
                  <th className="px-4 py-3"><span className="inline-flex items-center gap-1">🏷️ Rôle</span></th>
                  <th className="px-4 py-3"><span className="inline-flex items-center gap-1">🔘 Actif</span></th>
                  <th className="px-4 py-3"><span className="inline-flex items-center gap-1">⚡ Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-200 dark:border-slate-800/60 transition hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-gray-800 dark:text-slate-100">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-300">{u.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                      }`}>
                        {u.role === 'ADMIN' ? '🛡️' : '👤'} {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs ${u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {u.isActive ? '✅ Oui' : '❌ Non'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
                        >
                          <span aria-hidden>✏️</span> Modifier
                        </Link>
                        {u.isActive && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(u.id)}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300"
                          >
                            <span aria-hidden>🚫</span> Désactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
