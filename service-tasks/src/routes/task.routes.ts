import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.get('/', taskController.index);
taskRoutes.post('/', validateBody(createTaskSchema), taskController.store);
taskRoutes.put('/:taskId', validateBody(updateTaskSchema), taskController.update);
taskRoutes.delete('/:taskId', taskController.destroy);
