import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogModel } from '../models/AuditLog.model';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_masters_expo_2026_flumenx';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_token_key_masters_expo_2026';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('masters_expo_token', token, {
    httpOnly: true,
    secure: false, // set true in HTTPS production
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const getRolePermissions = async (user: any) => {
  let roleDoc = null;
  if (user.roleRef) {
    roleDoc = await RoleModel.findById(user.roleRef);
  }
  if (!roleDoc && user.role) {
    roleDoc = await RoleModel.findOne({ code: user.role });
  }
  return roleDoc ? roleDoc.permissions : [];
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user inactive' });
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password || '');
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    const permissions = await getRolePermissions(user);

    const accessToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '14d' });

    setAuthCookie(res, accessToken);

    await AuditLogModel.create({
      user: user._id.toString(),
      userName: user.name,
      action: 'LOGIN',
      resource: 'Auth',
      details: { email: user.email, role: user.role, roleRef: user.roleRef },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          short: user.short,
          role: user.role,
          roleRef: user.roleRef,
          fn: user.fn,
          team: user.team,
          color: user.color,
          cap: user.cap,
          skills: user.skills,
          permissions,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('masters_expo_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user || user.isDeleted || !user.isActive) {
      res.clearCookie('masters_expo_token', { path: '/' });
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    const permissions = await getRolePermissions(user);

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        short: user.short,
        role: user.role,
        roleRef: user.roleRef,
        fn: user.fn,
        team: user.team,
        color: user.color,
        cap: user.cap,
        skills: user.skills,
        permissions,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const switchUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const permissions = await getRolePermissions(user);

    const accessToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, accessToken);

    return res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          short: user.short,
          role: user.role,
          roleRef: user.roleRef,
          fn: user.fn,
          team: user.team,
          color: user.color,
          cap: user.cap,
          skills: user.skills,
          permissions,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
