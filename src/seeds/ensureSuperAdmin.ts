import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { PermissionModel } from '../models/Permission.model';
import { UserRole } from '../types';

/**
 * Production Startup Initializer
 * Checks if a Super Admin user exists in MongoDB on server startup.
 * If missing, creates the default Super Admin user and role safely.
 * If already present, skips creation without altering existing production data.
 */
export async function ensureSuperAdmin() {
  try {
    // 1. Ensure Super Admin Permission & Role exist
    let superAdminRole = await RoleModel.findOne({ code: 'super_admin' });
    if (!superAdminRole) {
      // Ensure wildcard permission exists
      let wildcardPerm = await PermissionModel.findOne({ code: '*' });
      if (!wildcardPerm) {
        wildcardPerm = await PermissionModel.create({
          name: 'Full System Wildcard',
          code: '*',
          module: 'Admin',
          action: 'all',
          description: 'Unrestricted system access',
        });
      }

      superAdminRole = await RoleModel.create({
        name: 'Super Admin',
        code: 'super_admin',
        description: 'Full production system access',
        permissions: ['*'],
        isSystemRole: true,
      });
      console.log('[Startup Init] Created default Super Admin Role.');
    }

    // 2. Check if Super Admin user exists
    const existingSuperAdmin = await UserModel.findOne({
      $or: [
        { role: UserRole.SUPER_ADMIN },
        { role: 'super_admin' },
        { email: 'admin@flumenx.com' },
      ],
    });

    if (!existingSuperAdmin) {
      const passwordHash = await bcrypt.hash('Admin@123456', 10);
      await UserModel.create({
        email: 'admin@flumenx.com',
        password: passwordHash,
        name: 'FlumenX Super Admin',
        short: 'SA',
        role: UserRole.SUPER_ADMIN,
        roleRef: superAdminRole._id,
        fn: 'System Administrator',
        team: 'core',
        color: '#F5A623',
        cap: 40,
        skills: ['admin', 'security', 'full_access'],
        isActive: true,
      });
      console.log('[Startup Init] Super Admin user created: admin@flumenx.com / Admin@123456');
    } else {
      console.log(`[Startup Init] Super Admin user verified (${existingSuperAdmin.email}).`);
    }
  } catch (error) {
    console.error('[Startup Init Error]: Failed to verify/seed Super Admin:', error);
  }
}
