import { Prisma, type Usuario } from '@prisma/client';
import { prisma } from '../database/db';

export type UserRow = Usuario;

export interface PublicUser {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
}

export interface CreateUserInput {
  nome: string;
  email: string;
  passwordHash: string;
}

export const userModel = {
  async create(input: CreateUserInput): Promise<UserRow> {
    return prisma.usuario.create({
      data: {
        nome: input.nome,
        email: input.email,
        passwordHash: input.passwordHash,
      },
    });
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<UserRow | null> {
    return prisma.usuario.findUnique({ where: { id } });
  },
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

export function isUniqueViolation(error: unknown, field?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;

  if (field) {
    const target = error.meta?.['target'];
    const fields = Array.isArray(target) ? target : [target];
    return fields.includes(field);
  }

  return true;
}
