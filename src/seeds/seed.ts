import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { RoleModel } from '../models/Role.model';
import { UserModel } from '../models/User.model';
import { PermissionModel } from '../models/Permission.model';
import { PageModel } from '../models/Page.model';
import { MenuModel } from '../models/Menu.model';
import { DeliverableModel } from '../models/Deliverable.model';
import { KPIModel } from '../models/KPI.model';
import { BudgetModel } from '../models/Budget.model';
import { TaskModel } from '../models/Task.model';
import { NotificationModel } from '../models/Notification.model';

dotenv.config();

const SEED_PERMISSIONS = [
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
  { name: 'Manage Website Pages', code: 'pages.manage', module: 'Admin', action: 'manage', description: 'Manage dynamic pages and website route sync' },
];

const SEED_ROLES = [
  { name: 'Super Admin', code: 'super_admin', description: 'Full system access', permissions: ['*'], isSystemRole: true },
  { name: 'Operations Head', code: 'ops_head', description: 'Operations lead access', permissions: ['view_all', 'create_task', 'assign', 'approve', 'edit_task', 'view_budget', 'view_kpi', 'manage_team'], isSystemRole: false },
  { name: 'Team Lead', code: 'team_lead', description: 'Lead member access', permissions: ['view_all', 'create_task', 'assign', 'edit_task', 'submit_review', 'view_kpi'], isSystemRole: false },
  { name: 'Team Member', code: 'member', description: 'Standard member access', permissions: ['view_own', 'update_own', 'submit_review'], isSystemRole: false },
  { name: 'Quality / HR', code: 'qc', description: 'Quality control access', permissions: ['view_all', 'approve', 'flag', 'view_kpi'], isSystemRole: false },
  { name: 'Accounts', code: 'accounts', description: 'Accounts team access', permissions: ['view_budget', 'view_all'], isSystemRole: false }
];

const SEED_MEMBERS = [
  { email: 'anoop@flumenx.com', name: 'Anoop Krishna', short: 'AK', role: 'super_admin', fn: 'Founder / Strategy', team: 'core', color: '#F5A623', cap: 12, skills: ['strategy', 'client', 'approval'] },
  { email: 'anurag@flumenx.com', name: 'Anurag', short: 'AN', role: 'ops_head', fn: 'Operations Head · PCP', team: 'core', color: '#3B82F6', cap: 30, skills: ['ops', 'client', 'coordination'] },
  { email: 'dishun@flumenx.com', name: 'Dishun', short: 'DH', role: 'team_lead', fn: 'Team Lead · Ads & Planning', team: 'alpha', color: '#22D3EE', cap: 26, skills: ['ads', 'planning', 'strategy'] },
  { email: 'shibin@flumenx.com', name: 'Shibin', short: 'SH', role: 'team_lead', fn: 'Team Lead · Digital Marketing', team: 'beta', color: '#A78BFA', cap: 24, skills: ['ads', 'social', 'campaigns'] },
  { email: 'goutham@flumenx.com', name: 'Goutham', short: 'GT', role: 'member', fn: 'Digital Marketing', team: 'beta', color: '#10B981', cap: 28, skills: ['ads', 'reporting', 'social'] },
  { email: 'nikhil@flumenx.com', name: 'Nikhil', short: 'NK', role: 'member', fn: 'Digital Marketing · Creative', team: 'alpha', color: '#F472B6', cap: 22, skills: ['creative', 'copy', 'social'] },
  { email: 'sreejith@flumenx.com', name: 'Sreejith', short: 'SJ', role: 'member', fn: 'Lead Graphic Designer', team: 'design', color: '#FB923C', cap: 26, skills: ['design', 'concept', 'brand'] },
  { email: 'abi@flumenx.com', name: 'Abi', short: 'AB', role: 'member', fn: 'Graphic Designer · Print', team: 'design', color: '#38BDF8', cap: 30, skills: ['design', 'print', 'volume'] },
  { email: 'editor@flumenx.com', name: 'Video Editor', short: 'VE', role: 'member', fn: 'Video Editor · VFX', team: 'video', color: '#E879F9', cap: 26, skills: ['video', 'vfx', 'motion'] },
  { email: 'akhil@flumenx.com', name: 'Akhil', short: 'AL', role: 'member', fn: 'IT Support · Website', team: 'it', color: '#34D399', cap: 22, skills: ['web', 'wordpress', 'tracking'] },
  { email: 'nithin@flumenx.com', name: 'Nithin', short: 'NT', role: 'member', fn: 'IT Support', team: 'it', color: '#2DD4BF', cap: 22, skills: ['web', 'tech', 'support'] },
  { email: 'abison@flumenx.com', name: 'Abison', short: 'AS', role: 'qc', fn: 'HR · Quality & Execution', team: 'core', color: '#818CF8', cap: 18, skills: ['qc', 'coordination'] },
  { email: 'anandhu@flumenx.com', name: 'Anandhu', short: 'AD', role: 'accounts', fn: 'Accounts · Payments', team: 'core', color: '#94A3B8', cap: 10, skills: ['accounts', 'agreements'] }
];

