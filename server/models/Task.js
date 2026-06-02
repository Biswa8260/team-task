const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [150, 'Task title cannot be more than 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a task description'],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed'],
      default: 'Todo',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
