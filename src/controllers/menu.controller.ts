import { Response } from 'express';
import { MenuModel } from '../models/Menu.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getNavMenus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allMenus = await MenuModel.find().sort({ section: 1, displayOrder: 1 });
    const userPerms = req.user?.permissions || [];

    // Filter menus based on user permissions
    const permittedMenus = allMenus.filter((menu) => {
      if (!menu.requiredPermission || userPerms.includes('*')) return true;
      return userPerms.includes(menu.requiredPermission);
    });

    return res.json({ success: true, data: permittedMenus });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
