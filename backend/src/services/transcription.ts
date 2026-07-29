import { prisma } from '../lib/prisma.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getTranscription(meetingId: string) {
  return prisma.transcription.findFirst({
    where: { meetingId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createPendingTranscription(meetingId: string, recordingId: string) {
  return prisma.transcription.create({
    data: { meetingId, recordingId, status: 'pending' },
  });
}

export async function runTranscriptionJob(recordingId: string): Promise<void> {
  const recording = await prisma.audioRecording.findUnique({
    where: { id: recordingId },
    include: { meeting: true },
  });
  if (!recording || recording.status !== 'ready') return;
  const transcription = await prisma.transcription.upsert({
    where: { meetingId: recording.meetingId },
    create: { meetingId: recording.meetingId, recordingId, status: 'pending' },
    update: { recordingId, status: 'pending', fullText: null },
  });
  if (transcription.status !== 'pending') return;

  try {
    const fullText = await callSpeechToText(recording.storageKey);
    await prisma.transcription.update({
      where: { id: transcription.id },
      data: { fullText, status: 'complete' },
    });
    console.log('[Transcription] Terminée pour meeting', recording.meetingId);
    const { generateSummary } = await import('./summary.js');
    generateSummary(recording.meetingId).catch((err) => console.error('Summary generation error:', err));
  } catch (err) {
    console.error('[Transcription] Échec:', err);
    await prisma.transcription.update({
      where: { id: transcription.id },
      data: { status: 'failed' },
    });
  }
}

async function callSpeechToText(storageKey: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.warn('[Transcription] OPENAI_API_KEY non configurée — transcription désactivée.');
    return '';
  }
  const { getFileBuffer } = await import('./storage.js');
  const buffer = await getFileBuffer(storageKey);
  if (!buffer) {
    console.error('[Transcription] Fichier audio introuvable:', storageKey);
    return '[Fichier audio introuvable.]';
  }
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'audio/webm' });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI Whisper error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { text?: string };
  return data.text ?? '';
}
