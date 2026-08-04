import { Schema, model } from 'mongoose';
import { IUser } from '../types';
import { applyBaseFields } from './baseSchema';

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, select: false },
  short: { type: String, required: true },
  role: { type: String, required: true, index: true },
  roleRef: { type: Schema.Types.ObjectId, ref: 'Role' },
  fn: { type: String, required: true },
  team: { type: String, default: 'core', index: true },
  color: { type: String, default: '#10E784' },
  cap: { type: Number, default: 20 },
  skills: [{ type: String }],
  avatar: { type: String, default: '' },
  reportingManager: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

applyBaseFields(UserSchema);

UserSchema.index({ role: 1, team: 1 });
UserSchema.index({ name: 'text', email: 'text', fn: 'text' });

export const UserModel = model<IUser>('User', UserSchema);
