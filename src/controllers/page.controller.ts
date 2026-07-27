import { Response } from 'express';
import { PageModel } from '../models/Page.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogModel } from '../models/AuditLog.model';

export const getAllPages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pages = await PageModel.find().sort({ displayOrder: 1 });
    return res.json({ success: true, data: pages });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = await PageModel.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_PAGE',
      resource: 'Page',
      details: { title: page.title, route: page.route },
    });

    return res.status(201).json({ success: true, data: page });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const page = await PageModel.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    return res.json({ success: true, data: page });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const page = await PageModel.findByIdAndUpdate(id, { isDeleted: true, deletedBy: req.user?.id });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    return res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const syncWebsiteRoutes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const frontendRoutes: Array<{ title: string; route: string; module: string; icon?: string }> = req.body.routes || [
      { title: 'Command Center Dashboard', route: '/dashboard', module: 'dashboard', icon: '📊' },
      { title: 'Task Board', route: '/tasks', module: 'tasks', icon: '📋' },
      { title: 'Timeline & Phases', route: '/timeline', module: 'timeline', icon: '⏱️' },
      { title: 'Contract Scope', route: '/deliverables', module: 'deliverables', icon: '📦' },
      { title: 'Approvals Queue', route: '/approvals', module: 'approvals', icon: '✅' },
      { title: 'Team Capacity', route: '/team', module: 'team', icon: '👥' },
      { title: 'User Accounts', route: '/users', module: 'team', icon: '👤' },
      { title: 'KPI Tracker', route: '/kpi', module: 'kpi', icon: '🎯' },
      { title: 'Ad Spend & Budget', route: '/budget', module: 'budget', icon: '💰' },
      { title: 'Notifications Center', route: '/notifications', module: 'notifications', icon: '🔔' },
      { title: 'Settings & Access', route: '/settings', module: 'settings', icon: '⚙️' },
      { title: 'Page Management', route: '/admin/pages', module: 'admin', icon: '📄' }
    ];

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of frontendRoutes) {
      const existing = await PageModel.findOne({ route: item.route });
      if (!existing) {
        await PageModel.create({
          title: item.title,
          route: item.route,
          module: item.module,
          icon: item.icon || '📄',
          displayOrder: 99,
          createdBy: req.user?.id,
        });
        insertedCount++;
      } else {
        await PageModel.updateOne(
          { _id: existing._id },
          { title: item.title, module: item.module, icon: item.icon || existing.icon, updatedBy: req.user?.id }
        );
        updatedCount++;
      }
    }

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'SYNC_ROUTES',
      resource: 'Page',
      details: { insertedCount, updatedCount, totalScanned: frontendRoutes.length },
    });

    return res.json({
      success: true,
      message: `Routes synchronized successfully. Inserted: ${insertedCount}, Updated: ${updatedCount}`,
      data: { insertedCount, updatedCount, totalScanned: frontendRoutes.length }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
