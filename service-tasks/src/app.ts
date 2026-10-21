import cors from 'cors';
import express from 'express';
import { routes } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(cors());

  app.use(express.json({ limit: '10kb' }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
