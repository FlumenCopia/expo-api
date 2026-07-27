import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { PermissionModel } from '../models/Permission.model';
import { UserRole } from '../types';

/**
 * Production Startup Initializer
 * Checks if Super Admin users exist in MongoDB on server startup.
 * If missing, creates the default Super Admin accounts and role safely.
 * If already present, skips creation without altering existing production data.
 */
export async function ensureSuperAdmin() {
  try {
    // 1. Ensure Super Admin Permission & Role exist
    let superAdminRole = await RoleModel.findOne({ code: 'super_admin' });
    if (!superAdminRole) {
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

    const defaultPasswordHash = await bcrypt.hash('Admin@123456', 10);

    // 2. Ensure admin@flumenx.com exists
    const adminUser = await UserModel.findOne({ email: 'admin@flumenx.com' });
    if (!adminUser) {
      await UserModel.create({
        email: 'admin@flumenx.com',
        password: defaultPasswordHash,
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
      console.log('[Startup Init] Super Admin created: admin@flumenx.com / Admin@123456');
    }

    // 3. Ensure anoop@flumenx.com exists
    const anoopUser = await UserModel.findOne({ email: 'anoop@flumenx.com' });
    if (!anoopUser) {
      await UserModel.create({
        email: 'anoop@flumenx.com',
        password: defaultPasswordHash,
        name: 'Anoop Krishna',
        short: 'AK',
        role: UserRole.SUPER_ADMIN,
        roleRef: superAdminRole._id,
        fn: 'Founder / Strategy',
        team: 'core',
        color: '#F5A623',
        cap: 40,
        skills: ['strategy', 'client', 'approval', 'full_access'],
        isActive: true,
      });
      console.log('[Startup Init] Super Admin created: anoop@flumenx.com / Admin@123456');
    }
  } catch (error) {
    console.error('[Startup Init Error]: Failed to verify/seed Super Admin:', error);
  }
}
