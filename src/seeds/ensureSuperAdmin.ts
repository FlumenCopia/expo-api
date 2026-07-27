import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { PermissionModel } from '../models/Permission.model';
import { MenuModel } from '../models/Menu.model';
import { PageModel } from '../models/Page.model';
import { UserRole } from '../types';

const DEFAULT_MENUS = [
  { title: 'Command Center', route: '/dashboard', icon: '☀️', section: 'CAMPAIGN', displayOrder: 1, requiredPermission: 'view_all' },
  { title: 'Task Board', route: '/tasks', icon: '📋', section: 'EXECUTION', displayOrder: 2, requiredPermission: 'view_all' },
  { title: 'Timeline & Phases', route: '/timeline', icon: '⏱️', section: 'EXECUTION', displayOrder: 3, requiredPermission: 'view_all' },
  { title: 'Contract Scope', route: '/deliverables', icon: '📦', section: 'EXECUTION', displayOrder: 4, requiredPermission: 'view_all' },
  { title: 'Approvals Queue', route: '/approvals', icon: '✅', section: 'EXECUTION', displayOrder: 5, requiredPermission: 'approve' },
  { title: 'Team Capacity', route: '/team', icon: '👥', section: 'MANAGEMENT', displayOrder: 6, requiredPermission: 'view_all' },
  { title: 'KPI Tracker', route: '/kpi', icon: '🎯', section: 'MANAGEMENT', displayOrder: 7, requiredPermission: 'view_kpi' },
  { title: 'Ad Spend & Budget', route: '/budget', icon: '💰', section: 'MANAGEMENT', displayOrder: 8, requiredPermission: 'view_budget' },
  { title: 'Notifications', route: '/notifications', icon: '🔔', section: 'SYSTEM', displayOrder: 9 },
  { title: 'Settings & Access', route: '/settings', icon: '⚙️', section: 'SYSTEM', displayOrder: 10, requiredPermission: 'manage_team' },
  { title: 'Page Management', route: '/admin/pages', icon: '📄', section: 'SYSTEM', displayOrder: 11, requiredPermission: 'pages.manage' },
];

const DEFAULT_PAGES = [
  { title: 'Command Center Dashboard', route: '/dashboard', icon: '📊', module: 'dashboard', displayOrder: 1, isHidden: false, isPublic: false },
  { title: 'Task Board', route: '/tasks', icon: '📋', module: 'tasks', displayOrder: 2, isHidden: false, isPublic: false },
  { title: 'Timeline & Phases', route: '/timeline', icon: '⏱️', module: 'timeline', displayOrder: 3, isHidden: false, isPublic: false },
  { title: 'Contract Scope', route: '/deliverables', icon: '📦', module: 'deliverables', displayOrder: 4, isHidden: false, isPublic: false },
  { title: 'Approvals Queue', route: '/approvals', icon: '✅', module: 'approvals', displayOrder: 5, isHidden: false, isPublic: false },
  { title: 'Team Capacity', route: '/team', icon: '👥', module: 'team', displayOrder: 6, isHidden: false, isPublic: false },
  { title: 'KPI Tracker', route: '/kpi', icon: '🎯', module: 'kpi', displayOrder: 7, isHidden: false, isPublic: false },
  { title: 'Ad Spend & Budget', route: '/budget', icon: '💰', module: 'budget', displayOrder: 8, isHidden: false, isPublic: false },
  { title: 'Notifications Center', route: '/notifications', icon: '🔔', module: 'notifications', displayOrder: 9, isHidden: false, isPublic: false },
  { title: 'System Settings & Access', route: '/settings', icon: '⚙️', module: 'settings', displayOrder: 10, isHidden: false, isPublic: false },
  { title: 'Page Management', route: '/admin/pages', icon: '📄', module: 'admin', displayOrder: 11, isHidden: false, isPublic: false }
];

/**
 * Production Startup Initializer
 * Ensures Super Admin, default Menus, and Pages exist in MongoDB on server startup.
 */
export async function ensureSuperAdmin() {
  try {
    // 1. Ensure Wildcard Permission & Super Admin Role exist
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

    // 2. Ensure Super Admin user exists
    const existingSuperAdmin = await UserModel.findOne({
      $or: [
        { role: UserRole.SUPER_ADMIN },
        { role: 'super_admin' },
        { email: 'admin@flumenx.com' },
        { email: 'anoop@flumenx.com' },
      ],
    });

    if (!existingSuperAdmin) {
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
      console.log('[Startup Init] Super Admin users created (admin@flumenx.com & anoop@flumenx.com).');
    }

    // 3. Ensure Default Menus exist
    const menuCount = await MenuModel.countDocuments();
    if (menuCount === 0) {
      await MenuModel.insertMany(DEFAULT_MENUS);
      console.log('[Startup Init] Initialized default navigation menus.');
    }

    // 4. Ensure Default Pages exist
    const pageCount = await PageModel.countDocuments();
    if (pageCount === 0) {
      await PageModel.insertMany(DEFAULT_PAGES);
      console.log('[Startup Init] Initialized default system pages.');
    }
  } catch (error) {
    console.error('[Startup Init Error]: Failed to verify/seed Super Admin & Menus:', error);
  }
}
