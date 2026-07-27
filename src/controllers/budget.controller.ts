import { Response } from 'express';
import { BudgetModel } from '../models/Budget.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationModel } from '../models/Notification.model';
import { io } from '../server';

export const getAllBudgets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budget = await BudgetModel.find();
    return res.json({ success: true, data: budget });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { spent } = req.body;

    const item = await BudgetModel.findOneAndUpdate(
      { $or: [{ _id: id }, { budgetId: id }] },
      { spent, updatedBy: req.user?.id },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Budget item not found' });
    }

    const notif = await NotificationModel.create({
      type: 'budget',
      title: 'Ad spend updated',
      msg: `${item.platform} spend updated to Rs. ${item.spent.toLocaleString('en-IN')}`,
      user: 'u_anoop',
    });

    io.emit('budget_updated', item);
    io.emit('notification', notif);

    return res.json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
