import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.model';
import { RoleModel } from '../models/Role.model';
import { PermissionModel } from '../models/Permission.model';
import { MenuModel } from '../models/Menu.model';
import { PageModel } from '../models/Page.model';
import { UserRole } from '../types';

const PAGE_WISE_PERMISSIONS = [
  // Wildcard
  { name: 'Full System Wildcard (*)', code: '*', module: 'System Admin', page: 'all', action: 'all', description: 'Unrestricted access across all pages' },

  // Command Center Page (/dashboard)
  { name: 'View Command Center', code: 'page.dashboard.view', module: 'Command Center', page: 'Command Center', action: 'view', description: 'View Command Center Dashboard' },
  { name: 'Create Command Center Items', code: 'page.dashboard.create', module: 'Command Center', page: 'Command Center', action: 'create', description: 'Create dashboard widgets/alerts' },
  { name: 'Edit Command Center', code: 'page.dashboard.edit', module: 'Command Center', page: 'Command Center', action: 'edit', description: 'Modify dashboard layout and widgets' },
  { name: 'Delete Command Center Items', code: 'page.dashboard.delete', module: 'Command Center', page: 'Command Center', action: 'delete', description: 'Remove dashboard items' },

  // Task Board Page (/tasks)
  { name: 'View Task Board', code: 'page.tasks.view', module: 'Task Board', page: 'Task Board', action: 'view', description: 'View Kanban Task Board' },
  { name: 'Create Tasks', code: 'page.tasks.create', module: 'Task Board', page: 'Task Board', action: 'create', description: 'Create new tasks' },
  { name: 'Edit / Move Tasks', code: 'page.tasks.edit', module: 'Task Board', page: 'Task Board', action: 'edit', description: 'Update, assign, drag & drop tasks' },
  { name: 'Delete Tasks', code: 'page.tasks.delete', module: 'Task Board', page: 'Task Board', action: 'delete', description: 'Delete tasks from board' },

  // Timeline Page (/timeline)
  { name: 'View Timeline & Phases', code: 'page.timeline.view', module: 'Timeline & Phases', page: 'Timeline & Phases', action: 'view', description: 'View Phase milestones' },
  { name: 'Create Phase Milestones', code: 'page.timeline.create', module: 'Timeline & Phases', page: 'Timeline & Phases', action: 'create', description: 'Add new timeline phase' },
  { name: 'Edit Phase Milestones', code: 'page.timeline.edit', module: 'Timeline & Phases', page: 'Timeline & Phases', action: 'edit', description: 'Update timeline dates & phase status' },
  { name: 'Delete Phase Milestones', code: 'page.timeline.delete', module: 'Timeline & Phases', page: 'Timeline & Phases', action: 'delete', description: 'Remove phase milestone' },

  // Contract Scope Page (/deliverables)
  { name: 'View Contract Scope', code: 'page.deliverables.view', module: 'Contract Scope', page: 'Contract Scope', action: 'view', description: 'View deliverables contract scope' },
  { name: 'Create Scope Items', code: 'page.deliverables.create', module: 'Contract Scope', page: 'Contract Scope', action: 'create', description: 'Add new scope item' },
  { name: 'Edit Contract Scope', code: 'page.deliverables.edit', module: 'Contract Scope', page: 'Contract Scope', action: 'edit', description: 'Edit existing scope items' },
  { name: 'Delete Scope Items', code: 'page.deliverables.delete', module: 'Contract Scope', page: 'Contract Scope', action: 'delete', description: 'Remove scope items' },

  // Approvals Queue Page (/approvals)
  { name: 'View Approvals Queue', code: 'page.approvals.view', module: 'Approvals Queue', page: 'Approvals Queue', action: 'view', description: 'View tasks waiting for approval' },
  { name: 'Create Approval Request', code: 'page.approvals.create', module: 'Approvals Queue', page: 'Approvals Queue', action: 'create', description: 'Submit new approval request' },
  { name: 'Approve / Reject Tasks', code: 'page.approvals.edit', module: 'Approvals Queue', page: 'Approvals Queue', action: 'edit', description: 'Perform lead approval or rejection' },
  { name: 'Delete Approval Items', code: 'page.approvals.delete', module: 'Approvals Queue', page: 'Approvals Queue', action: 'delete', description: 'Dismiss approval request' },

  // Team Capacity Page (/team)
  { name: 'View Team Capacity', code: 'page.team.view', module: 'Team Capacity', page: 'Team Capacity', action: 'view', description: 'View team members and workload' },
  { name: 'Create Team Members', code: 'page.team.create', module: 'Team Capacity', page: 'Team Capacity', action: 'create', description: 'Add new team member account' },
  { name: 'Edit Team Members', code: 'page.team.edit', module: 'Team Capacity', page: 'Team Capacity', action: 'edit', description: 'Edit team member details' },
  { name: 'Delete Team Members', code: 'page.team.delete', module: 'Team Capacity', page: 'Team Capacity', action: 'delete', description: 'Remove team member' },

  // KPI Tracker Page (/kpi)
  { name: 'View KPI Tracker', code: 'page.kpi.view', module: 'KPI Tracker', page: 'KPI Tracker', action: 'view', description: 'View KPI targets and metrics' },
  { name: 'Create KPI Metric', code: 'page.kpi.create', module: 'KPI Tracker', page: 'KPI Tracker', action: 'create', description: 'Add new KPI tracker metric' },
  { name: 'Edit KPI Metrics', code: 'page.kpi.edit', module: 'KPI Tracker', page: 'KPI Tracker', action: 'edit', description: 'Update actual vs target KPI metrics' },
  { name: 'Delete KPI Metric', code: 'page.kpi.delete', module: 'KPI Tracker', page: 'KPI Tracker', action: 'delete', description: 'Remove KPI metric' },

  // Ad Spend & Budget Page (/budget)
  { name: 'View Ad Spend & Budget', code: 'page.budget.view', module: 'Ad Spend & Budget', page: 'Ad Spend & Budget', action: 'view', description: 'View ad spend & budget burn' },
  { name: 'Create Budget Allocation', code: 'page.budget.create', module: 'Ad Spend & Budget', page: 'Ad Spend & Budget', action: 'create', description: 'Add platform ad budget' },
  { name: 'Edit Budget Allocations', code: 'page.budget.edit', module: 'Ad Spend & Budget', page: 'Ad Spend & Budget', action: 'edit', description: 'Update phase ad budgets' },
  { name: 'Delete Budget Entries', code: 'page.budget.delete', module: 'Ad Spend & Budget', page: 'Ad Spend & Budget', action: 'delete', description: 'Remove budget items' },

  // Notifications Page (/notifications)
  { name: 'View Notifications', code: 'page.notifications.view', module: 'Notifications', page: 'Notifications', action: 'view', description: 'Access activity alerts' },
  { name: 'Create Notification', code: 'page.notifications.create', module: 'Notifications', page: 'Notifications', action: 'create', description: 'Send system notification' },
  { name: 'Edit Notification', code: 'page.notifications.edit', module: 'Notifications', page: 'Notifications', action: 'edit', description: 'Mark or edit alert status' },
  { name: 'Delete Notifications', code: 'page.notifications.delete', module: 'Notifications', page: 'Notifications', action: 'delete', description: 'Clear activity alerts' },

  // Settings & Access Page (/settings)
  { name: 'View Settings & Access', code: 'page.settings.view', module: 'Settings & Access', page: 'Settings & Access', action: 'view', description: 'View system roles & RBAC matrix' },
  { name: 'Create Dynamic Roles', code: 'page.settings.create', module: 'Settings & Access', page: 'Settings & Access', action: 'create', description: 'Create new dynamic custom role' },
  { name: 'Edit Roles & Permissions', code: 'page.settings.edit', module: 'Settings & Access', page: 'Settings & Access', action: 'edit', description: 'Update role permissions' },
  { name: 'Delete Custom Roles', code: 'page.settings.delete', module: 'Settings & Access', page: 'Settings & Access', action: 'delete', description: 'Delete dynamic custom roles' },

  // Page Management Page (/admin/pages)
  { name: 'View Page Management', code: 'page.admin.view', module: 'Page Management', page: 'Page Management', action: 'view', description: 'View dynamic page routes' },
  { name: 'Create Page Routes', code: 'page.admin.create', module: 'Page Management', page: 'Page Management', action: 'create', description: 'Add new dynamic route' },
  { name: 'Edit Page Routes', code: 'page.admin.edit', module: 'Page Management', page: 'Page Management', action: 'edit', description: 'Update route settings' },
  { name: 'Delete Page Routes', code: 'page.admin.delete', module: 'Page Management', page: 'Page Management', action: 'delete', description: 'Remove page routes' },
];

