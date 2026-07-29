'use client';

import { useState } from 'react';
import { getApiBase } from '@/services/api';

export default function AttendanceScan() {
  const API_BASE = getApiBase();
  const [qrToken, setQrToken] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleScan() {
    if (!qrToken.trim()) {
      setMessage({ type: 'error', text: 'Saisissez le token QR.' });
      return;
    }
    setMessage(null);
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${API_BASE}/attendance/scan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ qrToken: qrToken.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'error', text: (data as { message?: string }).message || 'Erreur' });
        return;
      }
      setMessage({
        type: 'success',
        text: (data as { alreadyRecorded?: boolean }).alreadyRecorded
          ? 'Présence déjà enregistrée.'
          : 'Présence enregistrée.',
      });
      setQrToken('');
    } catch {
      setMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 text-gray-900 dark:text-slate-50">
      <h3 className="text-sm font-semibold">Marquer ma présence</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-slate-300">
        Saisissez le code QR de la réunion (ou scannez avec l'app mobile).
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={qrToken}
          onChange={(e) => setQrToken(e.target.value)}
          placeholder="Token QR"
          className="flex-1 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-950/70 px-3 py-2 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40"
        />
        <button
          type="button"
          onClick={handleScan}
          disabled={loading}
          className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-blue-500/40 hover:bg-blue-400 disabled:opacity-50"
        >
          {loading ? '…' : 'Valider'}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-xs ${
            message.type === 'success' ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
