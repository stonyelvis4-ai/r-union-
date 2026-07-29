import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-gray-500 dark:text-slate-300">La page demandée n&apos;existe pas ou le cache est corrompu.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/40 hover:bg-blue-400"
      >
        <span aria-hidden>🏠</span>
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
