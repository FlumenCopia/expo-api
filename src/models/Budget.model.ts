import { Schema, model } from 'mongoose';
import { IBudget } from '../types';
import { applyBaseFields } from './baseSchema';

const BudgetSchema = new Schema<IBudget>({
  budgetId: { type: String, required: true, unique: true, index: true },
  platform: { type: String, required: true },
  icon: { type: String, default: '' },
  total: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  color: { type: String, default: '#3B82F6' },
  phases: { type: Map, of: Number, default: {} },
});

applyBaseFields(BudgetSchema);

export const BudgetModel = model<IBudget>('Budget', BudgetSchema);
