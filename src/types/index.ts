import { Document, Types } from 'mongoose';

/* ENUMS BASED ON CAMPAIGN COMMAND CENTER DATA */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPS_HEAD = 'ops_head',
  TEAM_LEAD = 'team_lead',
  MEMBER = 'member',
  QC = 'qc',
  ACCOUNTS = 'accounts',
  CLIENT = 'client',
}

export enum TaskPhase {
  PH1_IGNITE = 'ph1',
  PH2_AMPLIFY = 'ph2',
  PH3_CONVERT = 'ph3',
  PH4_LAST_MILE = 'ph4',
  PH5_LIVE_POST = 'ph5',
}

export enum TaskType {
  DESIGN = 'design',
  VIDEO = 'video',
  ADS = 'ads',
  IT_WEB = 'it',
  CONTENT = 'content',
  OPS = 'ops',
  CLIENT = 'client',
}

export enum TaskPriority {
  P0_CRITICAL = 'p0',
  P1_HIGH = 'p1',
  P2_NORMAL = 'p2',
  P3_LOW = 'p3',
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'progress',
  IN_REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
}

export enum DeliverableType {
  DESIGN = 'design',
  VIDEO = 'video',
  ADS = 'ads',
  OPS = 'ops',
  IT = 'it',
  CONTENT = 'content',
}

export interface IBaseDocument extends Document {
  isActive: boolean;
  isDeleted: boolean;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  deletedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermission extends IBaseDocument {
  name: string;
  code: string;
  module: string;
  page?: string;
  action: string;
  description?: string;
}

export interface IRole extends IBaseDocument {
  name: string;
  code: UserRole | string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
}

export interface IUser extends IBaseDocument {
  name: string;
  email: string;
  password?: string;
  short: string;
  role: UserRole | string;
  roleRef?: Types.ObjectId;
  fn: string;
  team: string;
  color: string;
  cap: number;
  skills: string[];
  avatar?: string;
  reportingManager?: Types.ObjectId;
}

export interface IPage extends IBaseDocument {
  title: string;
  route: string;
  icon?: string;
  module: string;
  parentMenu?: string;
  layout?: string;
  displayOrder: number;
  isHidden: boolean;
  isPublic: boolean;
}

export interface IMenu extends IBaseDocument {
  title: string;
  route: string;
  icon?: string;
  section: string;
  displayOrder: number;
  requiredPermission?: string;
  parentId?: Types.ObjectId;
}

export interface ITask extends IBaseDocument {
  code: string;
  title: string;
  desc?: string;
  type: TaskType | string;
  phase: TaskPhase | string;
  assignee: string;
  reviewer: string;
  due: string;
  hours: number;
  deliverable?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface IDeliverable extends IBaseDocument {
  deliverableId: string;
  name: string;
  contracted: number;
  unit: string;
  type: DeliverableType | string;
  note?: string;
}

export interface IKPI extends IBaseDocument {
  kpiId: string;
  name: string;
  unit: string;
  agreedMin: number;
  agreedMax: number;
  dreamMin: number;
  dreamMax: number;
  current: number;
  source: string;
}

export interface IBudget extends IBaseDocument {
  budgetId: string;
  platform: string;
  icon: string;
  total: number;
  spent: number;
  color: string;
  phases: Record<string, number>;
}

export interface INotification extends IBaseDocument {
  type: 'approval' | 'done' | 'blocked' | 'assign' | 'budget';
  title: string;
  msg: string;
  user: string;
  read: boolean;
  ts: Date;
}

export interface IAuditLog extends IBaseDocument {
  user?: string;
  userName?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}
