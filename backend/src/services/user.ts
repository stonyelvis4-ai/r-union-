import { prisma } from '../lib/prisma.js';
import type { Role } from '@prisma/client';
import { hashPassword } from './auth.js';

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role: Role;
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; role?: Role; isActive?: boolean; password?: string }
) {
  const updateData: { name?: string; role?: Role; isActive?: boolean; passwordHash?: string } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password?.length) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function softDeactivateUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
