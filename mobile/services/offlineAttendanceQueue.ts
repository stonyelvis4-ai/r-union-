import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, syncAttendance } from './api';

const PENDING_SCANS_KEY = 'offline_attendance_pending';

export interface PendingScan {
  id: string;
  qrToken?: string;
  meetingId?: string;
  scannedAt: string;
}

export async function getPendingScans(): Promise<PendingScan[]> {
  const raw = await AsyncStorage.getItem(PENDING_SCANS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addPendingScan(item: { qrToken?: string; meetingId?: string }): Promise<PendingScan> {
  const pending = await getPendingScans();
  const scan: PendingScan = {
    id: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...item,
    scannedAt: new Date().toISOString(),
  };
  pending.push(scan);
  await AsyncStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(pending));
  return scan;
}

export async function removePendingScan(id: string): Promise<void> {
  const pending = await getPendingScans();
  const next = pending.filter((p) => p.id !== id);
  await AsyncStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(next));
}

export async function clearPendingScans(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_SCANS_KEY);
}

export async function syncPendingScans(): Promise<{ synced: number; failed: number }> {
  const token = await getToken();
  if (!token) return { synced: 0, failed: 0 };
  const pending = await getPendingScans();
  if (pending.length === 0) return { synced: 0, failed: 0 };
  try {
    const res = await syncAttendance(
      pending.map((p) => ({ qrToken: p.qrToken, meetingId: p.meetingId, scannedAt: p.scannedAt })),
      token
    );
    const results = res.results ?? [];
    const stillPending: PendingScan[] = [];
    let synced = 0;
    pending.forEach((p, i) => {
      if (results[i]?.success) synced++;
      else stillPending.push(p);
    });
    await AsyncStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(stillPending));
    return { synced, failed: stillPending.length };
  } catch {
    return { synced: 0, failed: pending.length };
  }
}
