'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const base = getApiBase();
    try {
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Identifiants incorrects');
      }
      const { token } = await res.json();
      if (typeof window !== 'undefined') localStorage.setItem('token', token);
      router.push('/meetings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-2xl shadow-gray-300 dark:shadow-slate-950/70 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(129,140,248,0.3),transparent_55%)]" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
                Connexion
              </p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-50">Espace SmartReunion</h1>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-300 p-[2px] shadow-sky-500/50">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-950 text-lg">
                🔐
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                <span aria-hidden>📧</span> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/60 px-3 py-2 text-sm text-gray-900 dark:text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                <span aria-hidden>🔑</span> Mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/60 px-3 py-2 pr-20 text-sm text-gray-900 dark:text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-sky-500 hover:text-sky-400"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-sky-500 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:-translate-y-0.5 hover:bg-sky-400 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500 dark:text-slate-300">
            Comptes de démo : <span className="font-semibold">admin@demo.local</span> et{' '}
            <span className="font-semibold">participant@demo.local</span> (mot de passe{' '}
            <span className="font-semibold">Demo123!</span>).
          </p>

          <p className="mt-2 text-center text-xs text-gray-500 dark:text-slate-300">
            Pas encore de compte ?{' '}
            <Link href="/register" className="inline-flex items-center gap-1 font-semibold text-blue-300 hover:text-blue-200">
              <span aria-hidden>✨</span> Créer un compte participant
            </Link>
          </p>

          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-300 hover:text-sky-300"
          >
            <span aria-hidden>←</span>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
