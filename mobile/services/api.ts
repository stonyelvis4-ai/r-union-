import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_KEY = 'API_BASE';
const TOKEN_KEY = 'auth_token';

export const getApiBase = (): string => {
  // En production, utiliser une config ou env
  return 'http://localhost:4000/api';
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export interface ApiOptions extends RequestInit {
  token?: string | null;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const base = getApiBase();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { message?: string }).message || (err as { error?: string }).error || 'Erreur');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function login(email: string, password: string): Promise<{ user: { id: string; email: string; name?: string }; token: string }> {
  const data = await api<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  return data;
}

export async function getMe(token: string): Promise<{ id: string; email: string; name?: string; role: string }> {
  return api('/auth/me', { token });
}

export async function getMeetings(token: string): Promise<Meeting[]> {
  return api('/meetings', { token });
}

export async function getMeeting(id: string, token: string): Promise<Meeting> {
  return api(`/meetings/${id}`, { token });
}

export async function getSummary(meetingId: string, token: string): Promise<Summary | null> {
  try {
    return await api(`/meetings/${meetingId}/summary`, { token });
  } catch {
    return null;
  }
}

export async function scanAttendance(params: { qrToken?: string; meetingId?: string }, token: string | null) {
  return api<{ success: boolean; alreadyRecorded?: boolean }>('/attendance/scan', {
    method: 'POST',
    body: JSON.stringify(params),
    token: token ?? undefined,
  });
}

export async function syncAttendance(items: { qrToken?: string; meetingId?: string; scannedAt?: string }[], token: string) {
  return api<{ results: { success: boolean; alreadyRecorded?: boolean; error?: string }[] }>('/attendance/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
    token,
  });
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
  participants?: { id: string; email: string; displayName?: string }[];
}

export interface Summary {
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
}
