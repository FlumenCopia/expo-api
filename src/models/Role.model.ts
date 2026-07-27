import { Schema, model } from 'mongoose';
import { IRole } from '../types';
import { applyBaseFields } from './baseSchema';

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  permissions: [{ type: String }],
  isSystemRole: { type: Boolean, default: false },
});

applyBaseFields(RoleSchema);

RoleSchema.index({ name: 1 });
RoleSchema.index({ isSystemRole: 1 });

export const RoleModel = model<IRole>('Role', RoleSchema);
