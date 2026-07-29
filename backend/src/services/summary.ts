import { prisma } from '../lib/prisma.js';
import * as emailService from './email.js';
import * as reportExport from './report-export.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getSummary(meetingId: string) {
  return prisma.summary.findUnique({
    where: { meetingId },
  });
}

export async function setSummaryShared(meetingId: string, isSharedWithParticipants: boolean) {
  return prisma.summary.update({ where: { meetingId }, data: { isSharedWithParticipants } });
}

export async function generateSummary(meetingId: string): Promise<{ id: string } | null> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      participants: true,
      transcription: true,
      attendances: { include: { user: { select: { email: true, name: true } } } },
    },
  });
  if (!meeting) return null;
  const existing = await prisma.summary.findUnique({ where: { meetingId } });
  if (existing) return { id: existing.id };

  const fullText = meeting.transcription?.fullText ?? '';
  const status = meeting.transcription?.status ?? 'pending';
  if (status !== 'complete' || !fullText?.trim()) return null;

  const participantsList = meeting.participants
    .map((p) => (p.displayName ? `${p.displayName} (${p.email})` : p.email))
    .join(', ');
  const attendeesList =
    meeting.attendances.length > 0
      ? meeting.attendances
          .map((a) => (a.user ? `${a.user.name || a.user.email}` : a.attendeeName || a.attendeeEmail || 'Anonyme'))
          .join(', ')
      : participantsList;

  let discussionSummary = fullText.slice(0, 2000);
  let keyDecisions = 'Non extrait automatiquement.';
  let actionItems = 'Non extrait automatiquement.';
  let responsiblePersons = '—';
  let nextSteps = 'À définir.';

  if (OPENAI_API_KEY) {
    try {
      const structured = await callOpenAISummary(fullText);
      discussionSummary = structured.discussionSummary ?? discussionSummary;
      keyDecisions = structured.keyDecisions ?? keyDecisions;
      actionItems = structured.actionItems ?? actionItems;
      responsiblePersons = structured.responsiblePersons ?? responsiblePersons;
      nextSteps = structured.nextSteps ?? nextSteps;
    } catch (err) {
      console.error('OpenAI summary error:', err);
    }
  }

  const summary = await prisma.summary.create({
    data: {
      meetingId,
      title: meeting.title,
      meetingDate: meeting.date,
      participantsText: participantsList || 'Aucun',
      discussionSummary,
      keyDecisions,
      actionItems,
      responsiblePersons,
      nextSteps,
    },
  });

  return { id: summary.id };
}

export async function resendReport(meetingId: string): Promise<boolean> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      participants: true,
      attendances: { include: { user: { select: { email: true } } } },
    },
  });
  if (!meeting) return false;

  const allEmails = new Set<string>();
  meeting.participants.forEach((p) => { if (p.email) allEmails.add(p.email); });
  meeting.attendances.forEach((a) => {
    if (a.user?.email) allEmails.add(a.user.email);
    if (a.attendeeEmail) allEmails.add(a.attendeeEmail);
  });
  if (allEmails.size === 0) return false;

  const summary = await prisma.summary.findUnique({ where: { meetingId } });
  let pdfBuffer: Buffer | undefined;
  if (summary) {
    try {
      pdfBuffer = await reportExport.buildPdfBuffer(summary);
    } catch (e) {
      console.error('PDF generation for resend failed:', e);
    }
  }

  await emailService.sendReportToParticipants(meetingId, meeting.title, [...allEmails], pdfBuffer);
  return true;
}

async function callOpenAISummary(text: string): Promise<{
  discussionSummary: string;
  keyDecisions: string;
  actionItems: string;
  responsiblePersons: string;
  nextSteps: string;
}> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            "Tu extrais des sections structurées à partir d'une transcription de réunion. Réponds en JSON avec les clés: discussionSummary, keyDecisions, actionItems, responsiblePersons, nextSteps. Chaque valeur est du texte en français, concis.",
        },
        {
          role: 'user',
          content: `Transcription:\n\n${text.slice(0, 12000)}`,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('No content');
  return JSON.parse(raw) as {
    discussionSummary: string;
    keyDecisions: string;
    actionItems: string;
    responsiblePersons: string;
    nextSteps: string;
  };
}
