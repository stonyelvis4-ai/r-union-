'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import { getApiBase } from '@/services/api';

type Status = 'DRAFT' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface DashboardMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string | null;
  status: Status;
  summary?: { isSharedWithParticipants: boolean } | null;
  _count: { participants: number; attendances: number };
}

interface DashboardData {
  stats: {
    totalMeetings: number;
    upcomingMeetings: number;
    completedMeetings: number;
    attendanceScans: number;
    sharedReports: number;
    reportsToShare: number;
  };
  upcoming: DashboardMeeting[];
  recent: DashboardMeeting[];
}

const statusLabel: Record<Status, string> = {
  DRAFT: 'Brouillon',
  SCHEDULED: 'Planifiée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusClass: Record<Status, string> = {
  DRAFT: 'bg-slate-700 text-slate-200',
  SCHEDULED: 'bg-sky-400/15 text-sky-200',
  COMPLETED: 'bg-emerald-400/15 text-emerald-200',
  CANCELLED: 'bg-rose-400/15 text-rose-200',
};

function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
) {
  return new Intl.DateTimeFormat('fr-FR', options).format(new Date(value));
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="border-l border-white/10 px-4 first:border-l-0 first:pl-0 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.replace('/login');
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiBase()}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) return router.replace('/login');
      if (response.status === 403) return router.replace('/meetings');
      if (!response.ok) throw new Error('Impossible de charger le tableau de bord.');
      setData(await response.json());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const pendingReports =
    data?.recent
      .filter((meeting) => meeting.status === 'COMPLETED' && !meeting.summary)
      .slice(0, 2) ?? [];
  const today = formatDate(new Date().toISOString(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <main className="sr-grid min-h-screen bg-slate-950 px-4 pb-12 pt-5 text-slate-50 sm:px-6 sm:pt-7">
      <div className="mx-auto max-w-6xl">
        <AdminNavigation />

        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm capitalize text-cyan-200">{today}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Bonjour, administrateur
            </h1>
            <p className="mt-2 text-sm text-slate-400">Voici l’essentiel de votre activité.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
            >
              Actualiser
            </button>
            <Link href="/meetings/new" className="sr-button-primary">
              Nouvelle réunion
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="h-40 rounded-2xl sr-skeleton" />
        ) : error ? (
          <section className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="mt-3 font-semibold underline underline-offset-4"
            >
              Réessayer
            </button>
          </section>
        ) : data ? (
          <>
            <section
              className="sr-panel grid gap-5 p-5 sm:grid-cols-3 sm:gap-0 sm:p-7"
              aria-label="Indicateurs clés"
            >
              <Stat
                label="Réunions"
                value={data.stats.totalMeetings}
                detail={`${data.stats.upcomingMeetings} à venir`}
              />
              <Stat
                label="Présences"
                value={data.stats.attendanceScans}
                detail="scans QR enregistrés"
              />
              <Stat
                label="Comptes rendus"
                value={data.stats.sharedReports}
                detail={`${data.stats.reportsToShare} à partager`}
              />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
              <section className="sr-panel p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                      Agenda
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Prochaines réunions</h2>
                  </div>
                  <Link
                    href="/meetings"
                    className="text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                  >
                    Voir tout
                  </Link>
                </div>
                {data.upcoming.length ? (
                  <ul className="mt-5 divide-y divide-white/10">
                    {data.upcoming.map((meeting) => (
                      <li key={meeting.id}>
                        <Link
                          href={`/meetings/${meeting.id}`}
                          className="flex items-center gap-4 py-4 first:pt-0 transition hover:opacity-80"
                        >
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-center">
                            <span className="text-xs font-medium text-slate-400">
                              {formatDate(meeting.date, { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-white">{meeting.title}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {meeting.time}
                              {meeting.location ? ` · ${meeting.location}` : ''}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass[meeting.status]}`}
                          >
                            {statusLabel[meeting.status]}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-xl bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
                    Aucune réunion programmée.{' '}
                    <Link href="/meetings/new" className="font-semibold text-cyan-200">
                      En créer une
                    </Link>
                  </div>
                )}
              </section>

              <aside className="sr-panel bg-slate-900/55 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                  À faire
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">Priorités</h2>
                <div className="mt-5 space-y-3">
                  {data.stats.reportsToShare > 0 && (
                    <Link
                      href="/meetings"
                      className="block rounded-xl border border-amber-300/15 bg-amber-300/[0.07] p-3 transition hover:bg-amber-300/[0.12]"
                    >
                      <p className="font-semibold text-amber-50">
                        Partager {data.stats.reportsToShare} compte rendu
                        {data.stats.reportsToShare > 1 ? 's' : ''}
                      </p>
                      <p className="mt-1 text-xs text-amber-100/70">
                        Les participants attendent votre validation.
                      </p>
                    </Link>
                  )}
                  {pendingReports.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="block rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.07]"
                    >
                      <p className="line-clamp-1 font-semibold text-white">Créer le compte rendu</p>
                      <p className="mt-1 text-xs text-slate-400">{meeting.title}</p>
                    </Link>
                  ))}
                  {!data.stats.reportsToShare && !pendingReports.length && (
                    <p className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.07] p-3 text-sm text-emerald-100">
                      Tout est à jour.
                    </p>
                  )}
                </div>
              </aside>
            </section>

            <section className="sr-panel mt-6 bg-slate-900/60 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Historique
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Dernières activités</h2>
                </div>
                <Link
                  href="/meetings"
                  className="text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                >
                  Toutes les réunions
                </Link>
              </div>
              {data.recent.length ? (
                <ul className="mt-4 divide-y divide-white/10">
                  {data.recent.slice(0, 4).map((meeting) => (
                    <li key={meeting.id}>
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="flex items-center justify-between gap-4 py-3 transition hover:opacity-80"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {meeting.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(meeting.date)} · {meeting.time}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {meeting._count.attendances} présence
                            {meeting._count.attendances > 1 ? 's' : ''}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass[meeting.status]}`}
                          >
                            {statusLabel[meeting.status]}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  L’historique apparaîtra ici après la création de réunions.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
