import { Schema, model } from 'mongoose';
import { INotification } from '../types';
import { applyBaseFields } from './baseSchema';

const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    enum: ['approval', 'done', 'blocked', 'assign', 'budget'], 
    required: true,
    index: true
  },
  title: { type: String, required: true },
  msg: { type: String, required: true },
  user: { type: String, required: true, index: true },
  read: { type: Boolean, default: false, index: true },
  ts: { type: Date, default: Date.now, index: true },
});

applyBaseFields(NotificationSchema);

NotificationSchema.index({ user: 1, read: 1, ts: -1 });

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
