import { Router } from 'express';
import { getAllBudgets, updateBudget } from '../controllers/budget.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', requirePermission('page.budget.view', '*'), getAllBudgets);
router.put('/:id', requirePermission('page.budget.edit', 'view_budget', 'admin', '*'), updateBudget);

export default router;
