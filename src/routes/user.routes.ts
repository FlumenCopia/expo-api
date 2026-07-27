import { Router } from 'express';
import { getAllUsers, createUser, updateUser, changeUserPassword, deleteUser } from '../controllers/user.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllUsers);
router.post('/', requirePermission('manage_team', 'admin', '*'), createUser);
router.put('/:id', requirePermission('manage_team', 'admin', '*'), updateUser);
router.put('/:id/password', requirePermission('manage_team', 'admin', '*'), changeUserPassword);
router.delete('/:id', requirePermission('manage_team', 'admin', '*'), deleteUser);

export default router;
