import { prisma } from '../lib/prisma.js';
import type { MeetingStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

function generateQrToken(): string {
  return randomBytes(24).toString('hex');
}

export interface CreateMeetingInput {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location?: string;
  agenda?: string;
  ownerId: string;
  participantEmails?: string[];
}

export async function createMeeting(input: CreateMeetingInput) {
  const qrToken = generateQrToken();
  const meeting = await prisma.meeting.create({
    data: {
      title: input.title,
      date: new Date(input.date),
      time: input.time,
      location: input.location ?? null,
      agenda: input.agenda ?? null,
      ownerId: input.ownerId,
      qrToken,
      status: 'DRAFT',
      participants: input.participantEmails?.length
        ? {
            create: input.participantEmails.map((email) => ({ email: email.trim() })),
          }
        : undefined,
    },
    include: { participants: true },
  });
  return meeting;
}

export async function getMeetingById(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: { participants: true, owner: { select: { id: true, email: true, name: true } } },
  });
}

export async function getMeetingByQrToken(qrToken: string) {
  return prisma.meeting.findUnique({
    where: { qrToken },
    include: { participants: true },
  });
}

/** Infos minimales pour la page publique (inscription présence sans compte). */
export async function getMeetingPublic(id: string) {
  const m = await prisma.meeting.findUnique({
    where: { id },
    select: { id: true, title: true, date: true, time: true },
  });
  if (!m) return null;
  return { id: m.id, title: m.title, date: m.date, time: m.time };
}

export async function listMeetingsByOwner(ownerId: string) {
  return prisma.meeting.findMany({
    where: { ownerId },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    include: { participants: true },
  });
}

export async function listAllMeetings() {
  return prisma.meeting.findMany({
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    include: { participants: true, owner: { select: { id: true, email: true, name: true } } },
  });
}

export async function updateMeeting(
  id: string,
  data: Partial<Pick<Prisma.MeetingUpdateInput, 'title' | 'date' | 'time' | 'location' | 'agenda' | 'status'>>
) {
  const updateData: Prisma.MeetingUpdateInput = {};
  if (data.title != null) updateData.title = data.title;
  if (data.date != null) updateData.date = data.date;
  if (data.time != null) updateData.time = data.time;
  if (data.location != null) updateData.location = data.location;
  if (data.agenda != null) updateData.agenda = data.agenda;
  if (data.status != null) updateData.status = data.status as MeetingStatus;
  return prisma.meeting.update({
    where: { id },
    data: updateData,
    include: { participants: true },
  });
}

export async function deleteMeeting(id: string) {
  return prisma.meeting.delete({ where: { id } });
}
