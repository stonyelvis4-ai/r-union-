import { prisma } from '../lib/prisma.js';
import { hashPassword } from './auth.js';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listParticipantsForAdmin(managerId: string) {
  return prisma.user.findMany({
    where: { managerId, role: 'PARTICIPANT' },
    orderBy: { createdAt: 'desc' },
    select: userSelect,
  });
}

export async function getParticipantForAdmin(id: string, managerId: string) {
  return prisma.user.findFirst({
    where: { id, managerId, role: 'PARTICIPANT' },
    select: userSelect,
  });
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  managerId: string;
}

export async function createParticipant(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
      passwordHash,
      role: 'PARTICIPANT',
      managerId: input.managerId,
    },
    select: userSelect,
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; isActive?: boolean; password?: string }
) {
  const updateData: { name?: string; isActive?: boolean; passwordHash?: string } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password?.length) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelect,
  });
}

export async function softDeactivateUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: userSelect,
  });
}
