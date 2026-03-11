import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignedUser {
  userId: string;
  name: string;
  role: 'manager' | 'supervisor';
  assignedAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

export interface IHourlyUpdate {
  id: string;
  timestamp: Date;
  content: string;
  submittedBy: string;
  submittedByName: string;
}

export interface IAttachment {
  id: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
}

export interface IAssignTask extends Document {
  taskTitle: string;
  description: string;
  startDate: Date;
  endDate: Date;
  dueDateTime: Date;
  priority: 'high' | 'medium' | 'low';
  taskType: string;
  siteId: string;
  siteName: string;
  siteLocation: string;
  clientName: string;
  assignedManagers: IAssignedUser[];
  assignedSupervisors: IAssignedUser[];
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  hourlyUpdates: IHourlyUpdate[];
  attachments: IAttachment[];
  completionNotes?: string;
  completionPercentage: number;
}

const AssignedUserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['manager', 'supervisor'],
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { _id: false });

const HourlyUpdateSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: true
  },
  submittedBy: {
    type: String,
    required: true
  },
  submittedByName: {
    type: String,
    required: true
  }
}, { _id: false });

const AttachmentSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedByName: {
    type: String,
    required: true
  }
}, { _id: false });

const AssignTaskSchema = new Schema({
  taskTitle: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value: Date) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'Invalid start date'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value: Date) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'Invalid end date'
    }
  },
  dueDateTime: {
    type: Date,
    required: [true, 'Due date and time is required'],
    validate: {
      validator: function(value: Date) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'Invalid due date and time'
    }
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    required: true
  },
  taskType: {
    type: String,
    enum: ['inspection', 'maintenance', 'training', 'audit', 'emergency', 'safety', 'equipment', 'routine', 'other'],
    default: 'routine',
    required: true
  },
  siteId: {
    type: String,
    required: [true, 'Site ID is required'],
    trim: true
  },
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true
  },
  siteLocation: {
    type: String,
    required: [true, 'Site location is required'],
    trim: true
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  assignedManagers: {
    type: [AssignedUserSchema],
    default: []
  },
  assignedSupervisors: {
    type: [AssignedUserSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },
  createdBy: {
    type: String,
    required: [true, 'Creator ID is required'],
    trim: true
  },
  createdByName: {
    type: String,
    required: [true, 'Creator name is required'],
    trim: true
  },
  hourlyUpdates: {
    type: [HourlyUpdateSchema],
    default: []
  },
  attachments: {
    type: [AttachmentSchema],
    default: []
  },
  completionNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Completion notes cannot exceed 2000 characters']
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
AssignTaskSchema.virtual('isOverdue').get(function(this: IAssignTask) {
  return this.status !== 'completed' && this.dueDateTime < new Date();
});

// Virtual for days until due
AssignTaskSchema.virtual('daysUntilDue').get(function(this: IAssignTask) {
  const now = new Date();
  const dueDate = new Date(this.dueDateTime);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for better query performance
AssignTaskSchema.index({ siteId: 1 });
AssignTaskSchema.index({ status: 1 });
AssignTaskSchema.index({ priority: 1 });
AssignTaskSchema.index({ dueDateTime: 1 });
AssignTaskSchema.index({ 'assignedManagers.userId': 1 });
AssignTaskSchema.index({ 'assignedSupervisors.userId': 1 });
AssignTaskSchema.index({ createdBy: 1 });
AssignTaskSchema.index({ createdAt: -1 });

// Pre-save middleware to validate dates
AssignTaskSchema.pre('save', function(next) {
  // Validate that end date is after start date
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Validate that due date is after end date
  if (this.dueDateTime < this.endDate) {
    next(new Error('Due date must be after end date'));
  }
  
  next();
});

// Pre-save middleware to update completion percentage based on user statuses
AssignTaskSchema.pre('save', function(next) {
  const allUsers = [...this.assignedManagers, ...this.assignedSupervisors];
  
  if (allUsers.length > 0) {
    const completedCount = allUsers.filter(u => u.status === 'completed').length;
    this.completionPercentage = Math.round((completedCount / allUsers.length) * 100);
  }
  
  next();
});

export default mongoose.model<IAssignTask>('AssignTask', AssignTaskSchema);