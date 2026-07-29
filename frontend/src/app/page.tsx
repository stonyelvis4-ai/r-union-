import Link from 'next/link';

const highlights = [
  ['01', 'Préparez', 'Une réunion claire, cadrée et prête à démarrer.'],
  ['02', 'Capturez', 'Présences, enregistrements et décisions au même endroit.'],
  ['03', 'Décidez', 'Des rapports utiles, générés à partir de vos échanges.'],
];

export default function Home() {
  return (
    <main className="sr-grid min-h-screen overflow-hidden bg-slate-950 px-4 pb-12 pt-4 text-slate-50 sm:px-8 sm:pt-5 lg:px-12">
      <div className="sr-orb sr-orb-one" />
      <div className="sr-orb sr-orb-two" />

      <div className="relative mx-auto max-w-7xl">
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 backdrop-blur-xl sm:px-5">
          <Link href="/" className="flex items-center gap-3" aria-label="SmartReunion, accueil">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-600 shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-slate-950">
                <path d="M6.2 3.5h11.6A2.7 2.7 0 0 1 20.5 6v7.4a2.7 2.7 0 0 1-2.7 2.7h-5l-3.8 3.1v-3.1H6.2a2.7 2.7 0 0 1-2.7-2.7V6a2.7 2.7 0 0 1 2.7-2.5Zm1.3 5.2v2.1h9V8.7h-9Zm0 3.9v1.1h6.2v-1.1H7.5Z" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">SmartReunion</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block">
              Se connecter
            </Link>
            <Link href="/register" className="rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
              Créer un compte
            </Link>
          </div>
        </nav>

        <section className="grid items-center gap-10 pb-14 pt-12 sm:gap-12 sm:pb-16 sm:pt-16 lg:grid-cols-[1.08fr_.92fr] lg:pb-24 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
              L&apos;espace de travail des équipes alignées
            </div>
            <h1 className="mt-5 max-w-3xl text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              Faites de chaque réunion un{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300">point de départ.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Planifiez, animez et transformez vos échanges en décisions concrètes, sans disperser votre équipe entre plusieurs outils.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-200 sm:w-auto sm:py-3">
                Commencer gratuitement <span aria-hidden>→</span>
              </Link>
              <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-200/40 hover:bg-white/[0.08] sm:w-auto sm:py-3">
                Accéder à mes réunions
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400">
              <span className="flex items-center gap-2"><span className="text-cyan-300">✓</span> QR présence intégré</span>
              <span className="flex items-center gap-2"><span className="text-cyan-300">✓</span> Rapports IA actionnables</span>
              <span className="flex items-center gap-2"><span className="text-cyan-300">✓</span> Suivi en temps réel</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-5 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:rounded-[1.7rem] sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-cyan-200">En direct</span>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-cyan-200">Aujourd&apos;hui · 14:30</p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">Comité produit hebdomadaire</h2>
                    <p className="mt-1 text-sm text-slate-400">Salle Atlas · 8 participants</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-lg text-slate-950">⌁</div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-950/50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Présents</p><p className="mt-1 text-lg font-semibold">6<span className="text-sm text-slate-500">/8</span></p></div>
                  <div className="rounded-xl bg-slate-950/50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Décisions</p><p className="mt-1 text-lg font-semibold">04</p></div>
                  <div className="rounded-xl bg-slate-950/50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Actions</p><p className="mt-1 text-lg font-semibold">07</p></div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-cyan-300 p-3.5 text-slate-950">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950/10 text-sm">✦</span>
                <p className="text-xs font-semibold leading-5">Le rapport et les actions seront prêts dès la fin de la réunion.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 border-t border-white/10 pt-8 md:grid-cols-3">
          {highlights.map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.05]">
              <p className="text-xs font-bold tracking-[.18em] text-cyan-300">{number}</p>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
