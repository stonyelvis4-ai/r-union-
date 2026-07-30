'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
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
type TrainingRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityCountry?: string | null;
  organization?: string | null;
  jobTitle?: string | null;
  timezone?: string | null;
  signedAt: string;
};
type PresentationItem = {
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
};
type TrainingDetail = {
  presentationItems: PresentationItem[];
};

const emptyItem = (): Item => ({ title: '', durationMinutes: '' });

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [mode, setMode] = useState<Mode>('PRESENTIAL');
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [origin, setOrigin] = useState('');
  const [creationOpen, setCreationOpen] = useState(false);

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

  const downloadAttendanceList = async (training: Training) => {
    if (!token) return;
    const response = await fetch(`${api}/trainings/${training.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      setMessage('Impossible de télécharger la liste de présence.');
      return;
    }

    const detail = (await response.json()) as { registrations: TrainingRegistration[] };
    const columns =
      training.mode === 'ONLINE'
        ? [
            'Prénom',
            'Nom',
            'E-mail',
            'Téléphone',
            'Ville / pays',
            'Organisation',
            'Fonction',
            'Fuseau horaire',
            'Inscrit le',
          ]
        : ['Prénom', 'Nom', 'E-mail', 'Téléphone', 'Organisation', 'Fonction', 'Inscrit le'];
    const escapeCsv = (value: string | null | undefined) =>
      `"${(value || '').replaceAll('"', '""')}"`;
    const rows = detail.registrations.map((registration) => {
      const common = [
        registration.firstName,
        registration.lastName,
        registration.email,
        registration.phone,
      ];
      const extra =
        training.mode === 'ONLINE'
          ? [
              registration.cityCountry,
              registration.organization,
              registration.jobTitle,
              registration.timezone,
            ]
          : [registration.organization, registration.jobTitle];
      return [...common, ...extra, new Date(registration.signedAt).toLocaleString('fr-FR')]
        .map(escapeCsv)
        .join(';');
    });
    const blob = new Blob([`\uFEFF${columns.join(';')}\n${rows.join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presence-${training.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'formation'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadQrCode = (training: Training) => {
    const canvas = document.querySelector<HTMLCanvasElement>(`#training-qr-${training.id} canvas`);
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${training.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'formation'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getPresentation = async (training: Training) => {
    if (!token) return null;
    const response = await fetch(`${api}/trainings/${training.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      setMessage('Impossible de récupérer la liste de présentation.');
      return null;
    }
    return (await response.json()) as TrainingDetail;
  };

  const presentationFilename = (training: Training, extension: string) =>
    `presentation-${training.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'formation'}.${extension}`;

  const downloadPresentationPdf = async (training: Training) => {
    const detail = await getPresentation(training);
    if (!detail) return;
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageHeight = 287;
    let cursorY = 20;
    const addText = (text: string, size = 11, bold = false) => {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(text, 170) as string[];
      if (cursorY + lines.length * (size * 0.5) > pageHeight) {
        pdf.addPage();
        cursorY = 20;
      }
      pdf.text(lines, 20, cursorY);
      cursorY += lines.length * (size * 0.5) + 4;
    };

    addText(training.title, 20, true);
    addText(
      `Liste de présentation - ${training.mode === 'PRESENTIAL' ? 'Présentiel' : 'En ligne'}`,
      12
    );
    addText(
      `${new Date(training.date).toLocaleDateString('fr-FR')} à ${training.time}${training.trainer ? ` - Formateur : ${training.trainer}` : ''}${training.location ? ` - Lieu : ${training.location}` : ''}`
    );
    cursorY += 4;
    if (detail.presentationItems.length === 0) {
      addText('Aucune étape de présentation renseignée.');
    } else {
      detail.presentationItems.forEach((item, index) => {
        const duration = item.durationMinutes ? ` (${item.durationMinutes} min)` : '';
        addText(`${index + 1}. ${item.title}${duration}`, 12, true);
        if (item.description) addText(item.description);
      });
    }
    pdf.save(presentationFilename(training, 'pdf'));
  };

  const downloadPresentationWord = async (training: Training) => {
    const detail = await getPresentation(training);
    if (!detail) return;
    const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
    const metadata = `${new Date(training.date).toLocaleDateString('fr-FR')} à ${training.time}${training.trainer ? ` - Formateur : ${training.trainer}` : ''}${training.location ? ` - Lieu : ${training.location}` : ''}`;
    const wordDocument = new Document({
      numbering: {
        config: [
          {
            reference: 'presentation-list',
            levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'start' }],
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: training.title, heading: HeadingLevel.TITLE }),
            new Paragraph({
              text: `Liste de présentation - ${training.mode === 'PRESENTIAL' ? 'Présentiel' : 'En ligne'}`,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: metadata }),
            ...(detail.presentationItems.length
              ? detail.presentationItems.flatMap((item) => [
                  new Paragraph({
                    numbering: { reference: 'presentation-list', level: 0 },
                    children: [
                      new TextRun({
                        text: `${item.title}${item.durationMinutes ? ` (${item.durationMinutes} min)` : ''}`,
                        bold: true,
                      }),
                    ],
                  }),
                  ...(item.description ? [new Paragraph({ text: item.description })] : []),
                ])
              : [new Paragraph({ text: 'Aucune étape de présentation renseignée.' })]),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(wordDocument);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = presentationFilename(training, 'docx');
    link.click();
    URL.revokeObjectURL(url);
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
      setCreationOpen(false);
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
                  <button
                    type="button"
                    onClick={() => void downloadAttendanceList(training)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
                  >
                    Télécharger la liste
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadQrCode(training)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
                  >
                    Télécharger le QR
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadPresentationPdf(training)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
                  >
                    Présentation PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadPresentationWord(training)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
                  >
                    Présentation Word
                  </button>
                </div>
              </div>
              {origin && (
                <div
                  id={`training-qr-${training.id}`}
                  className="self-start rounded-xl bg-white p-2"
                >
                  <QRCodeCanvas value={qrUrl} size={180} />
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Ce QR code ouvre le formulaire d’inscription sécurisé.
            </p>
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
          <button
            type="button"
            onClick={() => setCreationOpen((open) => !open)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            {creationOpen ? 'Fermer' : 'Nouvelle formation'}
          </button>
        </header>
        <section className="mb-7 grid gap-5 rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/15 sm:grid-cols-3 sm:gap-0 sm:p-6">
          <article className="border-l border-white/10 px-4 first:border-l-0 first:pl-0 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Formations
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{trainings.length}</p>
            <p className="mt-1 text-xs text-slate-400">programmes créés</p>
          </article>
          <article className="border-l border-white/10 px-4 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Publiées
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {trainings.filter((training) => training.status === 'PUBLISHED').length}
            </p>
            <p className="mt-1 text-xs text-slate-400">QR disponibles</p>
          </article>
          <article className="border-l border-white/10 px-4 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Inscriptions
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {trainings.reduce((total, training) => total + training._count.registrations, 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400">participants inscrits</p>
          </article>
        </section>
        <section
          className={
            creationOpen
              ? 'rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 sm:p-6'
              : 'hidden'
          }
        >
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
