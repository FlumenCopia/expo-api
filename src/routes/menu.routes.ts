import { Router } from 'express';
import { getNavMenus } from '../controllers/menu.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', getNavMenus);

export default router;
