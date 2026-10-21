const API = {
  TASKS: 'http://localhost:3000/api',
  LOGS: 'http://localhost:8000/api',
  STATS: 'http://localhost:8001/api',
};

const TOKEN_STORAGE_KEY = 'accessToken';

export interface PublicUser {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
}

export interface AuthData {
  user: PublicUser;
  accessToken: string;
  tokenType: 'Bearer';
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Estatisticas {
  usuarioId: string;
  total: number;
  concluidas: number;
  pendentes: number;
}

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: FieldErrors;

  constructor(message: string, status: number, code: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export const token = {
  get: (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY),
  set: (value: string): void => localStorage.setItem(TOKEN_STORAGE_KEY, value),
  clear: (): void => localStorage.removeItem(TOKEN_STORAGE_KEY),
};

export function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  try {
    const payloadPart = jwt.split('.')[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  withAuth?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code: string; message: string; details?: FieldErrors };
}

async function request<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = 'GET', body, withAuth = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (withAuth) {
    const accessToken = token.get();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(baseUrl + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return { success: true } as ApiEnvelope<T>;
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !envelope.success) {
    if (response.status === 401) token.clear();

    throw new ApiError(
      envelope.error?.message ?? 'Erro inesperado.',
      response.status,
      envelope.error?.code ?? 'UNKNOWN',
      envelope.error?.details,
    );
  }

  return envelope;
}

export interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha?: string;
}

export const api = {
  async register(input: RegisterInput): Promise<AuthData> {
    const { data } = await request<AuthData>(API.TASKS, '/auth/register', { method: 'POST', body: input });
    return data!;
  },

  async login(email: string, senha: string): Promise<AuthData> {
    const { data } = await request<AuthData>(API.TASKS, '/auth/login', {
      method: 'POST',
      body: { email, senha },
    });
    return data!;
  },

  async me(): Promise<PublicUser> {
    const { data } = await request<{ user: PublicUser }>(API.TASKS, '/auth/me', { withAuth: true });
    return data!.user;
  },

  async listarTarefas(): Promise<Tarefa[]> {
    const { data } = await request<Tarefa[]>(API.TASKS, '/tasks', { withAuth: true });
    return data!;
  },

  async criarTarefa(input: { titulo: string; descricao?: string }): Promise<Tarefa> {
    const { data } = await request<Tarefa>(API.TASKS, '/tasks', { method: 'POST', body: input, withAuth: true });
    return data!;
  },

  async atualizarTarefa(id: string, input: { titulo?: string; descricao?: string | null; concluida?: boolean }): Promise<Tarefa> {
    const { data } = await request<Tarefa>(API.TASKS, `/tasks/${id}`, { method: 'PUT', body: input, withAuth: true });
    return data!;
  },

  async excluirTarefa(id: string): Promise<void> {
    await request<null>(API.TASKS, `/tasks/${id}`, { method: 'DELETE', withAuth: true });
  },

  async estatisticas(): Promise<Estatisticas> {
    const { data } = await request<Estatisticas>(API.STATS, '/stats', { withAuth: true });
    return data!;
  },

  async logs(): Promise<unknown[]> {
    const { data } = await request<unknown[]>(API.LOGS, '/logs', { withAuth: true });
    return data!;
  },
};
