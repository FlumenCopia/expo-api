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

    const notif = await NotificationModel.create({
      type: 'assign',
      title: 'New assignment',
      msg: `${task.code} — ${task.title} assigned`,
      user: task.assignee,
    });

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
    const existingTask = await TaskModel.findById(id);

    if (!existingTask || existingTask.isDeleted) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const currentUserId = req.user?.id || '';
    const currentUserEmail = (req.user?.email || '').toLowerCase();
    const currentUserName = (req.user?.name || '').toLowerCase();
    const userPermissions = req.user?.permissions || [];

    // Check Super Admin privilege
    const isSuperAdmin = userPermissions.includes('*') || req.user?.role === 'super_admin';

    // Check Assigned Person
    const isAssignee =
      existingTask.assignee === currentUserId ||
      existingTask.assignee === currentUserEmail ||
      (existingTask.assignee && existingTask.assignee.toLowerCase() === currentUserName);

    // Check Reviewer / Approver
    const isReviewer =
      existingTask.reviewer === currentUserId ||
      existingTask.reviewer === currentUserEmail ||
      (existingTask.reviewer && existingTask.reviewer.toLowerCase() === currentUserName);

    // Check Creator
    const isCreator = existingTask.createdBy === currentUserId;

    // Strict Authorization: Only Super Admin, Assigned Person, Reviewer, or Creator can update task
    if (!isSuperAdmin && !isAssignee && !isReviewer && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access Restricted. Only the assigned team member, reviewer, or Super Admin can update this task.',
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: currentUserId },
      { new: true }
    );

    if (req.body.status) {
      const type = updatedTask?.status === 'approved' || updatedTask?.status === 'published' ? 'done' : 'approval';
      const notif = await NotificationModel.create({
        type: type as any,
        title: `Task status: ${updatedTask?.status}`,
        msg: `${updatedTask?.code} set to ${updatedTask?.status}`,
        user: updatedTask?.assignee,
      });

      io.emit('task_updated', updatedTask);
      io.to(`user_${updatedTask?.assignee}`).emit('notification', notif);
    }

    return res.json({ success: true, data: updatedTask });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingTask = await TaskModel.findById(id);

    if (!existingTask || existingTask.isDeleted) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const currentUserId = req.user?.id || '';
    const userPermissions = req.user?.permissions || [];
    const isSuperAdmin = userPermissions.includes('*') || req.user?.role === 'super_admin';
    const isCreator = existingTask.createdBy === currentUserId;

    if (!isSuperAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access Restricted. Only the task creator or Super Admin can delete this task.',
      });
    }

    existingTask.isDeleted = true;
    existingTask.deletedBy = currentUserId;
    await existingTask.save();

    io.emit('task_deleted', { id });

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
