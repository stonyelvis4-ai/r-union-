'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/services/api';
import { supabase } from '@/services/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
      const res = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { message?: string; error?: string }).message ||
            (data as { error?: string }).error ||
            'Inscription impossible'
        );
      }
      const data = (await res.json()) as { token?: string };
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('token', data.token);
      }
      router.push('/meetings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    if (!supabase) {
      setError('La connexion Google est en cours de configuration.');
      return;
    }

    setError('');
    setLoading(true);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (googleError) {
      setError("Impossible de démarrer l'inscription avec Google.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-900 dark:text-slate-50">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-2xl shadow-gray-300 dark:shadow-slate-950/70 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.4),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(37,99,235,0.35),transparent_55%)]" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">Inscription</p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-50">Créer un compte participant</h1>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-300 p-[2px] shadow-blue-500/50">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-950 text-lg">
                ✨
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-blue-600 shadow-sm">G</span>
            S'inscrire avec Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
            <span className="h-px flex-1 bg-gray-200 dark:bg-slate-800" />
            ou
            <span className="h-px flex-1 bg-gray-200 dark:bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                <span aria-hidden>👤</span> Nom (optionnel)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/60 px-3 py-2 text-sm text-gray-900 dark:text-slate-50 outline-none ring-blue-500/0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300"><span aria-hidden>📧</span> Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/60 px-3 py-2 text-sm text-gray-900 dark:text-slate-50 outline-none ring-blue-500/0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                <span aria-hidden>🔑</span> Mot de passe (min. 8 caractères)
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/60 px-3 py-2 pr-20 text-sm text-gray-900 dark:text-slate-50 outline-none ring-blue-500/0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-blue-500 hover:text-blue-400"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-blue-500 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 transition hover:-translate-y-0.5 hover:bg-blue-400 disabled:opacity-50"
            >
              {loading ? 'Inscription…' : "S'inscrire"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500 dark:text-slate-300">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-blue-300 hover:text-blue-200">
              <span aria-hidden>🔐</span> Se connecter
            </Link>
          </p>

          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-300 hover:text-blue-300"
          >
            <span aria-hidden>←</span>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
