import { Response } from 'express';
import { PermissionModel } from '../models/Permission.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getAllPermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const permissions = await PermissionModel.find().sort({ module: 1, name: 1 });
    return res.json({ success: true, data: permissions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
