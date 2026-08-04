import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import type { TrainingMode, TrainingStatus } from '@prisma/client';

export interface CreateTrainingInput {
  title: string;
  description?: string;
  mode: TrainingMode;
  date: string;
  time: string;
  trainer?: string;
  location?: string;
  onlineUrl?: string;
  presentationItems?: { title: string; description?: string; durationMinutes?: number; resourceUrl?: string }[];
}

export async function listTrainings() {
  return prisma.training.findMany({
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    include: { _count: { select: { registrations: true, presentationItems: true } } },
  });
}

export async function createTraining(input: CreateTrainingInput) {
  return prisma.training.create({
    data: {
      title: input.title,
      description: input.description || null,
      mode: input.mode,
      date: new Date(input.date),
      time: input.time,
      trainer: input.trainer || null,
      location: input.mode === 'PRESENTIAL' ? input.location || null : null,
      onlineUrl: input.mode === 'ONLINE' ? input.onlineUrl || null : null,
      qrToken: randomBytes(24).toString('hex'),
      presentationItems: input.presentationItems?.length
        ? { create: input.presentationItems.map((item, position) => ({ ...item, position })) }
        : undefined,
    },
    include: { presentationItems: { orderBy: { position: 'asc' } }, _count: { select: { registrations: true } } },
  });
}

export async function getTraining(id: string) {
  return prisma.training.findUnique({
    where: { id },
    include: {
      presentationItems: { orderBy: { position: 'asc' } },
      registrations: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function getPublicTraining(id: string, qrToken: string) {
  return prisma.training.findFirst({
    where: { id, qrToken, qrActive: true, status: 'PUBLISHED' },
    select: { id: true, title: true, description: true, mode: true, date: true, time: true, trainer: true, location: true },
  });
}

export async function setQrActive(id: string, qrActive: boolean) {
  return prisma.training.update({ where: { id }, data: { qrActive } });
}

export async function updateTrainingStatus(id: string, status: TrainingStatus) {
  return prisma.training.update({ where: { id }, data: { status } });
}

/** Supprime une formation et ses listes associées (inscriptions et étapes). */
export async function deleteTraining(id: string) {
  return prisma.training.delete({ where: { id } });
}

export async function registerForTraining(input: {
  trainingId: string;
  qrToken: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityCountry?: string;
  organization?: string;
  jobTitle?: string;
  timezone?: string;
  signature: string;
}) {
  const training = await getPublicTraining(input.trainingId, input.qrToken);
  if (!training) return { training: null, registration: null };
  const registration = await prisma.trainingRegistration.upsert({
    where: { trainingId_email: { trainingId: input.trainingId, email: input.email.toLowerCase() } },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      cityCountry: input.cityCountry || null,
      organization: input.organization || null,
      jobTitle: input.jobTitle || null,
      timezone: input.timezone || null,
      signature: input.signature,
      signedAt: new Date(),
    },
    create: {
      trainingId: input.trainingId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      cityCountry: input.cityCountry || null,
      organization: input.organization || null,
      jobTitle: input.jobTitle || null,
      timezone: input.timezone || null,
      signature: input.signature,
    },
  });
  return { training, registration };
}
