import { Response } from 'express';
import { RoleModel } from '../models/Role.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogModel } from '../models/AuditLog.model';

export const getAllRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = await RoleModel.find();
    return res.json({ success: true, data: roles });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, code, description, permissions } = req.body;

    const existing = await RoleModel.findOne({ code });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Role code already exists' });
    }

    const role = await RoleModel.create({
      name,
      code,
      description,
      permissions: permissions || [],
      createdBy: req.user?.id,
    });

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'CREATE_ROLE',
      resource: 'Role',
      details: { name: role.name, code: role.code },
    });

    return res.status(201).json({ success: true, data: role });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const role = await RoleModel.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'UPDATE_ROLE',
      resource: 'Role',
      details: { name: role.name, code: role.code, permissions: role.permissions },
    });

    return res.json({ success: true, data: role });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const role = await RoleModel.findById(id);

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystemRole || role.code === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete system roles' });
    }

    await RoleModel.findByIdAndDelete(id);

    await AuditLogModel.create({
      user: req.user?.id,
      userName: req.user?.name,
      action: 'DELETE_ROLE',
      resource: 'Role',
      details: { roleId: id, name: role.name },
    });

    return res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
