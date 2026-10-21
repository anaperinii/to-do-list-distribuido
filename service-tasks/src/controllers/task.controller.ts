import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { taskService } from '../services/task.service';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

function requireAuthenticated(req: Request): { id: string; token: string } {
  if (!req.user || !req.token) {
    throw AppError.unauthorized();
  }
  return { id: req.user.id, token: req.token };
}

export const taskController = {
  async index(req: Request, res: Response): Promise<void> {
    const { id } = requireAuthenticated(req);
    const tarefas = await taskService.list(id);

    res.status(200).json({
      success: true,
      message: 'Tarefas carregadas com sucesso.',
      data: tarefas,
    });
  },

  async store(req: Request, res: Response): Promise<void> {
    const { id, token } = requireAuthenticated(req);
    const tarefa = await taskService.create(id, token, req.body as CreateTaskInput);

    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso.',
      data: tarefa,
    });
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id, token } = requireAuthenticated(req);
    const tarefa = await taskService.update(id, token, req.params.taskId as string, req.body as UpdateTaskInput);

    res.status(200).json({
      success: true,
      message: 'Tarefa atualizada com sucesso.',
      data: tarefa,
    });
  },

  async destroy(req: Request, res: Response): Promise<void> {
    const { id, token } = requireAuthenticated(req);
    await taskService.remove(id, token, req.params.taskId as string);

    res.status(200).json({
      success: true,
      message: 'Tarefa removida com sucesso.',
    });
  },
};
