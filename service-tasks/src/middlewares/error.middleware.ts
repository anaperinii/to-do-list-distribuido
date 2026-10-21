import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { logClient } from '../services/log.client';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500 && req.token) {
      void logClient.registrar(req.token, 'ERRO', err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Corpo da requisição não é um JSON válido.' },
    });
    return;
  }

  console.error('[erro não tratado]', err);

  if (req.token) {
    void logClient.registrar(req.token, 'ERRO', err instanceof Error ? err.message : 'Erro desconhecido');
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno no servidor.',
      ...(err instanceof Error ? { debug: err.message } : {}),
    },
  });
}
