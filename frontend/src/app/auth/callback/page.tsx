'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@/services/api';
import { supabase } from '@/services/supabase';

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function finishGoogleSignIn() {
      if (!supabase) {
        setError('La connexion Google n’est pas encore configurée.');
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setError('La session Google est introuvable. Réessayez la connexion.');
        return;
      }

      const response = await fetch(`${getApiBase()}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }),
      });
      const payload = (await response.json().catch(() => ({}))) as { token?: string; message?: string };

      if (!response.ok || !payload.token) {
        setError(payload.message || 'La connexion Google a échoué.');
        return;
      }

      localStorage.setItem('token', payload.token);
      router.replace('/meetings');
    }

    void finishGoogleSignIn();
  }, [router]);

  return (
    <main className="sr-grid flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-50">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        {error ? (
          <>
            <p className="text-sm text-rose-300">{error}</p>
            <button type="button" onClick={() => router.replace('/login')} className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              Revenir à la connexion
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-lg text-slate-950">G</div>
            <h1 className="mt-4 text-lg font-semibold">Connexion sécurisée</h1>
            <p className="mt-2 text-sm text-slate-400">Nous finalisons votre accès SmartReunion…</p>
          </>
        )}
      </div>
    </main>
  );
}
