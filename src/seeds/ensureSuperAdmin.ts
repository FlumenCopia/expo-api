import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { PermissionModel } from '../models/Permission.model';
import { MenuModel } from '../models/Menu.model';
import { PageModel } from '../models/Page.model';
import { UserRole } from '../types';

const SYSTEM_PERMISSIONS = [
  { name: 'Full System Wildcard', code: '*', module: 'Admin', action: 'all', description: 'Unrestricted system access' },
  { name: 'View All Tasks & Reports', code: 'view_all', module: 'Tasks', action: 'read', description: 'View all tasks and system views' },
  { name: 'Create Tasks', code: 'create_task', module: 'Tasks', action: 'create', description: 'Create new tasks' },
  { name: 'Edit Tasks', code: 'edit_task', module: 'Tasks', action: 'update', description: 'Edit existing tasks' },
  { name: 'Assign Tasks', code: 'assign', module: 'Tasks', action: 'assign', description: 'Assign tasks to team members' },
  { name: 'Approve Tasks', code: 'approve', module: 'Tasks', action: 'approve', description: 'Approve and publish tasks' },
  { name: 'Submit for Review', code: 'submit_review', module: 'Tasks', action: 'review', description: 'Submit tasks for lead review' },
  { name: 'Flag Issue', code: 'flag', module: 'Tasks', action: 'flag', description: 'Flag issues and blockers' },
  { name: 'View Budget & Spend', code: 'view_budget', module: 'Budget', action: 'read', description: 'Access ad spend and financial data' },
  { name: 'View KPI Analytics', code: 'view_kpi', module: 'KPI', action: 'read', description: 'Access KPI trackers and metrics' },
  { name: 'Manage Team & Roles', code: 'manage_team', module: 'Team', action: 'manage', description: 'Add, edit, and delete team members and roles' },
  { name: 'Manage Dynamic Pages', code: 'pages.manage', module: 'Admin', action: 'manage', description: 'Manage dynamic pages and website route sync' },

  // Page View & Access Control Permissions
  { name: 'View Command Center Page', code: 'page.dashboard.view', module: 'Pages', action: 'view', description: 'Access Command Center Dashboard' },
  { name: 'View Task Board Page', code: 'page.tasks.view', module: 'Pages', action: 'view', description: 'Access Kanban Task Board' },
  { name: 'View Timeline & Phases Page', code: 'page.timeline.view', module: 'Pages', action: 'view', description: 'Access Timeline & Phase Milestones' },
  { name: 'View Contract Scope Page', code: 'page.deliverables.view', module: 'Pages', action: 'view', description: 'Access Deliverables Contract Scope' },
  { name: 'View Approvals Queue Page', code: 'page.approvals.view', module: 'Pages', action: 'view', description: 'Access Approvals Queue' },
  { name: 'View Team Capacity Page', code: 'page.team.view', module: 'Pages', action: 'view', description: 'Access Team Capacity & Workload' },
  { name: 'View KPI Tracker Page', code: 'page.kpi.view', module: 'Pages', action: 'view', description: 'Access KPI Tracker' },
  { name: 'View Ad Spend & Budget Page', code: 'page.budget.view', module: 'Pages', action: 'view', description: 'Access Ad Spend & Budget' },
  { name: 'View Notifications Page', code: 'page.notifications.view', module: 'Pages', action: 'view', description: 'Access Activity Alerts & Notifications' },
  { name: 'View Settings & Access Page', code: 'page.settings.view', module: 'Pages', action: 'view', description: 'Access System RBAC & Settings' },
  { name: 'View Page Management Page', code: 'page.admin.view', module: 'Pages', action: 'view', description: 'Access Dynamic Route Sync & Management' }
];

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
 * Ensures System Permissions, Super Admin, default Menus, and Pages exist in MongoDB on server startup.
 */
export async function ensureSuperAdmin() {
  try {
    // 1. Upsert all System & Page Permissions
    for (const perm of SYSTEM_PERMISSIONS) {
      await PermissionModel.updateOne(
        { code: perm.code },
        { $setOnInsert: perm },
        { upsert: true }
      );
    }
    console.log('[Startup Init] System permissions verified.');

    // 2. Ensure Super Admin Role exists
    let superAdminRole = await RoleModel.findOne({ code: 'super_admin' });
    if (!superAdminRole) {
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

    // 3. Ensure Super Admin users exist
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
      console.log('[Startup Init] Super Admin users created.');
    }

    // 4. Ensure Default Menus exist
    const menuCount = await MenuModel.countDocuments();
    if (menuCount === 0) {
      await MenuModel.insertMany(DEFAULT_MENUS);
      console.log('[Startup Init] Initialized default navigation menus.');
    }

    // 5. Ensure Default Pages exist
    const pageCount = await PageModel.countDocuments();
    if (pageCount === 0) {
      await PageModel.insertMany(DEFAULT_PAGES);
      console.log('[Startup Init] Initialized default system pages.');
    }
  } catch (error) {
    console.error('[Startup Init Error]: Failed to verify/seed permissions, roles & menus:', error);
  }
}
