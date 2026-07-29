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
  const [isAdmin, setIsAdmin] = useState(false);

  const base = getApiBase();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      if (storedToken) {
        fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${storedToken}` } })
          .then((res) => (res.ok ? res.json() : null))
          .then((user) => setIsAdmin(user?.role === 'ADMIN'))
          .catch(() => undefined);
      }
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
    <div className="sr-grid min-h-screen bg-slate-950 px-4 pb-12 pt-5 text-slate-50 sm:px-6 sm:pt-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-auto">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-3xl">
              <span aria-hidden className="text-sky-400">📋</span>
              Mes réunions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
              Visualisez, filtrez et créez vos réunions en temps réel.
            </p>
          </div>
          {isAdmin && <div>
            <Link
              href="/meetings/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-200 md:w-auto md:py-2.5"
            >
              <span aria-hidden className="text-[13px]">➕</span>
              Nouvelle réunion
            </Link>
          </div>}
        </header>

        {token && isAdmin && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-1.5 backdrop-blur-xl">
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
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.07] sm:p-5"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />
                <Link
                  href={`/meetings/${m.id}`}
                  className="relative flex min-h-11 items-center gap-2 text-base font-semibold text-white transition hover:text-cyan-200"
                >
                  <span aria-hidden className="text-base">🗓️</span>
                  {m.title}
                </Link>
                <p className="relative mt-2 text-sm text-slate-400">
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
          className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-cyan-200"
        >
          <span aria-hidden>←</span>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
