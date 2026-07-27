import { Schema, model } from 'mongoose';
import { IPage } from '../types';
import { applyBaseFields } from './baseSchema';

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  route: { type: String, required: true, unique: true, index: true },
  icon: { type: String, default: '' },
  module: { type: String, required: true, index: true },
  parentMenu: { type: String, default: null },
  layout: { type: String, default: 'default' },
  displayOrder: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
});

applyBaseFields(PageSchema);

PageSchema.index({ module: 1, displayOrder: 1 });
PageSchema.index({ route: 1, isHidden: 1 });

export const PageModel = model<IPage>('Page', PageSchema);
