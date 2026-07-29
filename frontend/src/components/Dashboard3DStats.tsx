'use client';

import React from 'react';

const CARDS = [
  { label: 'Réunions ce mois-ci', value: 12, accent: 'from-blue-500 to-blue-400' },
  { label: 'Présences scannées', value: 87, accent: 'from-blue-600 to-blue-500' },
  { label: 'Rapports générés', value: 34, accent: 'from-blue-700 to-blue-500' },
];

const BARS = [
  { label: 'Lun', height: 35 },
  { label: 'Mar', height: 55 },
  { label: 'Mer', height: 80 },
  { label: 'Jeu', height: 60 },
  { label: 'Ven', height: 45 },
];

export default function Dashboard3DStats() {
  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-4">
        {CARDS.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 p-4 shadow-xl shadow-gray-200 dark:shadow-slate-900/40"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-40`}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-slate-300">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900/60 shadow-inner shadow-gray-300 dark:shadow-black/60">
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.28),transparent_55%),radial-gradient(circle_at_80%_120%,rgba(15,23,42,0.9),#020617)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-2xl shadow-gray-200 dark:shadow-slate-900/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.24),transparent_50%),radial-gradient(circle_at_90%_120%,rgba(129,140,248,0.3),transparent_55%)]" />
        <div className="relative mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-slate-400">
              Vue 3D
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">Présence hebdomadaire</h2>
          </div>
          <span className="rounded-full bg-gray-100 dark:bg-slate-800/80 px-3 py-1 text-xs text-gray-500 dark:text-slate-300">
            Démo en temps réel
          </span>
        </div>

        <div className="relative mt-6 h-52 w-full">
          <div className="pointer-events-none absolute inset-x-0 bottom-6 h-24 bg-gradient-to-b from-blue-300/25 to-transparent blur-2xl" />

          <div
            className="relative flex h-full items-end justify-between rounded-[32px] border border-gray-200 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 px-6 pb-6 pt-5 backdrop-blur"
            style={{
              transform: 'rotateX(40deg) rotateZ(-15deg)',
              transformOrigin: 'bottom center',
            }}
          >
            {BARS.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-2">
                <div
                  className="relative w-10 rounded-t-xl bg-gradient-to-t from-blue-600 via-blue-400 to-white/80 shadow-[0_18px_45px_rgba(37,99,235,0.65)] sr-bar-pulse"
                  style={{ height: `${bar.height}%` }}
                >
                  <div className="absolute inset-x-0 -top-3 h-4 rounded-full bg-gradient-to-b from-white/85 to-blue-200 shadow-[0_8px_14px_rgba(148,163,184,0.85)]" />
                  <div className="absolute inset-y-0 right-0 w-2 rounded-tr-xl bg-blue-900/30" />
                  <div className="absolute inset-y-0 left-0 w-2 rounded-tl-xl bg-blue-100/30" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative mt-4 text-xs text-gray-500 dark:text-slate-300">
          Ces données sont simulées pour donner un aperçu visuel des tendances. Vous pourrez les
          relier plus tard aux vraies statistiques de vos réunions.
        </p>
      </div>
    </section>
  );
}
