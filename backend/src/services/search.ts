import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

export interface SearchMeetingsParams {
  q?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  organizerId?: string;
  searchInTranscript?: boolean;
  userId: string;
  isAdmin: boolean;
}

export async function searchMeetings(params: SearchMeetingsParams) {
  const { q, dateFrom, dateTo, organizerId, searchInTranscript, userId, isAdmin } = params;

  const where: Prisma.MeetingWhereInput = {};

  if (!isAdmin) {
    where.ownerId = userId;
  } else if (organizerId) {
    where.ownerId = organizerId;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as { gte?: Date }).gte = new Date(dateFrom);
    if (dateTo) (where.date as { lte?: Date }).lte = new Date(dateTo);
  }

  if (q?.trim()) {
    const term = q.trim();
    if (searchInTranscript) {
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { agenda: { contains: term, mode: 'insensitive' } },
        { transcription: { fullText: { contains: term, mode: 'insensitive' } } },
      ];
    } else {
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { agenda: { contains: term, mode: 'insensitive' } },
      ];
    }
  }

  return prisma.meeting.findMany({
    where,
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    include: { participants: true, owner: { select: { id: true, email: true, name: true } } },
  });
}
