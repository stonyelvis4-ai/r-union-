'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { getApiBase } from '@/services/api';
import AdminNavigation from '@/components/AdminNavigation';

type Mode = 'PRESENTIAL' | 'ONLINE';
type Training = {
  id: string;
  title: string;
  mode: Mode;
  date: string;
  time: string;
  trainer?: string | null;
  location?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  qrToken: string;
  qrActive: boolean;
  _count: { registrations: number; presentationItems: number };
};
type Item = { title: string; durationMinutes: string };

const emptyItem = (): Item => ({ title: '', durationMinutes: '' });

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [mode, setMode] = useState<Mode>('PRESENTIAL');
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [origin, setOrigin] = useState('');

  const api = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const formModeLabel = mode === 'PRESENTIAL' ? 'Présentiel' : 'En ligne';

  const load = async () => {
    if (!token) return;
    const response = await fetch(`${api}/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) setTrainings(await response.json());
    setLoading(false);
  };

  useEffect(() => {
    setOrigin(window.location.origin);
    void load();
  }, []);

  const updateTraining = async (
    id: string,
    path: 'status' | 'qr',
    body: Record<string, unknown>
  ) => {
    if (!token) return;
    const response = await fetch(`${api}/trainings/${id}/${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (response.ok) void load();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage('');
    const body = {
      title: String(form.get('title') || ''),
      description: String(form.get('description') || '') || undefined,
      mode,
      date: String(form.get('date') || ''),
      time: String(form.get('time') || ''),
      trainer: String(form.get('trainer') || '') || undefined,
      location: mode === 'PRESENTIAL' ? String(form.get('location') || '') : undefined,
      onlineUrl: mode === 'ONLINE' ? String(form.get('onlineUrl') || '') : undefined,
      presentationItems: items
        .filter((item) => item.title.trim())
        .map((item) => ({
          title: item.title.trim(),
          durationMinutes: item.durationMinutes ? Number(item.durationMinutes) : undefined,
        })),
    };
    try {
      const response = await fetch(`${api}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Vérifiez les informations obligatoires.');
      event.currentTarget.reset();
      setItems([emptyItem()]);
      setMode('PRESENTIAL');
      setMessage('Formation créée. Publiez-la pour activer son QR code.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const cards = useMemo(
    () =>
      trainings.map((training) => {
        const qrUrl = `${origin}/trainings/${training.id}?qr=${training.qrToken}`;
        return (
          <article
            key={training.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/15 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{training.title}</h3>
                  <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[11px] font-semibold text-cyan-200">
                    {training.mode === 'PRESENTIAL' ? 'Présentiel' : 'En ligne'}
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-300">
                    {training.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {new Date(training.date).toLocaleDateString('fr-FR')} · {training.time}
                  {training.location ? ` · ${training.location}` : ''}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {training._count.registrations} inscription
                  {training._count.registrations > 1 ? 's' : ''} ·{' '}
                  {training._count.presentationItems} étape
                  {training._count.presentationItems > 1 ? 's' : ''} de présentation
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void updateTraining(training.id, 'status', {
                        status: training.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                      })
                    }
                    className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950"
                  >
                    {training.status === 'PUBLISHED'
                      ? 'Retirer la publication'
                      : 'Publier et activer le QR'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void updateTraining(training.id, 'qr', { qrActive: !training.qrActive })
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
                  >
                    QR {training.qrActive ? 'activé' : 'désactivé'}
                  </button>
                </div>
              </div>
              {origin && (
                <div className="self-start rounded-xl bg-white p-2">
                  <QRCodeSVG value={qrUrl} size={100} />
                </div>
              )}
            </div>
            <p className="mt-3 break-all text-[11px] text-slate-500">{qrUrl}</p>
          </article>
        );
      }),
    [origin, trainings]
  );

  return (
    <main className="sr-grid min-h-screen bg-slate-950 px-4 pb-12 pt-5 text-slate-50 sm:px-6 sm:pt-7">
      <div className="mx-auto max-w-6xl">
        <AdminNavigation />
        <header className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Espace administrateur
            </p>
            <h1 className="mt-2 text-3xl font-bold">Formations</h1>
            <p className="mt-2 text-sm text-slate-300">
              Créez les séances, la liste de présentation et le QR d'inscription privé.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-cyan-200 hover:text-cyan-100"
          >
            ← Tableau de bord
          </Link>
        </header>
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 sm:p-6">
          <h2 className="text-xl font-bold">Nouvelle formation</h2>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              Titre *
              <input
                required
                name="title"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                className="mt-1 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
              />
            </label>
            <fieldset>
              <legend>Format *</legend>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('PRESENTIAL')}
                  className={`rounded-xl px-3 py-3 text-sm font-bold ${mode === 'PRESENTIAL' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-200'}`}
                >
                  Présentiel
                </button>
                <button
                  type="button"
                  onClick={() => setMode('ONLINE')}
                  className={`rounded-xl px-3 py-3 text-sm font-bold ${mode === 'ONLINE' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-slate-200'}`}
                >
                  En ligne
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Formulaire {formModeLabel.toLowerCase()} après scan.
              </p>
            </fieldset>
            <label>
              Date *
              <input
                required
                type="date"
                name="date"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
              />
            </label>
            <label>
              Heure *
              <input
                required
                type="time"
                name="time"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
              />
            </label>
            <label>
              Formateur
              <input
                name="trainer"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
              />
            </label>
            {mode === 'PRESENTIAL' ? (
              <label>
                Lieu / salle *
                <input
                  required
                  name="location"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
                />
              </label>
            ) : (
              <label>
                Lien de connexion *
                <input
                  required
                  type="url"
                  name="onlineUrl"
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
                />
              </label>
            )}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Liste de présentation</h3>
                <button
                  type="button"
                  onClick={() => setItems([...items, emptyItem()])}
                  className="text-sm font-semibold text-cyan-200"
                >
                  + Ajouter une étape
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setItems(
                          items.map((current, i) =>
                            i === index ? { ...current, title: event.target.value } : current
                          )
                        )
                      }
                      placeholder={`Étape ${index + 1} (ex. Introduction)`}
                      className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
                    />
                    <input
                      value={item.durationMinutes}
                      onChange={(event) =>
                        setItems(
                          items.map((current, i) =>
                            i === index
                              ? { ...current, durationMinutes: event.target.value }
                              : current
                          )
                        )
                      }
                      type="number"
                      min="1"
                      placeholder="Minutes"
                      className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== index))}
                        className="rounded-xl px-3 text-sm text-rose-200"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {message && <p className="md:col-span-2 text-sm text-cyan-100">{message}</p>}
            <button
              disabled={saving}
              className="md:col-span-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:opacity-60"
            >
              {saving ? 'Création…' : 'Créer la formation'}
            </button>
          </form>
        </section>
        <section className="mt-7">
          <h2 className="text-xl font-bold">Vos formations</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-400">Chargement…</p>
          ) : trainings.length ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">{cards}</div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
              Aucune formation. Créez votre première session ci-dessus.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
