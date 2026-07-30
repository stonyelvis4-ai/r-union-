'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    participantsInvited: number;
    attendanceScans: number;
    sharedReports: number;
    activeUsers: number;
    reportsToShare: number;
  };
  upcoming: DashboardMeeting[];
  recent: DashboardMeeting[];
}

const statusLabels: Record<Status, string> = {
  DRAFT: 'Brouillon',
  SCHEDULED: 'Planifiée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};
const statusStyles: Record<Status, string> = {
  DRAFT: 'bg-slate-700/70 text-slate-200',
  SCHEDULED: 'bg-sky-400/15 text-sky-200',
  COMPLETED: 'bg-emerald-400/15 text-emerald-200',
  CANCELLED: 'bg-rose-400/15 text-rose-200',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  detail: string;
  tone: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/15 backdrop-blur sm:p-5">
      <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl ${tone}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg"
          aria-hidden
        >
          {icon}
        </span>
      </div>
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
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);
  const reportActions =
    data?.recent.filter((meeting) => meeting.status === 'COMPLETED' && !meeting.summary) ?? [];

  return (
    <main className="sr-grid min-h-screen bg-slate-950 px-4 pb-12 pt-5 text-slate-50 sm:px-6 sm:pt-7">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Espace administrateur
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tableau de bord
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Suivez l'activité de vos réunions et retrouvez rapidement les actions à effectuer.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/trainings"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Formations
            </Link>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Actualiser
            </button>
            <Link
              href="/meetings/new"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              + Nouvelle réunion
            </Link>
          </div>
        </header>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-36 rounded-2xl sr-skeleton" />
            ))}
          </div>
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
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Indicateurs clés"
            >
              <MetricCard
                icon="📅"
                label="Réunions"
                value={data.stats.totalMeetings}
                detail={`${data.stats.upcomingMeetings} à venir`}
                tone="bg-cyan-400/30"
              />
              <MetricCard
                icon="👥"
                label="Participants"
                value={data.stats.participantsInvited}
                detail={`${data.stats.activeUsers} comptes actifs`}
                tone="bg-violet-400/30"
              />
              <MetricCard
                icon="✓"
                label="Présences"
                value={data.stats.attendanceScans}
                detail="scans QR enregistrés"
                tone="bg-emerald-400/30"
              />
              <MetricCard
                icon="📝"
                label="Comptes rendus"
                value={data.stats.sharedReports}
                detail={`${data.stats.reportsToShare} à partager`}
                tone="bg-amber-300/30"
              />
            </section>
            <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/15 backdrop-blur sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Prochaines réunions</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Les rendez-vous à suivre en priorité.
                    </p>
                  </div>
                  <Link
                    href="/meetings"
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Tout voir →
                  </Link>
                </div>
                {data.upcoming.length ? (
                  <ul className="mt-4 divide-y divide-white/10">
                    {data.upcoming.map((meeting) => (
                      <li key={meeting.id} className="py-3 first:pt-0 last:pb-0">
                        <Link
                          href={`/meetings/${meeting.id}`}
                          className="group flex items-center justify-between gap-4 rounded-xl p-2 transition hover:bg-white/5"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white group-hover:text-cyan-200">
                              {meeting.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(meeting.date)} · {meeting.time}
                              {meeting.location ? ` · ${meeting.location}` : ''}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[meeting.status]}`}
                            >
                              {statusLabels[meeting.status]}
                            </span>
                            <p className="mt-2 text-xs text-slate-400">
                              {meeting._count.participants} invité
                              {meeting._count.participants > 1 ? 's' : ''}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-7 text-center text-sm text-slate-400">
                    Aucune réunion à venir.{' '}
                    <Link
                      href="/meetings/new"
                      className="font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Planifier la première
                    </Link>
                  </div>
                )}
              </div>
              <aside className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-5 shadow-xl shadow-black/15">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                  À traiter
                </p>
                <h2 className="mt-2 text-lg font-bold text-white">Vos prochaines actions</h2>
                <div className="mt-5 space-y-3">
                  {data.stats.reportsToShare > 0 && (
                    <Link
                      href="/meetings"
                      className="block rounded-xl border border-white/10 bg-slate-950/40 p-3 transition hover:bg-white/10"
                    >
                      <p className="font-semibold text-white">
                        Partager {data.stats.reportsToShare} compte
                        {data.stats.reportsToShare > 1 ? 's' : ''} rendu
                        {data.stats.reportsToShare > 1 ? 's' : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Les participants n'y ont accès qu'après votre partage.
                      </p>
                    </Link>
                  )}
                  {reportActions.slice(0, 2).map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="block rounded-xl border border-white/10 bg-slate-950/40 p-3 transition hover:bg-white/10"
                    >
                      <p className="font-semibold text-white">Finaliser « {meeting.title} »</p>
                      <p className="mt-1 text-xs text-slate-300">
                        Réunion terminée, compte rendu non généré.
                      </p>
                    </Link>
                  ))}
                  {!data.stats.reportsToShare && !reportActions.length && (
                    <p className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                      Tout est à jour. Vous n'avez aucune action urgente.
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/users"
                  className="mt-5 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                >
                  Gérer les utilisateurs →
                </Link>
              </aside>
            </section>
            <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/15 backdrop-blur sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Activité récente</h2>
                  <p className="mt-1 text-xs text-slate-400">Les dernières réunions modifiées.</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {data.stats.completedMeetings} terminée
                  {data.stats.completedMeetings > 1 ? 's' : ''}
                </span>
              </div>
              {data.recent.length ? (
                <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {data.recent.map((meeting) => (
                    <li key={meeting.id}>
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.07]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 font-semibold text-white">{meeting.title}</p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusStyles[meeting.status]}`}
                          >
                            {statusLabels[meeting.status]}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                          {formatDate(meeting.date)} · {meeting.time}
                        </p>
                        <p className="mt-2 text-xs text-slate-300">
                          {meeting._count.attendances} présence
                          {meeting._count.attendances > 1 ? 's' : ''} ·{' '}
                          {meeting._count.participants} invité
                          {meeting._count.participants > 1 ? 's' : ''}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-slate-400">
                  L'activité apparaîtra ici après la création de vos réunions.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