const SEED_DELIVERABLES = [
  { deliverableId: 'd_poster', name: 'Static Design Creatives (Posters)', contracted: 45, unit: 'pieces', type: 'design', note: 'Contract ceiling 45. Bilingual where relevant.' },
  { deliverableId: 'd_vshoot', name: 'Video — On-location Shoots', contracted: 10, unit: 'videos', type: 'video', note: 'Shot on location / at venue' },
  { deliverableId: 'd_vmotion', name: 'Video — Motion Graphics + FX', contracted: 10, unit: 'videos', type: 'video', note: 'Studio-built motion / VFX' },
  { deliverableId: 'd_social', name: 'FB + IG Managed Posts', contracted: 35, unit: 'posts', type: 'ads', note: '30-35 posts across campaign' },
  { deliverableId: 'd_wa', name: 'WhatsApp Broadcasts', contracted: 4, unit: 'blasts', type: 'ops', note: 'To 700+ MNRE member network' },
  { deliverableId: 'd_prereg', name: 'Pre-Registration + Calendar System', contracted: 1, unit: 'system', type: 'it', note: 'Landing page + calendar + reminders' },
  { deliverableId: 'd_seo', name: 'SEO Blog Articles', contracted: 2, unit: 'blogs', type: 'content', note: 'Keyword-targeted, published on site' },
  { deliverableId: 'd_web', name: 'Website Updates + Pixel Setup', contracted: 1, unit: 'setup', type: 'it', note: 'Dates, CTAs, meta tags, GA4, pixel' },
  { deliverableId: 'd_report', name: 'Performance Reports', contracted: 2, unit: 'reports', type: 'ops', note: 'Delivered to Masters leadership' },
  { deliverableId: 'd_cal', name: '73-Day Content Calendar', contracted: 1, unit: 'plan', type: 'ops', note: 'Full campaign plan, approved upfront' }
];

const SEED_KPIS = [
  { kpiId: 'k_foot', name: 'Event Walk-in Footfall', unit: '', agreedMin: 10000, agreedMax: 15000, dreamMin: 15000, dreamMax: 20000, current: 0, source: 'On-site entry count' },
  { kpiId: 'k_lead', name: 'Vendor Stall Leads', unit: '', agreedMin: 50, agreedMax: 75, dreamMin: 80, dreamMax: 120, current: 0, source: 'Meta Lead Centre + WhatsApp' },
  { kpiId: 'k_prereg', name: 'Pre-Registrations', unit: '', agreedMin: 800, agreedMax: 1200, dreamMin: 1500, dreamMax: 2500, current: 0, source: 'Pre-reg system + GA4' },
  { kpiId: 'k_reach', name: 'Total Paid Ad Impressions', unit: '', agreedMin: 100000, agreedMax: 150000, dreamMin: 200000, dreamMax: 300000, current: 0, source: 'Meta + Google Ads Manager' },
  { kpiId: 'k_web', name: 'Website Sessions', unit: '', agreedMin: 4000, agreedMax: 7000, dreamMin: 8000, dreamMax: 12000, current: 0, source: 'Google Analytics 4' },
  { kpiId: 'k_spon', name: 'Sponsor Conversations', unit: '', agreedMin: 2, agreedMax: 4, dreamMin: 5, dreamMax: 8, current: 0, source: 'Masters team + email tracking' }
];

const SEED_BUDGET = [
  { budgetId: 'b_meta', platform: 'Meta Ads (FB + IG)', icon: '📱', total: 180000, spent: 0, color: '#3B82F6', phases: { ph1: 20000, ph2: 50000, ph3: 80000, ph4: 25000, ph5: 5000 } },
  { budgetId: 'b_google', platform: 'Google Ads (Search + Display)', icon: '🔍', total: 70000, spent: 0, color: '#EF4444', phases: { ph1: 8000, ph2: 18000, ph3: 30000, ph4: 12000, ph5: 2000 } }
];

