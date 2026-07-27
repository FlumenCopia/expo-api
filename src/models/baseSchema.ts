import { Schema } from 'mongoose';

export const applyBaseFields = (schema: Schema) => {
  schema.add({
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.Mixed, default: null },
    updatedBy: { type: Schema.Types.Mixed, default: null },
    deletedBy: { type: Schema.Types.Mixed, default: null },
  });

  schema.set('timestamps', true);

  // Soft delete query helper
  schema.pre('find', function() {
    if (this.getFilter().isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  });

  schema.pre('findOne', function() {
    if (this.getFilter().isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  });
};
