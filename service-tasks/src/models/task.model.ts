import { type Tarefa } from '@prisma/client';
import { prisma } from '../database/db';

export type TaskRow = Tarefa;

export interface PublicTask {
  id: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  titulo: string;
  descricao?: string | null;
  usuarioId: string;
}

export interface UpdateTaskInput {
  titulo?: string;
  descricao?: string | null;
  concluida?: boolean;
}

export const taskModel = {
  async create(input: CreateTaskInput): Promise<TaskRow> {
    return prisma.tarefa.create({
      data: {
        titulo: input.titulo,
        descricao: input.descricao ?? null,
        usuarioId: input.usuarioId,
      },
    });
  },

  async findAllByUser(usuarioId: string): Promise<TaskRow[]> {
    return prisma.tarefa.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string): Promise<TaskRow | null> {
    return prisma.tarefa.findUnique({ where: { id } });
  },

  async update(id: string, input: UpdateTaskInput): Promise<TaskRow> {
    return prisma.tarefa.update({ where: { id }, data: input });
  },

  async remove(id: string): Promise<void> {
    await prisma.tarefa.delete({ where: { id } });
  },
};

export function toPublicTask(row: TaskRow): PublicTask {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    concluida: row.concluida,
    usuarioId: row.usuarioId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
