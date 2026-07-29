'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getApiBase } from '@/services/api';
import type { Meeting } from '@/services/api';
import SearchFilters, { type SearchFiltersState } from '@/components/SearchFilters';

const defaultFilters: SearchFiltersState = {
  q: '',
  dateFrom: '',
  dateTo: '',
  searchInTranscript: false,
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>(defaultFilters);
  const [useSearch, setUseSearch] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const base = getApiBase();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const loadList = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${base}/meetings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, [base, token]);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      setLoading(false);
      return;
    }
    if (!useSearch) loadList();
  }, [mounted, token, useSearch, loadList]);

  const runSearch = () => {
    if (!token) return;
    setSearchLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.searchInTranscript) params.set('searchInTranscript', 'true');
    fetch(`${base}/meetings/search?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => setMeetings([]))
      .finally(() => setSearchLoading(false));
    setUseSearch(true);
  };

  const clearSearch = () => {
    setFilters(defaultFilters);
    setUseSearch(false);
    loadList();
  };

  if (!mounted) {
    // éviter un décalage entre rendu serveur et client
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 pb-10 pt-6 text-gray-900 dark:text-slate-50">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 h-8 w-40 rounded-full sr-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 pb-10 pt-6 text-gray-900 dark:text-slate-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
              <span aria-hidden className="text-sky-400">📋</span>
              Mes réunions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
              Visualisez, filtrez et créez vos réunions en temps réel.
            </p>
          </div>
          <div>
            <Link
              href="/meetings/new"
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400"
            >
              <span aria-hidden className="text-[13px]">➕</span>
              Nouvelle réunion
            </Link>
          </div>
        </header>

        {token && (
        <div className="mb-4">
          <SearchFilters
            value={filters}
            onChange={setFilters}
            onSearch={runSearch}
            loading={searchLoading}
          />
          {useSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Afficher toutes mes réunions
            </button>
          )}
          </div>
        )}
        {loading ? (
          <p className="mt-8 text-sm text-gray-500 dark:text-slate-300">Chargement…</p>
        ) : meetings.length === 0 ? (
          <p className="mt-8 text-sm text-gray-500 dark:text-slate-300">
            {useSearch ? 'Aucun résultat.' : 'Aucune réunion. Créez une première réunion.'}
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {meetings.map((m) => (
              <li
                key={m.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-sm shadow-gray-200 dark:shadow-slate-950/50 transition hover:-translate-y-1 hover:border-sky-500/70 hover:shadow-sky-200/60 dark:hover:shadow-sky-900/60"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sky-500/20 via-cyan-400/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                <Link
                  href={`/meetings/${m.id}`}
                  className="relative flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-50 hover:text-sky-700 dark:hover:text-sky-100"
                >
                  <span aria-hidden className="text-base">🗓️</span>
                  {m.title}
                </Link>
                <p className="relative mt-1 text-xs text-gray-500 dark:text-slate-300">
                  {new Date(m.date).toLocaleDateString('fr-FR')} · {m.time} ·{' '}
                  <span className="rounded-full bg-gray-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-sky-300">
                    {m.status}
                  </span>
                  {(m as Meeting & { owner?: { name?: string; email: string } }).owner && (
                    <span className="ml-2 text-gray-400 dark:text-slate-500">
                      par {(m as Meeting & { owner?: { name?: string; email: string } }).owner!.name || (m as Meeting & { owner?: { name?: string; email: string } }).owner!.email}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-slate-400 hover:text-sky-300"
        >
          <span aria-hidden>←</span>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
