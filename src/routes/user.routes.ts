import { Router } from 'express';
import { getAllUsers, createUser, updateUser, changeUserPassword, deleteUser } from '../controllers/user.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requirePermission('page.team.view', '*'), getAllUsers);
router.post('/', requirePermission('page.team.create', 'page.team.edit', 'manage_team', 'admin', '*'), createUser);
router.put('/:id', requirePermission('page.team.edit', 'manage_team', 'admin', '*'), updateUser);
router.put('/:id/password', changeUserPassword);
router.delete('/:id', requirePermission('page.team.delete', 'manage_team', 'admin', '*'), deleteUser);

export default router;
