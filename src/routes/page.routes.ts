import { Router } from 'express';
import { getAllPages, createPage, updatePage, deletePage, syncWebsiteRoutes } from '../controllers/page.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requirePermission('page.admin.view', '*'), getAllPages);
router.post('/sync-routes', requirePermission('page.admin.create', 'page.admin.edit', 'admin', 'pages.manage', '*'), syncWebsiteRoutes);
router.post('/', requirePermission('page.admin.create', 'page.admin.edit', 'admin', 'pages.manage', '*'), createPage);
router.put('/:id', requirePermission('page.admin.edit', 'admin', 'pages.manage', '*'), updatePage);
router.delete('/:id', requirePermission('page.admin.delete', 'admin', 'pages.manage', '*'), deletePage);

export default router;
