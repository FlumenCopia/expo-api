import { Router } from 'express';
import { getAllTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllTasks);
router.post('/', requirePermission('create_task', 'admin', '*'), createTask);
router.put('/:id', requirePermission('edit_task', 'update_own', 'admin', '*'), updateTask);
router.delete('/:id', requirePermission('admin', '*'), deleteTask);

export default router;
