import { prisma } from '../lib/prisma.js';
import * as storage from './storage.js';

export type RecordingState = 'idle' | 'recording' | 'paused';

const stateByMeeting = new Map<string, { recordingId: string; state: RecordingState }>();

export async function startRecording(meetingId: string, ownerId: string, isAdmin = false) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { ownerId: true },
  });
  if (!meeting) return null;
  if (meeting.ownerId !== ownerId && !isAdmin) return null;
  const existing = await prisma.audioRecording.findFirst({
    where: { meetingId },
    orderBy: { createdAt: 'desc' },
  });
  if (existing && existing.status === 'uploading') return { recordingId: existing.id, status: existing.status };
  const recording = await prisma.audioRecording.create({
    data: {
      meetingId,
      storageKey: `pending-${meetingId}-${Date.now()}`,
      status: 'uploading',
    },
  });
  stateByMeeting.set(meetingId, { recordingId: recording.id, state: 'recording' });
  return { recordingId: recording.id, status: 'uploading' };
}

export function pauseRecording(meetingId: string) {
  const cur = stateByMeeting.get(meetingId);
  if (cur) cur.state = 'paused';
  return cur;
}

export function resumeRecording(meetingId: string) {
  const cur = stateByMeeting.get(meetingId);
  if (cur) cur.state = 'recording';
  return cur;
}

export async function stopRecording(
  meetingId: string,
  ownerId: string,
  audioBuffer: Buffer,
  durationSeconds?: number
) {
  const cur = stateByMeeting.get(meetingId);
  if (!cur) return null;
  const recording = await prisma.audioRecording.findUnique({
    where: { id: cur.recordingId },
    include: { meeting: { select: { ownerId: true } } },
  });
  if (!recording) return null;
  const { key, url } = await storage.uploadBuffer(audioBuffer, meetingId);
  await prisma.audioRecording.update({
    where: { id: cur.recordingId },
    data: { storageKey: key, storageUrl: url || null, status: 'ready', durationSeconds: durationSeconds ?? null },
  });
  stateByMeeting.delete(meetingId);
  const updated = await prisma.audioRecording.findUnique({ where: { id: cur.recordingId } });
  return updated;
}

export async function getRecording(meetingId: string) {
  return prisma.audioRecording.findFirst({
    where: { meetingId },
    orderBy: { createdAt: 'desc' },
  });
}
