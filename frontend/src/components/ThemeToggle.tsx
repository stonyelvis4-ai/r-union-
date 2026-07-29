'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-lg shadow-lg transition-all hover:scale-110 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-950/60"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
