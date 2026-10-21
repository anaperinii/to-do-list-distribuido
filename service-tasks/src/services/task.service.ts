import { AppError } from '../errors/AppError';
import { taskModel, toPublicTask, type PublicTask } from '../models/task.model';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { logClient } from './log.client';

export const taskService = {
  async list(usuarioId: string): Promise<PublicTask[]> {
    const rows = await taskModel.findAllByUser(usuarioId);
    return rows.map(toPublicTask);
  },

  async create(usuarioId: string, token: string, input: CreateTaskInput): Promise<PublicTask> {
    const row = await taskModel.create({
      usuarioId,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
    });

    void logClient.registrar(token, 'CRIACAO_TAREFA', `Tarefa "${row.titulo}" criada (id ${row.id})`);

    return toPublicTask(row);
  },

  async update(usuarioId: string, token: string, taskId: string, input: UpdateTaskInput): Promise<PublicTask> {
    const row = await taskModel.findById(taskId);

    if (!row) {
      throw AppError.notFound('Tarefa não encontrada.');
    }

    if (row.usuarioId !== usuarioId) {
      void logClient.registrar(
        token,
        'ACESSO_NEGADO',
        `Usuário tentou alterar tarefa id ${taskId} pertencente a outro usuário`,
      );
      throw AppError.forbidden('Você não pode alterar tarefas de outro usuário.');
    }

    const updated = await taskModel.update(taskId, input);

    void logClient.registrar(
      token,
      input.concluida ? 'CONCLUSAO_TAREFA' : 'ATUALIZACAO_TAREFA',
      `Tarefa "${updated.titulo}" atualizada (id ${updated.id})`,
    );

    return toPublicTask(updated);
  },

  async remove(usuarioId: string, token: string, taskId: string): Promise<void> {
    const row = await taskModel.findById(taskId);

    if (!row) {
      throw AppError.notFound('Tarefa não encontrada.');
    }

    if (row.usuarioId !== usuarioId) {
      void logClient.registrar(
        token,
        'ACESSO_NEGADO',
        `Usuário tentou excluir tarefa id ${taskId} pertencente a outro usuário`,
      );
      throw AppError.forbidden('Você não pode excluir tarefas de outro usuário.');
    }

    await taskModel.remove(taskId);

    void logClient.registrar(token, 'EXCLUSAO_TAREFA', `Tarefa id ${taskId} removida`);
  },
};
