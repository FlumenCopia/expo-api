import { Router } from 'express';
import { getAllDeliverables } from '../controllers/deliverable.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', requirePermission('page.deliverables.view', '*'), getAllDeliverables);

export default router;
