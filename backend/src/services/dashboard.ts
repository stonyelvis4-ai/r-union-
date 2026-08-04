import { prisma } from '../lib/prisma.js';

const activeMeetingStatuses = ['DRAFT', 'SCHEDULED'] as const;

export async function getAdminDashboard(ownerId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalMeetings,
    upcomingMeetings,
    completedMeetings,
    participantsInvited,
    attendanceScans,
    sharedReports,
    activeUsers,
    upcoming,
    recent,
  ] = await Promise.all([
    prisma.meeting.count({ where: { ownerId } }),
    prisma.meeting.count({ where: { ownerId, date: { gte: today }, status: { in: [...activeMeetingStatuses] } } }),
    prisma.meeting.count({ where: { ownerId, status: 'COMPLETED' } }),
    prisma.participant.count({ where: { meeting: { ownerId } } }),
    prisma.attendance.count({ where: { meeting: { ownerId } } }),
    prisma.summary.count({ where: { meeting: { ownerId }, isSharedWithParticipants: true } }),
    prisma.user.count({ where: { isActive: true, managerId: ownerId } }),
    prisma.meeting.findMany({
      where: { ownerId, date: { gte: today }, status: { in: [...activeMeetingStatuses] } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 4,
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
        location: true,
        status: true,
        _count: { select: { participants: true, attendances: true } },
      },
    }),
    prisma.meeting.findMany({
      where: { ownerId }, orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
        status: true,
        updatedAt: true,
        summary: { select: { isSharedWithParticipants: true } },
        _count: { select: { participants: true, attendances: true } },
      },
    }),
  ]);

  const reportsToShare = await prisma.summary.count({
    where: { meeting: { ownerId }, isSharedWithParticipants: false },
  });

  return {
    stats: {
      totalMeetings,
      upcomingMeetings,
      completedMeetings,
      participantsInvited,
      attendanceScans,
      sharedReports,
      activeUsers,
      reportsToShare,
    },
    upcoming,
    recent,
  };
}
