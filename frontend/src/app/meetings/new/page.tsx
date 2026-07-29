'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/services/api';

export default function NewMeetingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const participantEmails = emails
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setError('Connectez-vous pour créer une réunion.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${getApiBase()}/meetings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            date,
            time,
            location: location || undefined,
            agenda: agenda || undefined,
            participantEmails: participantEmails.length ? participantEmails : undefined,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Erreur');
      }
      const meeting = await res.json();
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-5 text-gray-900 dark:text-slate-50 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <span aria-hidden className="text-blue-400">➕</span>
              Nouvelle réunion
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
              Définissez les informations de la réunion et les participants.
            </p>
          </div>
          <Link
            href="/meetings"
            className="inline-flex min-h-11 items-center text-sm font-medium text-gray-500 dark:text-slate-300 hover:text-blue-300 sm:min-h-0 sm:text-xs"
          >
            <span aria-hidden>📋</span> Retour à la liste
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xl shadow-gray-200 dark:shadow-slate-950/60 sm:p-6"
        >
          {error && (
            <p className="mb-4 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>📌</span> Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="Comité projet – lancement Q2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                  <span aria-hidden>📅</span> Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                  <span aria-hidden>⏰</span> Heure *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>📍</span> Lieu
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="Salle Atlas, visioconférence Teams..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>📋</span> Ordre du jour
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="- Point 1 : ...
- Point 2 : ..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>👥</span> Participants (emails, séparés par des virgules)
              </label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                placeholder="a@example.com, b@example.com"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-50 sm:rounded-full sm:py-2"
            >
              <span aria-hidden>✅</span> {loading ? 'Création\u2026' : 'Créer'}
            </button>
            <Link
              href="/meetings"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-slate-600 px-5 py-3 text-sm font-medium text-gray-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 sm:rounded-full sm:py-2"
            >
              <span aria-hidden>↩️</span> Annuler
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
