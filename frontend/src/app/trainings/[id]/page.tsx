'use client';

import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getApiBase } from '@/services/api';

type PublicTraining = {
  id: string;
  title: string;
  description?: string | null;
  mode: 'PRESENTIAL' | 'ONLINE';
  date: string;
  time: string;
  trainer?: string | null;
  location?: string | null;
};

function SignaturePad({ onChange }: { onChange: (signature: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext('2d');
    const p = point(event);
    ctx?.beginPath();
    ctx?.moveTo(p.x, p.y);
  };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const p = point(event);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (ref.current) onChange(ref.current.toDataURL('image/png'));
  };
  const clear = () => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };
  return (
    <div>
      <canvas
        ref={ref}
        width={600}
        height={180}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerLeave={stop}
        className="mt-1 h-36 w-full touch-none rounded-xl border border-slate-300 bg-white"
      />
      <button
        type="button"
        onClick={clear}
        className="mt-2 text-xs font-semibold text-slate-600 underline"
      >
        Effacer la signature
      </button>
    </div>
  );
}

export default function TrainingRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const qrToken = search.get('qr') || '';
  const [training, setTraining] = useState<PublicTraining | null>(null);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!qrToken) {
      setLoading(false);
      return;
    }
    fetch(`${getApiBase()}/trainings/${id}/public?qrToken=${encodeURIComponent(qrToken)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then(setTraining)
      .finally(() => setLoading(false));
  }, [id, qrToken]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signature) return setMessage('La signature est obligatoire.');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`${getApiBase()}/trainings/${id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, qrToken, signature }),
    });
    if (response.ok) setDone(true);
    else setMessage('Impossible de valider l’inscription. Vérifiez le QR code et les champs.');
  };
  if (loading)
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-center text-slate-200">Chargement…</main>
    );
  if (!training)
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-center text-slate-200">
        <h1 className="text-xl font-bold">Accès indisponible</h1>
        <p className="mt-3 text-sm text-slate-400">
          Scannez un QR code de formation valide pour ouvrir le formulaire.
        </p>
      </main>
    );
  if (done)
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-6 text-center">
          <p className="text-3xl">✓</p>
          <h1 className="mt-3 text-2xl font-bold">Inscription confirmée</h1>
          <p className="mt-3 text-sm text-slate-200">
            Votre inscription à « {training.title} » est enregistrée.
          </p>
        </div>
      </main>
    );
  const online = training.mode === 'ONLINE';
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            Formation {online ? 'en ligne' : 'en présentiel'}
          </p>
          <h1 className="mt-2 text-2xl font-bold">{training.title}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {new Date(training.date).toLocaleDateString('fr-FR')} · {training.time}
            {training.location ? ` · ${training.location}` : ''}
          </p>
          {training.description && (
            <p className="mt-3 text-sm text-slate-300">{training.description}</p>
          )}
        </div>
        <form onSubmit={submit} className="mt-5 rounded-2xl bg-white p-5 shadow-xl">
          <h2 className="text-xl font-bold">Fiche d'inscription</h2>
          <p className="mt-1 text-sm text-slate-500">
            Les champs marqués d’un astérisque sont obligatoires.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              Prénom *
              <input
                required
                name="firstName"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
              />
            </label>
            <label>
              Nom *
              <input
                required
                name="lastName"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
              />
            </label>
            <label className="sm:col-span-2">
              Adresse e-mail *
              <input
                required
                type="email"
                name="email"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
              />
            </label>
            <label>
              Numéro de téléphone *
              <input
                required
                type="tel"
                name="phone"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
              />
            </label>
            {online && (
              <label>
                Ville / pays
                <input
                  name="cityCountry"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                />
              </label>
            )}
            <label>
              Entreprise / organisation
              <input
                name="organization"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
              />
            </label>
            <label>
              Fonction / poste
              <input
                name="jobTitle"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
              />
            </label>
            {online && (
              <label className="sm:col-span-2">
                Fuseau horaire
                <input
                  name="timezone"
                  placeholder="Ex. Europe/Paris"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"
                />
              </label>
            )}
            <div className="sm:col-span-2">
              <p className="font-medium">Signature *</p>
              <SignaturePad onChange={setSignature} />
            </div>
          </div>
          {message && <p className="mt-4 text-sm text-rose-600">{message}</p>}
          <button className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white">
            Confirmer mon inscription
          </button>
        </form>
      </div>
    </main>
  );
}
