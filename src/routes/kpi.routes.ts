import { Router } from 'express';
import { getAllKPIs, updateKPI } from '../controllers/kpi.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', getAllKPIs);
router.put('/:id', requirePermission('view_kpi', 'admin', '*'), updateKPI);

export default router;
