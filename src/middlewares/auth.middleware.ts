import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    team: string;
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined = undefined;

    // Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const rawToken = req.headers.authorization.split(' ')[1];
      if (rawToken && rawToken !== 'cookie_session' && rawToken !== 'null' && rawToken !== 'undefined') {
        token = rawToken;
      }
    }

    // Fallback to HTTP-only Cookie
    if (!token && req.cookies && req.cookies.masters_expo_token) {
      token = req.cookies.masters_expo_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided in cookie or header.' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_masters_expo_2026_flumenx';

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    const user = await UserModel.findById(decoded.id);

    if (!user || !user.isActive || user.isDeleted) {
      res.clearCookie('masters_expo_token', { path: '/' });
      return res.status(401).json({ success: false, message: 'User account not active or found.' });
    }

    // Resolve permissions from user role (check roleRef first, fallback to code)
    let roleDoc = null;
    if (user.roleRef) {
      roleDoc = await RoleModel.findById(user.roleRef);
    }
    if (!roleDoc && user.role) {
      roleDoc = await RoleModel.findOne({ code: user.role });
    }
    const permissions = roleDoc ? roleDoc.permissions : [];

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
      team: user.team,
    };

    next();
  } catch (error) {
    res.clearCookie('masters_expo_token', { path: '/' });
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userPerms = req.user.permissions;

    // Super admin wildcard access
    if (userPerms.includes('*')) {
      return next();
    }

    const hasPermission = requiredPermissions.some((perm) => userPerms.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Required permission missing: [${requiredPermissions.join(', ')}]`,
      });
    }

    next();
  };
};

export const requireRole = (...requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (req.user.permissions.includes('*') || requiredRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden. Required role missing: [${requiredRoles.join(', ')}]`,
    });
  };
};
