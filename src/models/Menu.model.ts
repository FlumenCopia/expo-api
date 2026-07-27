import { Schema, model } from 'mongoose';
import { IMenu } from '../types';
import { applyBaseFields } from './baseSchema';

const MenuSchema = new Schema<IMenu>({
  title: { type: String, required: true },
  route: { type: String, required: true, index: true },
  icon: { type: String, default: '' },
  section: { type: String, default: 'MAIN', index: true },
  displayOrder: { type: Number, default: 0 },
  requiredPermission: { type: String, default: null },
  parentId: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
});

applyBaseFields(MenuSchema);

MenuSchema.index({ section: 1, displayOrder: 1 });

export const MenuModel = model<IMenu>('Menu', MenuSchema);
