import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requirePermission('page.notifications.view', '*'), getNotifications);
router.patch('/:id/read', requirePermission('page.notifications.edit', 'page.notifications.view', '*'), markAsRead);
router.post('/mark-all-read', requirePermission('page.notifications.edit', 'page.notifications.view', '*'), markAllAsRead);

export default router;
