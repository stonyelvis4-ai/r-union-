import Link from 'next/link';

const highlights = [
  ['01', 'Préparez', 'Créez une réunion claire, cadrée et prête à démarrer.'],
  ['02', 'Participez', 'Rejoignez une réunion avec un QR code sécurisé.'],
  ['03', 'Décidez', 'Retrouvez les comptes rendus partagés par votre administrateur.'],
];

export default function Home() {
  return (
    <main className="sr-grid min-h-screen overflow-hidden bg-slate-950 px-4 pb-12 pt-4 text-slate-50 sm:px-8 sm:pt-5 lg:px-12">
      <div className="sr-orb sr-orb-one" />
      <div className="sr-orb sr-orb-two" />

      <div className="relative mx-auto max-w-7xl">
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 backdrop-blur-xl sm:px-5">
          <Link href="/" className="flex items-center gap-3" aria-label="SmartReunion, accueil">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-600 shadow-lg shadow-cyan-500/20">✦</span>
            <span className="text-sm font-semibold tracking-tight">SmartReunion</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block">Se connecter</Link>
            <Link href="/register" className="rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">Créer un compte</Link>
          </div>
        </nav>

        <section className="mx-auto max-w-3xl py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
            L&apos;espace de travail des équipes alignées
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
            Faites de chaque réunion un <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300">point de départ.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Planifiez, animez et transformez vos échanges en décisions concrètes, sans disperser votre équipe entre plusieurs outils.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-200">Commencer gratuitement</Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.045] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-200/40 hover:bg-white/[0.08]">Accéder à mes réunions</Link>
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
