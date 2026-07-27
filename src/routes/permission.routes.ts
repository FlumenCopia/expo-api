import { Router } from 'express';
import { getAllPermissions } from '../controllers/permission.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', getAllPermissions);

export default router;
