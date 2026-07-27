import { Router } from 'express';
import { getAllRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllRoles);
router.post('/', requirePermission('manage_team', 'admin', '*'), createRole);
router.put('/:id', requirePermission('manage_team', 'admin', '*'), updateRole);
router.delete('/:id', requirePermission('manage_team', 'admin', '*'), deleteRole);

export default router;
