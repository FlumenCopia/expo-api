import { Response } from 'express';
import { NotificationModel } from '../models/Notification.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const permissions = req.user?.permissions || [];

    let query: any = {};
    if (!permissions.includes('*') && !permissions.includes('view_all')) {
      query = { $or: [{ user: userId }, { user: 'all' }] };
    }

    const notifs = await NotificationModel.find(query).sort({ ts: -1 });
    return res.json({ success: true, data: notifs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notif = await NotificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
    return res.json({ success: true, data: notif });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    await NotificationModel.updateMany({ $or: [{ user: userId }, { user: 'all' }] }, { read: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
