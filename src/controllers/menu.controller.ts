import { Response } from 'express';
import { MenuModel } from '../models/Menu.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const DEFAULT_MENUS = [
  { title: 'Command Center', route: '/dashboard', icon: '☀️', section: 'CAMPAIGN', displayOrder: 10, requiredPermission: 'page.dashboard.view' },
  { title: 'Task Board', route: '/tasks', icon: '📋', section: 'EXECUTION', displayOrder: 20, requiredPermission: 'page.tasks.view' },
  { title: 'Timeline & Phases', route: '/timeline', icon: '⏱️', section: 'EXECUTION', displayOrder: 30, requiredPermission: 'page.timeline.view' },
  { title: 'Contract Scope', route: '/deliverables', icon: '📦', section: 'EXECUTION', displayOrder: 40, requiredPermission: 'page.deliverables.view' },
  { title: 'Approvals Queue', route: '/approvals', icon: '✅', section: 'EXECUTION', displayOrder: 50, requiredPermission: 'page.approvals.view' },
  { title: 'Team Capacity', route: '/team', icon: '📊', section: 'MANAGEMENT', displayOrder: 60, requiredPermission: 'page.team.view' },
  { title: 'User Accounts', route: '/users', icon: '👤', section: 'MANAGEMENT', displayOrder: 65, requiredPermission: 'page.team.view' },
  { title: 'KPI Tracker', route: '/kpi', icon: '🎯', section: 'MANAGEMENT', displayOrder: 70, requiredPermission: 'page.kpi.view' },
  { title: 'Ad Spend & Budget', route: '/budget', icon: '💰', section: 'MANAGEMENT', displayOrder: 80, requiredPermission: 'page.budget.view' },
  { title: 'Notifications', route: '/notifications', icon: '🔔', section: 'SYSTEM', displayOrder: 90, requiredPermission: 'page.notifications.view' },
  { title: 'Settings & Access', route: '/settings', icon: '⚙️', section: 'SYSTEM', displayOrder: 100, requiredPermission: 'page.settings.view' },
  { title: 'Page Management', route: '/admin/pages', icon: '📄', section: 'SYSTEM', displayOrder: 110, requiredPermission: 'page.admin.view' },
];

export const getNavMenus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let allMenus = await MenuModel.find().sort({ section: 1, displayOrder: 1 });

    if (!allMenus || allMenus.length === 0) {
      await MenuModel.insertMany(DEFAULT_MENUS);
      allMenus = await MenuModel.find().sort({ section: 1, displayOrder: 1 });
    } else {
      // Ensure /users menu exists if DB menus exist
      const hasUsersMenu = allMenus.some((m) => m.route === '/users');
      if (!hasUsersMenu) {
        await MenuModel.create({
          title: 'User Accounts',
          route: '/users',
          icon: '👤',
          section: 'MANAGEMENT',
          displayOrder: 65,
          requiredPermission: 'page.team.view',
        });
        allMenus = await MenuModel.find().sort({ section: 1, displayOrder: 1 });
      }
    }

    const userPerms = req.user?.permissions || [];

    const permittedMenus = allMenus.filter((menu) => {
      if (!menu.requiredPermission || userPerms.includes('*')) return true;
      return userPerms.includes(menu.requiredPermission);
    });

    return res.json({ success: true, data: permittedMenus });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