const DEFAULT_MENUS = [
  { title: 'Command Center', route: '/dashboard', icon: '☀️', section: 'CAMPAIGN', displayOrder: 1, requiredPermission: 'page.dashboard.view' },
  { title: 'Task Board', route: '/tasks', icon: '📋', section: 'EXECUTION', displayOrder: 2, requiredPermission: 'page.tasks.view' },
  { title: 'Timeline & Phases', route: '/timeline', icon: '⏱️', section: 'EXECUTION', displayOrder: 3, requiredPermission: 'page.timeline.view' },
  { title: 'Contract Scope', route: '/deliverables', icon: '📦', section: 'EXECUTION', displayOrder: 4, requiredPermission: 'page.deliverables.view' },
  { title: 'Approvals Queue', route: '/approvals', icon: '✅', section: 'EXECUTION', displayOrder: 5, requiredPermission: 'page.approvals.view' },
  { title: 'Team Capacity', route: '/team', icon: '👥', section: 'MANAGEMENT', displayOrder: 6, requiredPermission: 'page.team.view' },
  { title: 'KPI Tracker', route: '/kpi', icon: '🎯', section: 'MANAGEMENT', displayOrder: 7, requiredPermission: 'page.kpi.view' },
  { title: 'Ad Spend & Budget', route: '/budget', icon: '💰', section: 'MANAGEMENT', displayOrder: 8, requiredPermission: 'page.budget.view' },
  { title: 'Notifications', route: '/notifications', icon: '🔔', section: 'SYSTEM', displayOrder: 9, requiredPermission: 'page.notifications.view' },
  { title: 'Settings & Access', route: '/settings', icon: '⚙️', section: 'SYSTEM', displayOrder: 10, requiredPermission: 'page.settings.view' },
  { title: 'Page Management', route: '/admin/pages', icon: '📄', section: 'SYSTEM', displayOrder: 11, requiredPermission: 'page.admin.view' },
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
 * Ensures Page-Wise Permissions (4 Standard CRUD Actions per Page), Super Admin, default Menus, and Pages exist in MongoDB on server startup.
 */
export async function ensureSuperAdmin() {
  try {
    // 1. Upsert Page-Wise Permissions (View, Create, Edit, Delete per Page)
    for (const perm of PAGE_WISE_PERMISSIONS) {
      await PermissionModel.updateOne(
        { code: perm.code },
        { $set: perm },
        { upsert: true }
      );
    }
    console.log('[Startup Init] Page-Wise permissions Matrix verified & updated.');

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
    } else {
      await RoleModel.updateOne({ code: 'super_admin' }, { $set: { permissions: ['*'] } });
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

    // 4. Upsert Default Menus with Page View Permissions
    for (const menu of DEFAULT_MENUS) {
      await MenuModel.updateOne(
        { route: menu.route },
        { $set: menu },
        { upsert: true }
      );
    }
    console.log('[Startup Init] Initialized Page-Wise navigation menus.');

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
