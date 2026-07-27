import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogModel } from '../models/AuditLog.model';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await UserModel.find({ isDeleted: { $ne: true } })
      .populate('roleRef')
      .sort({ name: 1 });
    return res.json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, role, roleId, roleRef, fn, team, cap, skills, short, password } = req.body;

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Resolve Role Document by roleId, roleRef, or input string/ObjectId
    let targetRole = null;
    const inputRole = roleId || roleRef || role;

    if (inputRole) {
      if (mongoose.Types.ObjectId.isValid(inputRole)) {
        targetRole = await RoleModel.findById(inputRole);
      }
      if (!targetRole && typeof inputRole === 'string') {
        targetRole = await RoleModel.findOne({ code: inputRole });
      }
    }

    if (!targetRole) {
      targetRole = (await RoleModel.findOne({ code: 'member' })) || (await RoleModel.findOne());
    }

    const passwordHash = await bcrypt.hash(password || 'User@123456', 10);
    const user = await UserModel.create({
      name,
      email: email || `user_${Date.now()}@flumenx.com`,
      password: passwordHash,
      short: short || name.slice(0, 2).toUpperCase(),
      role: targetRole ? targetRole.code : (role || 'member'),
      roleRef: targetRole ? targetRole._id : undefined,
      fn: fn || 'Team Member',
      team: team || 'core',
      color: req.body.color || '#3B82F6',
      cap: cap || 20,
      skills: skills || [],
      createdBy: req.user?.id,
    });

    const populatedUser = await UserModel.findById(user._id).populate('roleRef');

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_USER',
      resource: 'User',
      details: { name: user.name, role: user.role, roleRef: user.roleRef },
    });

    return res.status(201).json({ success: true, data: populatedUser || user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user?.id };

    const inputRole = updateData.roleId || updateData.roleRef || updateData.role;
    if (inputRole) {
      let targetRole = null;
      if (mongoose.Types.ObjectId.isValid(inputRole)) {
        targetRole = await RoleModel.findById(inputRole);
      }
      if (!targetRole && typeof inputRole === 'string') {
        targetRole = await RoleModel.findOne({ code: inputRole });
      }
      if (targetRole) {
        updateData.role = targetRole.code;
        updateData.roleRef = targetRole._id;
      }
    }

    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).populate('roleRef');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changeUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const user = await UserModel.findByIdAndUpdate(id, { password: passwordHash, updatedBy: req.user?.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'CHANGE_PASSWORD',
      resource: 'User',
      details: { targetUserId: id, targetUserName: user.name },
    });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndUpdate(id, { isDeleted: true, deletedBy: req.user?.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'User removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
