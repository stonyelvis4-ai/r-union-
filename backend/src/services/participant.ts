import { prisma } from '../lib/prisma.js';

export async function addParticipant(meetingId: string, email: string, displayName?: string) {
  return prisma.participant.create({
    data: { meetingId, email: email.trim(), displayName: displayName?.trim() || null },
  });
}

/** Ajoute sans doublon l'utilisateur qui a scanné le QR d'une réunion. */
export async function joinParticipantFromQr(meetingId: string, email: string, displayName?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return prisma.participant.upsert({
    where: { meetingId_email: { meetingId, email: normalizedEmail } },
    update: displayName?.trim() ? { displayName: displayName.trim() } : {},
    create: {
      meetingId,
      email: normalizedEmail,
      displayName: displayName?.trim() || null,
    },
  });
}

export async function listParticipantsByMeeting(meetingId: string) {
  return prisma.participant.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function removeParticipant(participantId: string) {
  return prisma.participant.delete({ where: { id: participantId } });
}
