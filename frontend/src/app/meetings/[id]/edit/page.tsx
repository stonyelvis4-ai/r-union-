'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/services/api';
import type { Meeting } from '@/services/api';

function formatDateInput(d: string) {
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

function formatTimeInput(t: string) {
  if (!t) return '09:00';
  if (t.length === 5 && t.includes(':')) return t;
  return '09:00';
}

export default function EditMeetingPage() {
  const base = getApiBase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    fetch(`${base}/meetings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('Réunion introuvable');
        return r.json();
      })
      .then((m) => {
        setMeeting(m);
        setTitle(m.title);
        setDate(formatDateInput(m.date));
        setTime(formatTimeInput(m.time));
        setLocation(m.location || '');
        setAgenda(m.agenda || '');
        setStatus(m.status || 'DRAFT');
      })
      .catch(() => setError('Réunion introuvable'))
      .finally(() => setLoading(false));
  }, [id, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !meeting) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${base}/meetings/${id}`, {
        method: 'PATCH',
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
          status,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Erreur');
      }
      router.push(`/meetings/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-700 dark:text-slate-200">
        <p className="text-sm">Chargement&hellip;</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-900 dark:text-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white dark:bg-slate-900/80 p-6 text-center shadow-lg">
          <p className="text-sm text-rose-300">{error || 'Réunion introuvable'}</p>
          <Link href="/meetings" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-sky-300 hover:text-sky-200">
            <span aria-hidden>📋</span> Liste des réunions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 pb-10 pt-6 text-gray-900 dark:text-slate-50">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <Link
            href={`/meetings/${id}`}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-300 hover:text-sky-300"
          >
            <span aria-hidden>🗓️</span>
            Retour à la réunion
          </Link>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span aria-hidden className="text-sky-400">✏️</span>
            Modifier la réunion
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
            Mettez à jour les informations de la réunion.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xl shadow-gray-200 dark:shadow-slate-950/60"
        >
          {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}

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
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200">
                <span aria-hidden>🏷️</span> Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="SCHEDULED">Planifiée</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
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
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400 dark:text-slate-400">
            Les participants se gèrent depuis la page de détail de la réunion.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-50"
            >
              <span aria-hidden>💾</span>
              {saving ? 'Enregistrement\u2026' : 'Enregistrer'}
            </button>
            <Link
              href={`/meetings/${id}`}
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
