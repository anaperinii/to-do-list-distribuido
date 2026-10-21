import { z } from 'zod';

export const createTaskSchema = z
  .object({
    titulo: z
      .string({ required_error: 'O título é obrigatório.' })
      .trim()
      .min(1, 'O título é obrigatório.')
      .max(180, 'O título deve ter no máximo 180 caracteres.'),
    descricao: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    titulo: z.string().trim().min(1).max(180).optional(),
    descricao: z.string().trim().max(2000).nullable().optional(),
    concluida: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