const SEED_TASKS = [
  /* PHASE 1 — IGNITE */
  { code: 'EXP-001', title: 'Expo logo design + brand lockup', type: 'design', phase: 'ph1', assignee: 'u_sreejith', reviewer: 'u_anoop', status: 'published', priority: 'p0', due: '2026-07-22', hours: 8, deliverable: null, desc: 'Primary expo logo, variants, and lockup with Masters identity. Submitted to client group.' },
  { code: 'EXP-002', title: 'Brand kit + social templates (FB/IG)', type: 'design', phase: 'ph1', assignee: 'u_sreejith', reviewer: 'u_anurag', status: 'progress', priority: 'p0', due: '2026-07-26', hours: 10, deliverable: null, desc: 'Master template set so all 45 creatives stay visually consistent. Locked in Canva Pro.' },
  { code: 'EXP-003', title: 'Meta Business Suite setup + pixel verification', type: 'ads', phase: 'ph1', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'approved', priority: 'p0', due: '2026-07-23', hours: 4, deliverable: 'd_web', desc: 'Ad account, pixel fire test, custom conversions, audience seeds. Nothing runs until this is green.' },
  { code: 'EXP-004', title: 'Google Analytics 4 + conversion events', type: 'it', phase: 'ph1', assignee: 'u_akhil', reviewer: 'u_dishun', status: 'review', priority: 'p0', due: '2026-07-24', hours: 5, deliverable: 'd_web', desc: 'GA4 property, registration event, pre-reg click event, UTM convention doc.' },
  { code: 'EXP-005', title: 'Website update — dates, venue, CTAs above fold', type: 'it', phase: 'ph1', assignee: 'u_akhil', reviewer: 'u_anurag', status: 'progress', priority: 'p0', due: '2026-07-27', hours: 6, deliverable: 'd_web', desc: 'expokerala.com currently shows old dates. Highest-priority credibility fix.' },
  { code: 'EXP-006', title: '73-day content calendar — full plan', type: 'ops', phase: 'ph1', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'review', priority: 'p0', due: '2026-07-25', hours: 9, deliverable: 'd_cal', desc: 'Week-by-week content and ad plan for the full campaign. Approved by Masters before Phase 2.' },
  { code: 'EXP-007', title: 'Google Ads account + Search campaign build', type: 'ads', phase: 'ph1', assignee: 'u_shibin', reviewer: 'u_dishun', status: 'progress', priority: 'p1', due: '2026-07-28', hours: 6, deliverable: null, desc: 'Brand + intent keywords. Build documented in shared sheet for team continuity.' },
  { code: 'EXP-008', title: 'Pre-registration landing page build', type: 'it', phase: 'ph1', assignee: 'u_nithin', reviewer: 'u_akhil', status: 'assigned', priority: 'p0', due: '2026-07-30', hours: 10, deliverable: 'd_prereg', desc: 'One-screen page, name + phone, Add-to-Calendar button, data to Sheets. Akhil supervises.' },
  { code: 'EXP-009', title: 'Calendar integration + reminder automation', type: 'it', phase: 'ph1', assignee: 'u_akhil', reviewer: 'u_dishun', status: 'assigned', priority: 'p0', due: '2026-08-01', hours: 7, deliverable: 'd_prereg', desc: 'AddEvent integration, Google/Apple calendar, 3-step reminder chain (7d / 2d / morning).' },
  { code: 'EXP-010', title: 'Save-the-Date creative set (6 pieces)', type: 'design', phase: 'ph1', assignee: 'u_abi', reviewer: 'u_sreejith', status: 'progress', priority: 'p1', due: '2026-07-28', hours: 7, deliverable: 'd_poster', desc: 'FB, IG feed + story sizes. Bilingual (Malayalam + English).' },
  { code: 'EXP-011', title: 'Teaser reel #1 — venue walkthrough (30s)', type: 'video', phase: 'ph1', assignee: 'u_editor', reviewer: 'u_nikhil', status: 'assigned', priority: 'p1', due: '2026-07-30', hours: 8, deliverable: 'd_vshoot', desc: 'Shoot at LuLu Mall. Establishes scale and location credibility.' },
  { code: 'EXP-012', title: 'Campaign copy bank — 30 captions (bilingual)', type: 'content', phase: 'ph1', assignee: 'u_nikhil', reviewer: 'u_dishun', status: 'assigned', priority: 'p1', due: '2026-08-01', hours: 8, deliverable: null, desc: 'Pre-written caption bank so publishing never stalls waiting on copy.' },
  { code: 'EXP-013', title: 'WhatsApp broadcast #1 — stall booking open', type: 'ops', phase: 'ph1', assignee: 'u_goutham', reviewer: 'u_anurag', status: 'assigned', priority: 'p0', due: '2026-07-29', hours: 3, deliverable: 'd_wa', desc: 'To 700+ MNRE members. Highest-conversion channel — must go before paid spend scales.' },
  { code: 'EXP-014', title: 'Facebook awareness campaign — Trivandrum geo', type: 'ads', phase: 'ph1', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'assigned', priority: 'p0', due: '2026-07-31', hours: 5, deliverable: null, desc: 'Families, homeowners, bill >Rs.1500/mo. Rs.20K Phase 1 allocation.' },
  { code: 'EXP-015', title: 'Client agreement + advance invoice', type: 'ops', phase: 'ph1', assignee: 'u_anandhu', reviewer: 'u_anoop', status: 'progress', priority: 'p0', due: '2026-07-24', hours: 3, deliverable: null, desc: '50% advance. Follow up daily until cleared — campaign spend is blocked on this.' },
  { code: 'EXP-016', title: 'Admin access collection from Masters team', type: 'client', phase: 'ph1', assignee: 'u_anurag', reviewer: 'u_anoop', status: 'progress', priority: 'p0', due: '2026-07-23', hours: 2, deliverable: null, desc: 'FB page, IG, LinkedIn, YouTube, GSC, website backend. Blocker for almost everything.' },
  { code: 'EXP-017', title: 'Vendor/speaker content brief request to Masters', type: 'client', phase: 'ph1', assignee: 'u_anurag', reviewer: 'u_anoop', status: 'assigned', priority: 'p1', due: '2026-07-27', hours: 2, deliverable: null, desc: 'Floor plan, confirmed speakers + bios, Year 3 photos, stall pricing.' },

  /* PHASE 2 — AMPLIFY */
  { code: 'EXP-018', title: 'Meta Lead Ads — vendor stall campaign', type: 'ads', phase: 'ph2', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-08-06', hours: 6, deliverable: null, desc: 'Instant form, stall pricing visual, floor plan creative. Primary B2B lead engine.' },
  { code: 'EXP-019', title: 'Pre-registration push campaign live', type: 'ads', phase: 'ph2', assignee: 'u_goutham', reviewer: 'u_dishun', status: 'backlog', priority: 'p0', due: '2026-08-08', hours: 5, deliverable: null, desc: '"Secure your visit + get a reminder" CTA across FB + IG.' },
  { code: 'EXP-020', title: 'Vendor spotlight creative series (8 posters)', type: 'design', phase: 'ph2', assignee: 'u_abi', reviewer: 'u_sreejith', status: 'backlog', priority: 'p1', due: '2026-08-12', hours: 9, deliverable: 'd_poster', desc: 'Year 3 alumni testimonials — ROI they achieved. Social proof for stall sales.' },
  { code: 'EXP-021', title: 'Sector creative series (10 posters)', type: 'design', phase: 'ph2', assignee: 'u_abi', reviewer: 'u_sreejith', status: 'backlog', priority: 'p1', due: '2026-08-20', hours: 11, deliverable: 'd_poster', desc: 'Solar for homes / farms / hotels / factories. Cross-sector relevance.' },
  { code: 'EXP-022', title: 'Hero creative set — family bill angle (6 posters)', type: 'design', phase: 'ph2', assignee: 'u_sreejith', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-08-10', hours: 9, deliverable: 'd_poster', desc: '"Cut your electricity bill" — primary consumer hook. Needs strongest creative treatment.' },
  { code: 'EXP-023', title: 'Reel: electricity bill vs solar (motion)', type: 'video', phase: 'ph2', assignee: 'u_editor', reviewer: 'u_nikhil', status: 'backlog', priority: 'p0', due: '2026-08-11', hours: 9, deliverable: 'd_vmotion', desc: 'Animated cost comparison. Highest expected share rate of the campaign.' },
  { code: 'EXP-024', title: 'Speaker announcement motion series (4 videos)', type: 'video', phase: 'ph2', assignee: 'u_editor', reviewer: 'u_dishun', status: 'backlog', priority: 'p1', due: '2026-08-26', hours: 12, deliverable: 'd_vmotion', desc: 'One per week drop. Template-driven so turnaround stays fast.' },
  { code: 'EXP-025', title: 'Venue + stall setup shoot (2 videos)', type: 'video', phase: 'ph2', assignee: 'u_editor', reviewer: 'u_anurag', status: 'backlog', priority: 'p1', due: '2026-08-22', hours: 9, deliverable: 'd_vshoot', desc: 'On-location at LuLu. Scale and readiness proof for vendors.' },
  { code: 'EXP-026', title: 'WhatsApp broadcast #2 — pre-reg + stall deadline', type: 'ops', phase: 'ph2', assignee: 'u_goutham', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-08-14', hours: 3, deliverable: 'd_wa', desc: 'Pre-registration link + stall booking cut-off date.' },
  { code: 'EXP-027', title: 'Facebook Events campaign — Trivandrum district', type: 'ads', phase: 'ph2', assignee: 'u_shibin', reviewer: 'u_dishun', status: 'backlog', priority: 'p1', due: '2026-08-09', hours: 4, deliverable: null, desc: 'FB Event object + paid promotion. Native RSVP feeds pre-reg count.' },
  { code: 'EXP-028', title: 'Google Display retargeting — all site visitors', type: 'ads', phase: 'ph2', assignee: 'u_shibin', reviewer: 'u_dishun', status: 'backlog', priority: 'p1', due: '2026-08-13', hours: 4, deliverable: null, desc: 'Retarget Phase 1 traffic. Cheapest conversions in the campaign.' },
  { code: 'EXP-029', title: 'SEO blog #1 — Kerala solar buyer guide', type: 'content', phase: 'ph2', assignee: 'u_nikhil', reviewer: 'u_dishun', status: 'backlog', priority: 'p2', due: '2026-08-18', hours: 6, deliverable: 'd_seo', desc: 'Keyword-targeted, published on expokerala.com with internal links to pre-reg.' },
  { code: 'EXP-030', title: 'Print asset pack — badges, standees, signage', type: 'design', phase: 'ph2', assignee: 'u_abi', reviewer: 'u_anurag', status: 'backlog', priority: 'p1', due: '2026-08-28', hours: 10, deliverable: null, desc: 'Print-ready files handed to Masters for production. Long lead time — do not delay.' },
  { code: 'EXP-031', title: 'Mid-campaign performance report #1', type: 'ops', phase: 'ph2', assignee: 'u_goutham', reviewer: 'u_anoop', status: 'backlog', priority: 'p1', due: '2026-08-20', hours: 5, deliverable: 'd_report', desc: 'Spend vs budget, leads, reach, pre-reg count. Delivered to Masters leadership.' },
  { code: 'EXP-032', title: 'Campaign handover documentation pack', type: 'ops', phase: 'ph2', assignee: 'u_shibin', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-08-16', hours: 6, deliverable: null, desc: 'All ad account structures, audiences, and logins documented so any team member can pick up any campaign without ramp-up.' },
  { code: 'EXP-033', title: 'Creative refresh — swap fatigued ad creatives', type: 'design', phase: 'ph2', assignee: 'u_sreejith', reviewer: 'u_dishun', status: 'backlog', priority: 'p1', due: '2026-08-24', hours: 6, deliverable: 'd_poster', desc: 'Replace lowest-CTR creatives. Scheduled refresh prevents mid-campaign decay.' },

  /* PHASE 3 — CONVERT */
  { code: 'EXP-034', title: 'Peak spend reallocation — all platforms', type: 'ads', phase: 'ph3', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-09-02', hours: 5, deliverable: null, desc: 'Rs.1.1L concentrated in this phase. Shift budget to proven ad sets only.' },
  { code: 'EXP-035', title: 'Countdown creative series (12 posters)', type: 'design', phase: 'ph3', assignee: 'u_abi', reviewer: 'u_sreejith', status: 'backlog', priority: 'p0', due: '2026-09-08', hours: 12, deliverable: 'd_poster', desc: '25 / 20 / 15 / 10 / 7 / 5 / 3 / 2 / 1 day countdown + 3 spare. Batch-produced upfront.' },
  { code: 'EXP-036', title: '"Stalls filling fast" urgency campaign', type: 'ads', phase: 'ph3', assignee: 'u_dishun', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-09-05', hours: 4, deliverable: null, desc: 'Scarcity messaging for final vendor conversions.' },
  { code: 'EXP-037', title: 'BTS reel — venue setup (2 videos)', type: 'video', phase: 'ph3', assignee: 'u_editor', reviewer: 'u_nikhil', status: 'backlog', priority: 'p1', due: '2026-09-14', hours: 9, deliverable: 'd_vshoot', desc: 'Build-up footage creates anticipation and proves scale.' },
  { code: 'EXP-038', title: 'Motion graphics pack — seminar + speaker promos (4)', type: 'video', phase: 'ph3', assignee: 'u_editor', reviewer: 'u_dishun', status: 'backlog', priority: 'p1', due: '2026-09-16', hours: 12, deliverable: 'd_vmotion', desc: 'Program schedule, seminar highlights, talk show promos.' },
  { code: 'EXP-039', title: 'Public walk-in registration campaign — max push', type: 'ads', phase: 'ph3', assignee: 'u_goutham', reviewer: 'u_dishun', status: 'backlog', priority: 'p0', due: '2026-09-06', hours: 6, deliverable: null, desc: 'Highest-budget consumer campaign. Free entry + pre-reg reminder hook.' },
  { code: 'EXP-040', title: 'WhatsApp broadcast #3 — final stall call', type: 'ops', phase: 'ph3', assignee: 'u_goutham', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-09-10', hours: 3, deliverable: 'd_wa', desc: '"10 days to close stall bookings" — last B2B conversion push.' },
  { code: 'EXP-041', title: 'SEO blog #2 — what to expect at the expo', type: 'content', phase: 'ph3', assignee: 'u_nikhil', reviewer: 'u_dishun', status: 'backlog', priority: 'p2', due: '2026-09-12', hours: 6, deliverable: 'd_seo', desc: 'Visitor-intent article driving pre-registration clicks.' },
  { code: 'EXP-042', title: 'Pre-reg reminder wave — first automated trigger', type: 'it', phase: 'ph3', assignee: 'u_akhil', reviewer: 'u_dishun', status: 'backlog', priority: 'p0', due: '2026-09-18', hours: 3, deliverable: 'd_prereg', desc: '7-day reminder fires to all pre-registered visitors. Verify delivery rate.' },
  { code: 'EXP-043', title: 'Event-week content batch — pre-schedule everything', type: 'ops', phase: 'ph3', assignee: 'u_goutham', reviewer: 'u_dishun', status: 'backlog', priority: 'p0', due: '2026-09-19', hours: 6, deliverable: null, desc: 'All event-week posts scheduled in advance so the team is free for live coverage.' },
  { code: 'EXP-044', title: 'Quality audit — full creative + campaign review', type: 'ops', phase: 'ph3', assignee: 'u_abison', reviewer: 'u_anoop', status: 'backlog', priority: 'p1', due: '2026-09-15', hours: 5, deliverable: null, desc: 'Verify every contracted deliverable is on track before the final sprint.' },

  /* PHASE 4 — LAST MILE */
  { code: 'EXP-045', title: 'Final 4-day countdown reels (3 videos)', type: 'video', phase: 'ph4', assignee: 'u_editor', reviewer: 'u_nikhil', status: 'backlog', priority: 'p0', due: '2026-09-22', hours: 8, deliverable: 'd_vmotion', desc: '"3 days / Tomorrow / Today" — fast motion edits, pre-built templates.' },
  { code: 'EXP-046', title: 'WhatsApp broadcast #4 — event starts Friday', type: 'ops', phase: 'ph4', assignee: 'u_goutham', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-09-23', hours: 2, deliverable: 'd_wa', desc: 'Final blast. Free entry, timings, venue directions.' },
  { code: 'EXP-047', title: 'Automated calendar reminders — final trigger', type: 'it', phase: 'ph4', assignee: 'u_akhil', reviewer: 'u_dishun', status: 'backlog', priority: 'p0', due: '2026-09-24', hours: 2, deliverable: 'd_prereg', desc: '2-day and morning-of reminders fire to full pre-reg list.' },
  { code: 'EXP-048', title: 'Budget burn-down — spend every remaining rupee', type: 'ads', phase: 'ph4', assignee: 'u_dishun', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-09-24', hours: 4, deliverable: null, desc: 'No unspent ad budget at event start. Shift all to top-performing sets.' },
  { code: 'EXP-049', title: 'Event-day logistics + team roster confirm', type: 'ops', phase: 'ph4', assignee: 'u_anurag', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-09-23', hours: 3, deliverable: null, desc: 'Who is on floor which day, shift timings, equipment, client contact protocol.' },

  /* PHASE 5 — LIVE + POST */
  { code: 'EXP-050', title: 'Day 1 — live stories + same-day recap reel', type: 'video', phase: 'ph5', assignee: 'u_editor', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-09-25', hours: 8, deliverable: 'd_vshoot', desc: 'Shoot through the day, edit and publish by evening.' },
  { code: 'EXP-051', title: 'Day 2 — live stories + same-day recap reel', type: 'video', phase: 'ph5', assignee: 'u_editor', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-09-26', hours: 8, deliverable: 'd_vshoot', desc: 'Peak footfall day. Capture crowd density for social proof.' },
  { code: 'EXP-052', title: 'Day 3 — live stories + closing recap reel', type: 'video', phase: 'ph5', assignee: 'u_editor', reviewer: 'u_anurag', status: 'backlog', priority: 'p0', due: '2026-09-27', hours: 8, deliverable: 'd_vshoot', desc: 'Final day, closing ceremony, winner announcements.' },
  { code: 'EXP-053', title: 'Live social coverage — all 3 days', type: 'ads', phase: 'ph5', assignee: 'u_goutham', reviewer: 'u_dishun', status: 'backlog', priority: 'p0', due: '2026-09-27', hours: 12, deliverable: 'd_social', desc: 'Real-time stories, floor posts, engagement handling across FB + IG.' },
  { code: 'EXP-054', title: 'Footfall + lead data capture (all 3 days)', type: 'ops', phase: 'ph5', assignee: 'u_anurag', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-09-27', hours: 6, deliverable: null, desc: 'Actual entry counts, vendor feedback, sponsor conversations. Feeds the final report.' },
  { code: 'EXP-055', title: 'Testimonial capture — vendors + visitors', type: 'video', phase: 'ph5', assignee: 'u_editor', reviewer: 'u_anurag', status: 'backlog', priority: 'p1', due: '2026-09-27', hours: 5, deliverable: null, desc: 'Raw clips for Year 5 campaign assets. Capture on Day 2 when energy is highest.' },
  { code: 'EXP-056', title: 'Post-event success posts (4 creatives)', type: 'design', phase: 'ph5', assignee: 'u_abi', reviewer: 'u_sreejith', status: 'backlog', priority: 'p1', due: '2026-09-29', hours: 5, deliverable: 'd_poster', desc: 'Footfall achieved, thank-you, highlights carousel. Published within 48 hours.' },
  { code: 'EXP-057', title: 'Final campaign report + ROI summary', type: 'ops', phase: 'ph5', assignee: 'u_goutham', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-09-29', hours: 7, deliverable: 'd_report', desc: 'Full actual-vs-target. Spend, leads, reach, footfall, pre-reg conversion.' },
  { code: 'EXP-058', title: 'Year 5 asset vault handover', type: 'ops', phase: 'ph5', assignee: 'u_abison', reviewer: 'u_anoop', status: 'backlog', priority: 'p1', due: '2026-09-29', hours: 4, deliverable: null, desc: 'Organised folder: all creatives, raw footage, testimonials, reports. Reusable next year.' },
  { code: 'EXP-059', title: 'Final invoice + project closure', type: 'ops', phase: 'ph5', assignee: 'u_anandhu', reviewer: 'u_anoop', status: 'backlog', priority: 'p0', due: '2026-09-29', hours: 2, deliverable: null, desc: 'Balance 50% invoice raised on delivery of final report.' }
];

const SEED_NOTIFS = [
  { type: 'approval', title: 'Approval needed', msg: 'GA4 + conversion events (EXP-004) submitted for review by Akhil', user: 'u_dishun', ts: new Date(Date.now() - 1000 * 60 * 42), read: false },
  { type: 'approval', title: 'Approval needed', msg: '73-day content calendar (EXP-006) submitted for your approval by Dishun', user: 'u_anoop', ts: new Date(Date.now() - 1000 * 60 * 95), read: false },
  { type: 'done', title: 'Task published', msg: 'Expo logo design (EXP-001) published and shared to Masters client group', user: 'u_anoop', ts: new Date(Date.now() - 1000 * 60 * 60 * 5), read: true },
  { type: 'blocked', title: 'Blocker flagged', msg: 'Admin access (EXP-016) still pending from Masters — blocking 6 downstream tasks', user: 'u_anoop', ts: new Date(Date.now() - 1000 * 60 * 60 * 8), read: false },
  { type: 'assign', title: 'New assignment', msg: 'Pre-registration landing page (EXP-008) assigned to Nithin, supervised by Akhil', user: 'u_nithin', ts: new Date(Date.now() - 1000 * 60 * 60 * 11), read: true }
];

const SEED_PAGES = [
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

async function seed() {
  await connectDB();
  console.log('[Seed] Starting database seeding...');

  // Clear existing collections
  await Promise.all([
    RoleModel.deleteMany({}),
    UserModel.deleteMany({}),
    PermissionModel.deleteMany({}),
    PageModel.deleteMany({}),
    MenuModel.deleteMany({}),
    DeliverableModel.deleteMany({}),
    KPIModel.deleteMany({}),
    BudgetModel.deleteMany({}),
    TaskModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  // Seed Permissions
  console.log('[Seed] Seeding Permissions...');
  await PermissionModel.insertMany(SEED_PERMISSIONS);

  // Seed Roles
  console.log('[Seed] Seeding Roles...');
  const roleDocs = await RoleModel.insertMany(SEED_ROLES);
  const superAdminRole = roleDocs.find(r => r.code === 'super_admin');

  // Seed Default Admin & Users
  console.log('[Seed] Seeding Team Members...');
  const defaultPasswordHash = await bcrypt.hash('Admin@123456', 10);
  
  for (const m of SEED_MEMBERS) {
    const roleDoc = roleDocs.find(r => r.code === m.role) || superAdminRole;
    await UserModel.create({
      ...m,
      email: m.email,
      password: defaultPasswordHash,
      roleRef: roleDoc?._id,
    });
  }

  // Seed Pages
  console.log('[Seed] Seeding Pages...');
  await PageModel.insertMany(SEED_PAGES);

  // Seed Menus
  console.log('[Seed] Seeding Menus...');
  await MenuModel.insertMany([
    { title: 'Command Center', route: '/dashboard', icon: '📊', section: 'CAMPAIGN', displayOrder: 1, requiredPermission: 'view_all' },
    { title: 'Task Board', route: '/tasks', icon: '📋', section: 'EXECUTION', displayOrder: 2, requiredPermission: 'view_all' },
    { title: 'Timeline & Phases', route: '/timeline', icon: '⏱️', section: 'EXECUTION', displayOrder: 3, requiredPermission: 'view_all' },
    { title: 'Contract Scope', route: '/deliverables', icon: '📦', section: 'EXECUTION', displayOrder: 4, requiredPermission: 'view_all' },
    { title: 'Approvals Queue', route: '/approvals', icon: '✅', section: 'EXECUTION', displayOrder: 5, requiredPermission: 'approve' },
    { title: 'Team Capacity', route: '/team', icon: '👥', section: 'MANAGEMENT', displayOrder: 6, requiredPermission: 'view_all' },
    { title: 'KPI Tracker', route: '/kpi', icon: '🎯', section: 'MANAGEMENT', displayOrder: 7, requiredPermission: 'view_kpi' },
    { title: 'Ad Spend & Budget', route: '/budget', icon: '💰', section: 'MANAGEMENT', displayOrder: 8, requiredPermission: 'view_budget' },
    { title: 'Notifications', route: '/notifications', icon: '🔔', section: 'SYSTEM', displayOrder: 9 },
    { title: 'Settings & Access', route: '/settings', icon: '⚙️', section: 'SYSTEM', displayOrder: 10, requiredPermission: 'manage_team' },
  ]);

  // Seed Deliverables, KPIs, Budget, Tasks, Notifications
  console.log('[Seed] Seeding Deliverables, KPIs, Budget, Tasks, Notifications...');
  await DeliverableModel.insertMany(SEED_DELIVERABLES);
  await KPIModel.insertMany(SEED_KPIS);
  await BudgetModel.insertMany(SEED_BUDGET);
  await TaskModel.insertMany(SEED_TASKS);
  await NotificationModel.insertMany(SEED_NOTIFS);

  console.log('[Seed] Database seeding complete! All permissions, roles, 59 tasks and notifications seeded.');
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});
