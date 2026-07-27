import { Schema, model } from 'mongoose';
import { ITask, TaskStatus, TaskPriority, TaskType, TaskPhase } from '../types';
import { applyBaseFields } from './baseSchema';

const TaskSchema = new Schema<ITask>({
  code: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  type: { type: String, enum: Object.values(TaskType), required: true, index: true },
  phase: { type: String, enum: Object.values(TaskPhase), required: true, index: true },
  assignee: { type: String, required: true, index: true },
  reviewer: { type: String, required: true, index: true },
  due: { type: String, required: true, index: true },
  hours: { type: Number, default: 4 },
  deliverable: { type: String, default: null, index: true },
  status: { 
    type: String, 
    enum: Object.values(TaskStatus), 
    default: TaskStatus.ASSIGNED,
    index: true
  },
  priority: { 
    type: String, 
    enum: Object.values(TaskPriority), 
    default: TaskPriority.P2_NORMAL,
    index: true
  },
});

applyBaseFields(TaskSchema);

TaskSchema.index({ assignee: 1, status: 1 });
TaskSchema.index({ phase: 1, status: 1 });
TaskSchema.index({ reviewer: 1, status: 1 });
TaskSchema.index({ title: 'text', desc: 'text', code: 'text' });

export const TaskModel = model<ITask>('Task', TaskSchema);
