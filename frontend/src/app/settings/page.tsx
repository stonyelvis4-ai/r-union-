'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import { getApiBase } from '@/services/api';

type Settings = {
  user: { name?: string | null; email: string; avatarUrl?: string | null };
  organizationName?: string | null;
  organizationLogoUrl?: string | null;
  country?: string | null;
  city?: string | null;
  timezone: string;
  defaultMeetingDuration: number;
  defaultLocation?: string | null;
  defaultOnlineUrl?: string | null;
  qrEnabled: boolean;
  confirmationEmailsEnabled: boolean;
  remindersEnabled: boolean;
  adminNotificationsEnabled: boolean;
  publicRegistrationEnabled: boolean;
  signatureRequired: boolean;
  phoneRequired: boolean;
  autoExportAttendanceEnabled: boolean;
};
const inputClass =
  'mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-white';
const labelClass = 'text-sm font-medium text-slate-200';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const router = useRouter();
  const api = getApiBase();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => {
    if (!token) return;
    fetch(`${api}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<Settings>;
      })
      .then(setSettings)
      .catch(() => setMessage('Impossible de charger les réglages.'));
  }, [api, token]);
  const setValue = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  const setProfile = (key: 'name' | 'avatarUrl', value: string) =>
    setSettings((current) =>
      current ? { ...current, user: { ...current.user, [key]: value || null } } : current
    );
  const save = async () => {
    if (!token || !settings) return;
    setSaving(true);
    const { user, ...preferences } = settings;
    const r = await fetch(`${api}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...preferences,
        name: user.name || undefined,
        avatarUrl: user.avatarUrl || null,
      }),
    });
    setMessage(r.ok ? 'Réglages enregistrés.' : 'Impossible d’enregistrer les réglages.');
    setSaving(false);
  };
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const r = await fetch(`${api}/settings/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(passwords),
    });
    if (r.ok) {
      const payload = (await r.json()) as { token: string };
      localStorage.setItem('token', payload.token);
    }
    setMessage(
      r.ok
        ? 'Mot de passe modifié.'
        : 'Le mot de passe actuel est incorrect ou le nouveau mot de passe est trop court.'
    );
    if (r.ok) setPasswords({ currentPassword: '', newPassword: '' });
  };
  const signOut = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };
  const deleteAccount = async () => {
    if (!token) return;
    const password = window.prompt(
      'Saisissez votre mot de passe pour supprimer définitivement votre compte administrateur.'
    );
    if (
      !password ||
      !window.confirm(
        'Cette action supprimera votre compte et les données dont il est propriétaire. Continuer ?'
      )
    )
      return;
    const r = await fetch(`${api}/settings/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    if (r.ok) signOut();
    else setMessage('Suppression impossible : mot de passe incorrect.');
  };
  if (!settings)
    return (
      <main className="sr-grid min-h-screen bg-slate-950 p-6 text-slate-50">
        Chargement des réglages…
      </main>
    );
  const Toggle = ({
    field,
    label,
    help,
  }: {
    field: keyof Settings;
    label: string;
    help: string;
  }) => (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <span>
        <span className="block font-semibold text-white">{label}</span>
        <span className="mt-1 block text-xs text-slate-400">{help}</span>
      </span>
      <input
        type="checkbox"
        checked={Boolean(settings[field])}
        onChange={(e) => setValue(field, e.target.checked as Settings[typeof field])}
        className="mt-1 h-5 w-5 accent-cyan-300"
      />
    </label>
  );
  return (
    <main className="sr-grid min-h-screen bg-slate-950 px-4 pb-12 pt-5 text-slate-50 sm:px-6 sm:pt-7">
      <div className="mx-auto max-w-5xl">
        <AdminNavigation />
        <header className="mb-7 border-b border-white/10 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Espace administrateur
          </p>
          <h1 className="mt-2 text-3xl font-bold">Réglages</h1>
          <p className="mt-2 text-sm text-slate-300">
            Personnalisez votre espace et les inscriptions de votre organisation.
          </p>
        </header>
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Profil</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nom
                <input
                  value={settings.user.name || ''}
                  onChange={(e) => setProfile('name', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                E-mail
                <input
                  value={settings.user.email}
                  disabled
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Photo de profil (URL)
                <input
                  type="url"
                  value={settings.user.avatarUrl || ''}
                  onChange={(e) => setProfile('avatarUrl', e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Organisation</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nom de l’organisation
                <input
                  value={settings.organizationName || ''}
                  onChange={(e) => setValue('organizationName', e.target.value || null)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Logo (URL)
                <input
                  type="url"
                  value={settings.organizationLogoUrl || ''}
                  onChange={(e) => setValue('organizationLogoUrl', e.target.value || null)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Pays
                <input
                  value={settings.country || ''}
                  onChange={(e) => setValue('country', e.target.value || null)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Ville
                <input
                  value={settings.city || ''}
                  onChange={(e) => setValue('city', e.target.value || null)}
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Fuseau horaire
                <input
                  value={settings.timezone}
                  onChange={(e) => setValue('timezone', e.target.value)}
                  placeholder="Africa/Abidjan"
                  className={inputClass}
                />
              </label>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Réunions et formations</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Durée par défaut (minutes)
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={settings.defaultMeetingDuration}
                  onChange={(e) => setValue('defaultMeetingDuration', Number(e.target.value))}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Lieu par défaut
                <input
                  value={settings.defaultLocation || ''}
                  onChange={(e) => setValue('defaultLocation', e.target.value || null)}
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Lien de visioconférence par défaut
                <input
                  type="url"
                  value={settings.defaultOnlineUrl || ''}
                  onChange={(e) => setValue('defaultOnlineUrl', e.target.value || null)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-4">
              <Toggle
                field="qrEnabled"
                label="QR codes activés"
                help="Autorise la création de QR codes d’inscription et de présence."
              />
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Notifications</h2>
            <div className="mt-5 grid gap-3">
              <Toggle
                field="confirmationEmailsEnabled"
                label="E-mails de confirmation"
                help="Confirme une inscription au participant."
              />
              <Toggle
                field="remindersEnabled"
                label="Rappels"
                help="Active les rappels avant une réunion ou formation."
              />
              <Toggle
                field="adminNotificationsEnabled"
                label="Notifications administrateur"
                help="Vous informe des nouvelles inscriptions."
              />
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Participants</h2>
            <div className="mt-5 grid gap-3">
              <Toggle
                field="publicRegistrationEnabled"
                label="Inscriptions publiques"
                help="Permet les inscriptions via QR code publié."
              />
              <Toggle
                field="signatureRequired"
                label="Signature obligatoire"
                help="Demande une signature dans le formulaire participant."
              />
              <Toggle
                field="phoneRequired"
                label="Téléphone obligatoire"
                help="Exige un numéro de téléphone dans les formulaires."
              />
              <Toggle
                field="autoExportAttendanceEnabled"
                label="Export automatique"
                help="Prépare l’export de la liste de présence après les inscriptions."
              />
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Sécurité</h2>
            <p className="mt-2 text-sm text-slate-400">Session active sur cet appareil.</p>
            <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Mot de passe actuel
                <input
                  required
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Nouveau mot de passe
                <input
                  required
                  minLength={8}
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className={inputClass}
                />
              </label>
              <button className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white">
                Modifier le mot de passe
              </button>
              <button
                type="button"
                onClick={signOut}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white"
              >
                Déconnexion
              </button>
            </form>
            <button
              type="button"
              onClick={() => void deleteAccount()}
              className="mt-5 text-sm font-semibold text-rose-300"
            >
              Supprimer mon compte administrateur
            </button>
          </section>
        </div>
        <div className="sticky bottom-4 mt-7 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl">
          <p className="text-sm text-cyan-100">{message}</p>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les réglages'}
          </button>
        </div>
      </div>
    </main>
  );
}
