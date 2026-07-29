'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getApiBase } from '@/services/api';

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'uploading';

interface RecordingControlsProps {
  meetingId: string;
  token: string | null;
  onRecordingStopped?: () => void;
}

export default function RecordingControls({ meetingId, token, onRecordingStopped }: RecordingControlsProps) {
  const API_BASE = getApiBase();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // formate mm:ss
  const formattedTime = new Date(seconds * 1000).toISOString().substring(14, 19);

  // démarre/arrête le minuteur en fonction du statut
  useEffect(() => {
    if (status === 'recording') {
      if (timerRef.current == null) {
        timerRef.current = window.setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (status === 'idle' || status === 'uploading') {
        setSeconds(0);
      }
    }

    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  const start = useCallback(async () => {
    if (!token) {
      setError('Connectez-vous pour enregistrer.');
      return;
    }
    setError('');
    try {
      const res = await fetch(`${API_BASE}/meetings/${meetingId}/recording/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Impossible de démarrer l\'enregistrement');
      const data = (await res.json()) as { recordingId: string };
      setRecordingId(data.recordingId);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setStatus('recording');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }, [meetingId, token]);

  const pause = useCallback(async () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (token) {
        await fetch(`${API_BASE}/meetings/${meetingId}/recording/pause`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setStatus('paused');
    }
  }, [meetingId, token]);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
    }
  }, []);

  const stop = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || !token) return;
    setStatus('uploading');
    mr.stop();
    mediaRecorderRef.current = null;
    try {
      await new Promise<void>((r) => setTimeout(r, 500));
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
      const form = new FormData();
      form.append('audio', blob, 'audio.webm');
      const res = await fetch(`${API_BASE}/meetings/${meetingId}/recording/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error('Impossible d\'arrêter l\'enregistrement');
      setRecordingId(null);
      setStatus('idle');
      onRecordingStopped?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setStatus('idle');
    }
  }, [meetingId, token, onRecordingStopped]);

  return (
    <section className="mt-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 text-gray-900 dark:text-slate-50">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Enregistrement</h2>
        {(status === 'recording' || status === 'paused') && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-700 dark:text-slate-200">
            <span
              className={
                status === 'recording'
                  ? 'h-2 w-2 rounded-full bg-red-500 animate-pulse'
                  : 'h-2 w-2 rounded-full bg-amber-400'
              }
            />
            <span>{formattedTime}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {status === 'idle' && (
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
          >
            Démarrer l&apos;enregistrement
          </button>
        )}
        {status === 'recording' && (
          <>
            <button
              type="button"
              onClick={pause}
              className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={stop}
              className="rounded-full bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
            >
              Arrêter et envoyer
            </button>
            <span className="flex items-center text-xs text-red-400">
              ● Enregistrement en cours
            </span>
          </>
        )}
        {status === 'paused' && (
          <>
            <button
              type="button"
              onClick={resume}
              className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={stop}
              className="rounded-full bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
            >
              Arrêter et envoyer
            </button>
          </>
        )}
        {status === 'uploading' && (
          <span className="text-xs text-gray-500 dark:text-slate-300">Envoi en cours…</span>
        )}
      </div>
    </section>
  );
}
