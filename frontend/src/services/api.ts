/**
 * Détermine automatiquement l'URL de l'API :
 * - Sur le PC (localhost) → http://localhost:4000/api
 * - Sur le téléphone (IP réseau) → http://<même IP>:4000/api
 * La variable NEXT_PUBLIC_API_URL reste prioritaire si définie.
 */
function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    return `http://${hostname}:4000/api`;
  }
  return 'http://localhost:4000/api';
}
export { getApiBase };

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${getApiBase()}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { message?: string }).message || (err as { error?: string }).error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  agenda?: string;
  status: string;
  qrToken: string;
  ownerId: string;
  participants: { id: string; email: string; displayName?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}
