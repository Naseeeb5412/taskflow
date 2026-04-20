import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    label: {
      type: String,
      enum: ['bug', 'feature', 'improvement', 'documentation', 'design', ''],
      default: '',
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    activity: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

taskSchema.index({ list: 1, order: 1 });
taskSchema.index({ board: 1 });

export default mongoose.model('Task', taskSchema);
