import { prisma } from '../lib/prisma.js';

export interface RecordScanInput {
  meetingId?: string;
  qrToken?: string;
  userId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
}

export async function recordScan(input: RecordScanInput) {
  let meetingId = input.meetingId;
  if (input.qrToken && !meetingId) {
    const meeting = await prisma.meeting.findUnique({
      where: { qrToken: input.qrToken },
      select: { id: true },
    });
    if (!meeting) return null;
    meetingId = meeting.id;
  }
  if (!meetingId) return null;

  if (input.userId) {
    const existing = await prisma.attendance.findFirst({
      where: { meetingId, userId: input.userId },
    });
    if (existing) {
      return { attendance: existing, alreadyRecorded: true };
    }
  }

  const attendance = await prisma.attendance.create({
    data: {
      meetingId,
      userId: input.userId ?? null,
      attendeeName: input.attendeeName?.trim() || null,
      attendeeEmail: input.attendeeEmail?.trim() || null,
    },
  });
  return { attendance, alreadyRecorded: false };
}

export async function listByMeeting(meetingId: string) {
  return prisma.attendance.findMany({
    where: { meetingId },
    orderBy: { scannedAt: 'desc' },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
}
