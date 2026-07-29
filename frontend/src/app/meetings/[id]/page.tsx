'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { getApiBase } from '@/services/api';
import type { Meeting } from '@/services/api';
import RecordingControls from '@/components/RecordingControls';
import ReportView from '@/components/ReportView';
import type { SummaryData } from '@/components/ReportView';

interface AttendanceRecord {
  id: string;
  scannedAt: string;
  userId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  user?: { id: string; email: string; name?: string };
}

interface TranscriptionState {
  status: string;
  fullText: string | null;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transcription, setTranscription] = useState<TranscriptionState | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [publicMeetingUrl, setPublicMeetingUrl] = useState('');
  const [isGuestView, setIsGuestView] = useState(false);
  const [presenceSubmitted, setPresenceSubmitted] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [presenceLoading, setPresenceLoading] = useState(false);
  const [presenceError, setPresenceError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const base = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const scannedQrToken = searchParams.get('qr');

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin;
      const qrQuery = meeting?.qrToken ? `?qr=${encodeURIComponent(meeting.qrToken)}` : '';
      setPublicMeetingUrl(`${origin.replace(/\/$/, '')}/meetings/${id}${qrQuery}`);
    }
  }, [id, meeting?.qrToken]);

  useEffect(() => {
    if (!token) return;
    fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setIsAdmin(user?.role === 'ADMIN'))
      .catch(() => undefined);
  }, [base, token]);

  useEffect(() => {
    if (!id || !base) return;
    if (token) {
      const load = async () => {
        try {
          if (scannedQrToken) {
            const joinRes = await fetch(`${base}/meetings/${id}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ qrToken: scannedQrToken }),
            });
            const joinData = await joinRes.json().catch(() => ({}));
            if (!joinRes.ok) {
              throw new Error((joinData as { message?: string }).message || 'Code QR invalide');
            }
            setJoinMessage(
              (joinData as { alreadyRecorded?: boolean }).alreadyRecorded
                ? 'Vous participez déjà à cette réunion.'
                : 'Participation confirmée : votre présence a été enregistrée.'
            );
          }
          const [meetingRes, attendanceRes, transcriptionRes, summaryRes] = await Promise.all([
            fetch(`${base}/meetings/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${base}/meetings/${id}/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${base}/meetings/${id}/transcription`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${base}/meetings/${id}/summary`, { headers: { Authorization: `Bearer ${token}` } }).catch(
              () => null
            ),
          ]);
          if (!meetingRes.ok) throw new Error('Réunion introuvable');
          const meetingData = await meetingRes.json();
          setMeeting(meetingData);
          if (attendanceRes.ok) {
            const list = await attendanceRes.json();
            setAttendance(Array.isArray(list) ? list : []);
          }
          if (transcriptionRes.ok) {
            const t = await transcriptionRes.json();
            setTranscription({ status: t.status || 'pending', fullText: t.fullText ?? null });
          }
          if (summaryRes?.ok) {
            const s = await summaryRes.json();
            setSummary(s);
          }
        } catch {
          setError('Réunion introuvable');
        } finally {
          setLoading(false);
        }
      };
      load();
      return;
    }
    // Sans token : chargement public pour afficher le formulaire d'inscription à la présence (après scan QR)
    if (!scannedQrToken) {
      setError('Scannez le QR code de la réunion pour accéder à cette page.');
      setLoading(false);
      return;
    }
    fetch(`${base}/meetings/${id}/public?qrToken=${encodeURIComponent(scannedQrToken)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Réunion introuvable');
        return r.json();
      })
      .then((data) => {
        setMeeting(data as Meeting);
        setIsGuestView(true);
      })
      .catch(() => setError('Réunion introuvable'))
      .finally(() => setLoading(false));
  }, [id, base, token, scannedQrToken]);

  // Polling de la transcription tant qu'elle est « En cours »
  useEffect(() => {
    if (!token || transcription?.status !== 'pending') return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${base}/meetings/${id}/transcription`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const t = await r.json();
        setTranscription({ status: t.status || 'pending', fullText: t.fullText ?? null });
        if (t.status === 'complete' || t.status === 'failed') clearInterval(interval);
      } catch {
        // ignore
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [id, base, token, transcription?.status]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-700 dark:text-slate-200">
        <div className="w-full max-w-md space-y-3">
          <div className="h-4 w-32 rounded-full sr-skeleton" />
          <div className="h-7 w-3/4 rounded-full sr-skeleton" />
          <div className="h-24 w-full rounded-2xl sr-skeleton" />
        </div>
      </div>
    );
  }
  if (error || !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-900 dark:text-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-white dark:bg-slate-900/80 p-6 text-center shadow-lg shadow-rose-200/40 dark:shadow-rose-900/40">
          <p className="text-sm text-rose-200">{error || 'Réunion introuvable'}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-medium text-sky-300 hover:text-sky-200"
          >
            <span aria-hidden>←</span>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  // Vue « invité » : après scan du QR, formulaire pour s'inscrire sur la liste de présence
  if (isGuestView && meeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-10 text-gray-900 dark:text-slate-50">
        <div className="mx-auto max-w-md space-y-6">
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">Réunion</p>
            <h1 className="mt-2 text-xl font-semibold">{meeting.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-300">
              <span className="rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1">
                📅 {new Date(meeting.date).toLocaleDateString('fr-FR')}
              </span>
              <span className="rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1">⏰ {meeting.time}</span>
            </div>
          </section>
          <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Liste de présence</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">
              Inscrivez-vous pour marquer votre présence à cette réunion.
            </p>
            {presenceSubmitted ? (
              <div className="mt-4 rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-center">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">✓ Présence enregistrée</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">Merci, vous êtes inscrit sur la liste.</p>
              </div>
            ) : (
              <form
                className="mt-4 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPresenceError('');
                  setPresenceLoading(true);
                  try {
                    const res = await fetch(`${base}/attendance/scan`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        qrToken: scannedQrToken,
                        attendeeName: attendeeName.trim() || undefined,
                        attendeeEmail: attendeeEmail.trim() || undefined,
                      }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setPresenceError((data as { message?: string }).message || 'Erreur');
                      return;
                    }
                    setPresenceSubmitted(true);
                  } catch {
                    setPresenceError('Erreur réseau.');
                  } finally {
                    setPresenceLoading(false);
                  }
                }}
              >
                <div>
                  <label htmlFor="guest-name" className="block text-xs font-medium text-gray-500 dark:text-slate-300">
                    Nom (optionnel)
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Votre nom"
                    className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="guest-email" className="block text-xs font-medium text-gray-500 dark:text-slate-300">
                    Email (recommandé)
                  </label>
                  <input
                    id="guest-email"
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    className="mt-1 w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-500"
                  />
                </div>
                {presenceError && (
                  <p className="text-xs text-rose-300">{presenceError}</p>
                )}
                <button
                  type="submit"
                  disabled={presenceLoading}
                  className="w-full rounded-full bg-sky-500 py-2.5 text-sm font-semibold text-slate-950 shadow-md hover:bg-sky-400 disabled:opacity-50"
                >
                  {presenceLoading ? 'Envoi…' : 'Inscrire ma présence'}
                </button>
              </form>
            )}
          </section>
          <p className="text-center text-xs text-gray-400 dark:text-slate-500">
            <Link href="/login" className="text-sky-400 hover:text-sky-300">
              Connexion
            </Link>
            {' · '}
            <Link href="/" className="text-sky-400 hover:text-sky-300">
              Accueil
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 pb-10 pt-6 text-gray-900 dark:text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-300 hover:text-sky-300"
          >
            <span aria-hidden>📋</span>
            Retour aux réunions
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/meetings/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/70 bg-white dark:bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-100 shadow-sm shadow-sky-200/40 dark:shadow-sky-900/40 hover:bg-sky-500/10"
            >
              <span aria-hidden>✏️</span>
              Modifier
            </Link>
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Supprimer cette réunion ? Cette action est irréversible.')) return;
                if (!token) return;
                try {
                  const res = await fetch(`${base}/meetings/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    router.push('/meetings');
                    return;
                  }
                  const data = await res.json().catch(() => ({}));
                  alert(data.message || data.error || 'Erreur lors de la suppression');
                } catch {
                  alert('Erreur lors de la suppression');
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-rose-500/80 bg-white dark:bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-100 shadow-sm shadow-rose-200/50 dark:shadow-rose-900/50 hover:bg-rose-500/10"
            >
              <span aria-hidden>🗑</span>
              Supprimer
            </button>
          </div>
        </header>

        <section className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-lg shadow-gray-200 dark:shadow-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">Réunion</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">{meeting.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1">
              📅 {new Date(meeting.date).toLocaleDateString('fr-FR')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1">
              ⏰ {meeting.time}
            </span>
            {meeting.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1">
                📍 {meeting.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1 uppercase tracking-wide text-[11px] text-sky-300">
              ● {meeting.status}
            </span>
          </div>
          {meeting.agenda && (
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-3 text-sm text-gray-700 dark:text-slate-200">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-400"><span aria-hidden>📌</span> Ordre du jour</p>
              <p className="whitespace-pre-wrap">{meeting.agenda}</p>
            </div>
          )}
        </section>

        {joinMessage && (
          <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            ✓ {joinMessage}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
          <div className="space-y-4">
            <div className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100"><span aria-hidden>👥</span> Participants</h2>
                <span className="text-[11px] text-gray-400 dark:text-slate-400">
                  {meeting.participants?.length || 0} inscrit(s)
                </span>
              </div>
              {meeting.participants?.length ? (
                <ul className="space-y-1 text-xs text-gray-700 dark:text-slate-200">
                  {meeting.participants.map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-800 text-[11px]">
                        👤
                      </span>
                      <span>
                        {p.displayName || p.email}{' '}
                        <span className="text-gray-400 dark:text-slate-400">({p.email})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 dark:text-slate-400">Aucun participant pour le moment.</p>
              )}
            </div>

            <div className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100"><span aria-hidden>✅</span> Présences</h2>
                <span className="rounded-full bg-gray-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] text-sky-300">
                  {attendance.length} scan(s)
                </span>
              </div>
              {attendance.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-slate-400">Aucune présence enregistrée.</p>
              ) : (
                <ul className="mt-1 space-y-1 text-xs text-gray-700 dark:text-slate-200">
                  {attendance.map((a) => (
                    <li key={a.id}>
                      {a.user
                        ? `${a.user.name || a.user.email}`
                        : a.attendeeName || a.attendeeEmail || 'Anonyme'}{' '}
                      — {new Date(a.scannedAt).toLocaleString('fr-FR')}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          <div className="space-y-4">
            <div className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100"><span aria-hidden>🎙️</span> Enregistrement</h2>
                <span className="text-[11px] text-gray-400 dark:text-slate-400">Audio + transcription</span>
              </div>
              <RecordingControls
                meetingId={id}
                token={token}
                onRecordingStopped={() => {
                  fetch(`${base}/meetings/${id}/transcription`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                    .then((r) => r.ok && r.json())
                    .then(
                      (t) =>
                        t && setTranscription({ status: t.status || 'pending', fullText: t.fullText ?? null })
                    );
                }}
              />
            </div>

            <div className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100"><span aria-hidden>📝</span> Transcription</h2>
                <span className="text-[11px] text-gray-400 dark:text-slate-400">
                  {transcription?.status === 'complete'
                    ? transcription.fullText
                      ? 'Terminée'
                      : 'Non disponible'
                    : transcription?.status === 'failed'
                    ? 'Erreur'
                    : transcription?.status === 'pending'
                    ? 'En cours'
                    : 'Non démarrée'}
                </span>
              </div>
              {transcription?.status === 'complete' && transcription.fullText ? (
                <div className="mt-1 max-h-52 overflow-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/60 p-3 text-xs text-gray-800 dark:text-slate-100">
                  {transcription.fullText}
                </div>
              ) : transcription?.status === 'complete' && !transcription.fullText ? (
                <p className="text-xs text-gray-500 dark:text-slate-300">
                  La transcription automatique n'est pas disponible dans cette version de la
                  démo. L'audio a bien été enregistré, mais aucun texte n'a été généré.
                </p>
              ) : transcription?.status === 'failed' ? (
                <p className="text-xs text-amber-300">
                  Échec de la transcription automatique. Vérifiez la configuration du service de
                  transcription.
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-slate-300">
                  {transcription?.status === 'pending'
                    ? 'Transcription en cours…'
                    : "Aucune transcription. Démarrez puis arrêtez l'enregistrement pour lancer l'analyse."}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {summary ? (
            <ReportView meetingId={id} summary={summary} token={token} />
          ) : transcription?.status === 'complete' ? (
            <div className="sr-tile inline-flex items-center gap-3 rounded-2xl border border-indigo-500/60 bg-white dark:bg-slate-900/80 px-4 py-3 text-sm shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/50">
              <span aria-hidden>📝</span>
              <span className="flex-1 text-gray-800 dark:text-slate-100">
                La transcription est prête. Génère le rapport de réunion intelligent.
              </span>
              <button
                type="button"
                disabled={generatingSummary}
                onClick={async () => {
                  if (!token) return;
                  setGeneratingSummary(true);
                  try {
                    const res = await fetch(`${base}/meetings/${id}/summary/generate`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      const s = await res.json();
                      setSummary(s);
                    }
                  } finally {
                    setGeneratingSummary(false);
                  }
                }}
                className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-gray-900 dark:text-slate-50 shadow-sm shadow-indigo-900/60 hover:bg-indigo-400 disabled:opacity-60"
              >
                {generatingSummary ? 'Génération…' : 'Générer le rapport'}
              </button>
            </div>
          ) : null}

          {summary && token && (
            <div className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-lg shadow-gray-200 dark:shadow-slate-950/60">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-slate-100">
                <span aria-hidden>📨</span> Envoyer le compte-rendu
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-300">
                Envoyer le rapport (avec PDF en pièce jointe) par email aux participants et aux personnes ayant scanné le QR code.
              </p>

              {(() => {
                const emails = new Set<string>();
                meeting.participants?.forEach((p) => { if (p.email) emails.add(p.email); });
                attendance.forEach((a) => {
                  if (a.user?.email) emails.add(a.user.email);
                  if (a.attendeeEmail) emails.add(a.attendeeEmail);
                });
                const list = [...emails];
                return (
                  <>
                    {list.length > 0 ? (
                      <div className="mt-3 rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          {list.length} destinataire(s)
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {list.map((e) => (
                            <li key={e} className="inline-flex items-center gap-1 rounded-full bg-gray-200 dark:bg-slate-800 px-2.5 py-1 text-[11px] text-gray-700 dark:text-slate-200">
                              <span aria-hidden>📧</span> {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-amber-500">
                        Aucun destinataire trouvé. Ajoutez des participants ou attendez que des personnes scannent le QR code.
                      </p>
                    )}

                    {sendResult && (
                      <p className={`mt-3 text-xs font-medium ${sendResult.type === 'success' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                        {sendResult.text}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={sendingReport || list.length === 0}
                      onClick={async () => {
                        setSendingReport(true);
                        setSendResult(null);
                        try {
                          const res = await fetch(`${base}/meetings/${id}/report/send`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok || res.status === 204) {
                            setSendResult({ type: 'success', text: `Compte-rendu envoyé avec succès à ${list.length} destinataire(s).` });
                          } else {
                            const data = await res.json().catch(() => ({}));
                            setSendResult({ type: 'error', text: (data as { message?: string }).message || 'Erreur lors de l\'envoi.' });
                          }
                        } catch {
                          setSendResult({ type: 'error', text: 'Erreur réseau.' });
                        } finally {
                          setSendingReport(false);
                        }
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/40 hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <span aria-hidden>📤</span>
                      {sendingReport ? 'Envoi en cours…' : 'Envoyer par email'}
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {isAdmin && <div className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-lg shadow-gray-200 dark:shadow-slate-950/60">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100">
              <span aria-hidden>📱</span> QR Code de la réunion
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-300">
              Les participants peuvent scanner ce code pour accéder à la page de la réunion et marquer leur présence.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {publicMeetingUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-xl bg-white p-3 shadow-md shadow-gray-200 dark:shadow-slate-950/50">
                    <QRCodeCanvas
                      id="meeting-qr"
                      value={publicMeetingUrl}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const canvas = document.getElementById('meeting-qr') as HTMLCanvasElement | null;
                      if (!canvas) return;
                      const url = canvas.toDataURL('image/png');
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `reunion-${meeting.id.slice(0, 8)}-qr.png`;
                      a.click();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/40 hover:bg-blue-400"
                  >
                    <span aria-hidden>⬇️</span> Télécharger l'image
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-slate-400">Chargement du QR code…</p>
              )}
              {publicMeetingUrl && (
                <div className="text-xs text-gray-500 dark:text-slate-300">
                  <p>Lien de la réunion :</p>
                  <a
                    href={publicMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block break-all text-sky-500 hover:text-sky-400 hover:underline"
                  >
                    {publicMeetingUrl}
                  </a>
                </div>
              )}
            </div>
          </div>}
        </section>
      </div>
    </div>
  );
}
