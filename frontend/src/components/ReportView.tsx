'use client';

import { getApiBase } from '@/services/api';

export interface SummaryData {
  id: string;
  meetingId: string;
  title: string;
  meetingDate: string;
  participantsText: string;
  discussionSummary: string;
  keyDecisions: string;
  actionItems: string;
  responsiblePersons: string;
  nextSteps: string;
  generatedAt: string;
  version: number;
}

interface ReportViewProps {
  meetingId: string;
  summary: SummaryData;
  token: string | null;
}

export default function ReportView({ meetingId, summary, token }: ReportViewProps) {
  const API_BASE = getApiBase();
  const download = (format: 'pdf' | 'docx') => {
    if (!token) return;
    const url = `${API_BASE}/meetings/${meetingId}/report?format=${format}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Téléchargement impossible');
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `rapport-${summary.title.replace(/[^a-z0-9]/gi, '-')}.${format}`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(console.error);
  };

  const sections = [
    { icon: '👥', label: 'Participants', value: summary.participantsText },
    { icon: '💬', label: 'Résumé de la discussion', value: summary.discussionSummary },
    { icon: '⚖️', label: 'Décisions clés', value: summary.keyDecisions },
    { icon: '📋', label: 'Actions', value: summary.actionItems },
    { icon: '👤', label: 'Responsables', value: summary.responsiblePersons },
    { icon: '🚀', label: 'Prochaines étapes', value: summary.nextSteps },
  ];

  return (
    <section className="sr-tile rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-lg shadow-gray-200 dark:shadow-slate-950/60">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-slate-100">
          <span aria-hidden>📊</span> Rapport de réunion
        </h2>
        <span className="text-[11px] text-gray-400 dark:text-slate-400">
          Généré le {new Date(summary.generatedAt).toLocaleString('fr-FR')}
        </span>
      </div>

      <div className="space-y-3">
        {sections.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950/40 p-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-300">
              <span aria-hidden>{s.icon}</span> {s.label}
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-100">{s.value || '\u2014'}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => download('pdf')}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-rose-900/40 hover:bg-rose-500"
        >
          <span aria-hidden>📄</span> Télécharger PDF
        </button>
        <button
          type="button"
          onClick={() => download('docx')}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-900/40 hover:bg-blue-500"
        >
          <span aria-hidden>📝</span> Télécharger Word
        </button>
        {token && (
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch(`${API_BASE}/meetings/${meetingId}/report/send`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                  alert('Impossible de renvoyer le rapport par email.');
                  return;
                }
                alert('Rapport renvoyé aux participants (voir logs backend pour le détail).');
              } catch {
                alert("Erreur lors de l'envoi du rapport.");
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-slate-600 px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-800"
          >
            <span aria-hidden>📨</span> Renvoyer par email
          </button>
        )}
      </div>
    </section>
  );
}
