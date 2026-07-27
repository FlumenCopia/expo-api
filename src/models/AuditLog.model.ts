import { Schema, model } from 'mongoose';
import { IAuditLog } from '../types';
import { applyBaseFields } from './baseSchema';

const AuditLogSchema = new Schema<IAuditLog>({
  user: { type: String, default: null, index: true },
  userName: { type: String, default: null },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  details: { type: Schema.Types.Mixed, default: {} },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
});

applyBaseFields(AuditLogSchema);

AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);
