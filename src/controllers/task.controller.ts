import { Response } from 'express';
import { TaskModel } from '../models/Task.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationModel } from '../models/Notification.model';
import { io } from '../server';
import { AuditLogModel } from '../models/AuditLog.model';

export const getAllTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: tasks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await TaskModel.countDocuments();
    const code = req.body.code || `EXP-${String(count + 1).padStart(3, '0')}`;

    const task = await TaskModel.create({
      ...req.body,
      code,
      createdBy: req.user?.id,
    });

    // Create Notification
    const notif = await NotificationModel.create({
      type: 'assign',
      title: 'New assignment',
      msg: `${task.code} — ${task.title} assigned`,
      user: task.assignee,
    });

    // Emit Socket Event
    io.emit('task_created', task);
    io.to(`user_${task.assignee}`).emit('notification', notif);

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_TASK',
      resource: 'Task',
      details: { code: task.code, title: task.title, assignee: task.assignee },
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.body.status) {
      const type = task.status === 'approved' || task.status === 'published' ? 'done' : 'approval';
      const notif = await NotificationModel.create({
        type: type as any,
        title: `Task status: ${task.status}`,
        msg: `${task.code} set to ${task.status}`,
        user: task.assignee,
      });

      io.emit('task_updated', task);
      io.to(`user_${task.assignee}`).emit('notification', notif);
    }

    return res.json({ success: true, data: task });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.findByIdAndUpdate(id, { isDeleted: true, deletedBy: req.user?.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    io.emit('task_deleted', { id });

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
