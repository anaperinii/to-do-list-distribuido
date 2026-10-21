import { z } from 'zod';

const nomeSchema = z
  .string({ required_error: 'O nome é obrigatório.', invalid_type_error: 'O nome deve ser um texto.' })
  .trim()
  .min(3, 'O nome deve ter no mínimo 3 caracteres.')
  .max(120, 'O nome deve ter no máximo 120 caracteres.');

const emailSchema = z
  .string({ required_error: 'O e-mail é obrigatório.', invalid_type_error: 'O e-mail deve ser um texto.' })
  .trim()
  .toLowerCase()
  .email('Informe um e-mail válido.')
  .max(255, 'O e-mail deve ter no máximo 255 caracteres.');

const passwordSchema = z
  .string({ required_error: 'A senha é obrigatória.', invalid_type_error: 'A senha deve ser um texto.' })
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres (limite do algoritmo bcrypt).')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula.')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula.')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número.');

export const registerSchema = z
  .object({
    nome: nomeSchema,
    email: emailSchema,
    senha: passwordSchema,
    confirmarSenha: z.string().optional(),
  })
  .strict()
  .refine((data) => data.confirmarSenha === undefined || data.confirmarSenha === data.senha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });

export const loginSchema = z
  .object({
    email: emailSchema,
    senha: z.string({ required_error: 'A senha é obrigatória.' }).min(1, 'A senha é obrigatória.'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
