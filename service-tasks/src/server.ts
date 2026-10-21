import { createApp } from './app';
import { env } from './config/env';
import { assertDatabaseConnection, closeDatabase } from './database/db';

async function bootstrap(): Promise<void> {
  try {
    await assertDatabaseConnection();
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`Banco de dados: ${motivo}`);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log('');
    console.log('  tasks.service');
    console.log(`  Servidor ........ http://localhost:${env.port}`);
    console.log('');
    console.log('  Rotas disponiveis:');
    console.log('    GET  /api/health              (pública)');
    console.log('    POST /api/auth/register       (pública)');
    console.log('    POST /api/auth/login          (pública)');
    console.log('    GET  /api/auth/me             (protegida)');
    console.log('    POST /api/auth/logout         (protegida)');
    console.log('    GET  /api/tasks               (protegida)');
    console.log('    POST /api/tasks               (protegida)');
    console.log('    PUT  /api/tasks/:taskId        (protegida, só dono)');
    console.log('    DELETE /api/tasks/:taskId      (protegida, só dono)');
    console.log('');
  });

  const shutdown = (signal: string): void => {
    console.log(`\nRecebido ${signal}. Encerrando...`);

    server.close(() => {
      closeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    });

    setTimeout(() => {
      console.error('Shutdown demorou demais. Encerrando a força.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error: unknown) => {
  console.error('Falha fatal na inicialização:', error);
  process.exit(1);
});
