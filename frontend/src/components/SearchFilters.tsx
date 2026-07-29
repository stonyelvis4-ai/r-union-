'use client';

export interface SearchFiltersState {
  q: string;
  dateFrom: string;
  dateTo: string;
  searchInTranscript: boolean;
}

interface SearchFiltersProps {
  value: SearchFiltersState;
  onChange: (v: SearchFiltersState) => void;
  onSearch: () => void;
  loading?: boolean;
}

export default function SearchFilters({ value, onChange, onSearch, loading }: SearchFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 text-gray-900 dark:text-slate-50 shadow-sm shadow-gray-200 dark:shadow-slate-950/40">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100"><span aria-hidden>🔍</span> Rechercher / Filtrer</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200"><span aria-hidden>📝</span> Texte</label>
          <input
            type="search"
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="Titre ou ordre du jour..."
            className="mt-1 w-64 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40"
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200"><span aria-hidden>📅</span> Du</label>
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            className="mt-1 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40"
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-slate-200"><span aria-hidden>📅</span> Au</label>
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            className="mt-1 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40"
          />
        </div>
        <label className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
          <input
            type="checkbox"
            checked={value.searchInTranscript}
            onChange={(e) => onChange({ ...value, searchInTranscript: e.target.checked })}
          />
          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
            <span aria-hidden>📄</span> Inclure les transcriptions
          </span>
        </label>
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-50"
        >
          {loading ? 'Recherche\u2026' : '🔎 Rechercher'}
        </button>
      </div>
    </div>
  );
}
