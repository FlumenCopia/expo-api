import { Router } from 'express';
import { login, logout, getProfile, switchUser } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/switch-user', switchUser);
router.get('/profile', authenticateJWT, getProfile);

export default router;
