import { Router } from 'express';
import { getAllDeliverables } from '../controllers/deliverable.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', getAllDeliverables);

export default router;
