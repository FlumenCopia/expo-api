import { Schema, model } from 'mongoose';
import { IDeliverable, DeliverableType } from '../types';
import { applyBaseFields } from './baseSchema';

const DeliverableSchema = new Schema<IDeliverable>({
  deliverableId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  contracted: { type: Number, required: true },
  unit: { type: String, required: true },
  type: { type: String, enum: Object.values(DeliverableType), required: true, index: true },
  note: { type: String, default: '' },
});

applyBaseFields(DeliverableSchema);

DeliverableSchema.index({ name: 'text' });

export const DeliverableModel = model<IDeliverable>('Deliverable', DeliverableSchema);
