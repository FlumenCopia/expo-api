import { Router } from 'express';
import { getAllKPIs, updateKPI } from '../controllers/kpi.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', requirePermission('page.kpi.view', '*'), getAllKPIs);
router.put('/:id', requirePermission('page.kpi.edit', 'view_kpi', 'admin', '*'), updateKPI);

export default router;
