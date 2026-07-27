import { Schema, model } from 'mongoose';
import { IKPI } from '../types';
import { applyBaseFields } from './baseSchema';

const KPISchema = new Schema<IKPI>({
  kpiId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  unit: { type: String, default: '' },
  agreedMin: { type: Number, required: true },
  agreedMax: { type: Number, required: true },
  dreamMin: { type: Number, required: true },
  dreamMax: { type: Number, required: true },
  current: { type: Number, default: 0 },
  source: { type: String, default: '' },
});

applyBaseFields(KPISchema);

KPISchema.index({ name: 'text' });

export const KPIModel = model<IKPI>('KPI', KPISchema);
