import { Schema, model } from 'mongoose';
import { IPermission } from '../types';
import { applyBaseFields } from './baseSchema';

const PermissionSchema = new Schema<IPermission>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, index: true },
  module: { type: String, required: true, index: true },
  page: { type: String, default: null },
  action: { type: String, required: true },
  description: { type: String, default: '' },
});

applyBaseFields(PermissionSchema);

PermissionSchema.index({ module: 1, action: 1 });
PermissionSchema.index({ name: 'text', description: 'text' });

export const PermissionModel = model<IPermission>('Permission', PermissionSchema);
