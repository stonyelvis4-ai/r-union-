import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 pb-16 pt-10 text-gray-900 dark:text-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-400">
              SmartReunion
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Pilotez vos réunions avec une{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 bg-clip-text text-transparent">
                interface moderne
              </span>{' '}
              et des rapports intelligents.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-gray-500 dark:text-slate-300 md:text-base">
              Créez des réunions, scannez les présences via QR code, enregistrez, transcrivez et
              générez des rapports 3D-ready en quelques clics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                <span
                  aria-hidden
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/20 text-xs"
                >
                  ▶
                </span>
                Connexion
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/80 bg-white dark:bg-slate-900/70 px-4 py-2 text-sm text-blue-100 shadow-sm shadow-blue-900/40 transition hover:-translate-y-0.5 hover:bg-blue-500/10"
              >
                <span
                  aria-hidden
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-800 text-[10px]"
                >
                  ✨
                </span>
                Inscription
              </Link>
            </div>
          </div>

          <div className="relative mt-4 w-full max-w-sm self-start md:mt-0 md:self-center">
            <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.5),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(37,99,235,0.45),transparent_55%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 p-5 shadow-2xl shadow-gray-300 dark:shadow-slate-950/70 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 dark:text-slate-400">
                    Prochaine réunion
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-50">
                    Comite projet – SmartReunion
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">Aujourd'hui · 14:30 · Salle Atlas</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-300 p-[2px] shadow-lg shadow-blue-500/50">
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-950 text-lg">
                    📅
                  </div>
                </div>
              </div>
              <div className="mt-4 h-px bg-gradient-to-r from-slate-700/60 via-slate-500/40 to-slate-700/60" />
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  <span>QR code actif</span>
                </div>
                <span className="rounded-full bg-gray-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] text-gray-700 dark:text-slate-200">
                  Synchronisation temps réel
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>
    </main>
  );
}
