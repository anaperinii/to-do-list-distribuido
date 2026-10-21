import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { taskRoutes } from './task.routes';
import { noStore } from '../middlewares/noStore.middleware';

export const routes = Router();

routes.use(noStore);

routes.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'tasks-api', uptimeSeconds: Math.round(process.uptime()) });
});

routes.use('/auth', authRoutes);
routes.use('/tasks', taskRoutes);
