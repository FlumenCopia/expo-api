import { Router } from 'express';
import { getAllPages, createPage, updatePage, deletePage, syncWebsiteRoutes } from '../controllers/page.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllPages);
router.post('/sync-routes', requirePermission('admin', 'pages.manage', '*'), syncWebsiteRoutes);
router.post('/', requirePermission('admin', 'pages.manage', '*'), createPage);
router.put('/:id', requirePermission('admin', 'pages.manage', '*'), updatePage);
router.delete('/:id', requirePermission('admin', 'pages.manage', '*'), deletePage);

export default router;
