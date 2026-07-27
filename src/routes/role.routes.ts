import { Router } from 'express';
import { getAllRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requirePermission('page.settings.view', '*'), getAllRoles);
router.post('/', requirePermission('page.settings.create', 'page.settings.edit', 'manage_team', 'admin', '*'), createRole);
router.put('/:id', requirePermission('page.settings.edit', 'manage_team', 'admin', '*'), updateRole);
router.delete('/:id', requirePermission('page.settings.delete', 'manage_team', 'admin', '*'), deleteRole);

export default router;
