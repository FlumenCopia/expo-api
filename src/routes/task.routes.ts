import { Router } from 'express';
import { getAllTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requirePermission('page.tasks.view', '*'), getAllTasks);
router.post('/', requirePermission('page.tasks.create', 'page.tasks.edit', 'create_task', 'admin', '*'), createTask);
router.put('/:id', requirePermission('page.tasks.edit', 'edit_task', 'update_own', 'admin', '*'), updateTask);
router.delete('/:id', requirePermission('page.tasks.delete', 'delete_task', 'admin', '*'), deleteTask);

export default router;
