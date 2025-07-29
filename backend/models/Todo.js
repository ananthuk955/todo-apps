const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  dueDate: {
    type: Date
  },
  // User who created the todo
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User who is assigned to complete the todo (can be self or another user)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Notes for assignment (optional message when assigning to someone)
  assignmentNote: {
    type: String,
    trim: true,
    maxlength: 200
  },
  // Track when assignment was made
  assignedAt: {
    type: Date,
    default: Date.now
  },
  // Track status changes
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'completed']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
todoSchema.index({ createdBy: 1, createdAt: -1 });
todoSchema.index({ assignedTo: 1, createdAt: -1 });
todoSchema.index({ status: 1, dueDate: 1 });

// Pre-save middleware to handle status changes
todoSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Track status history
    this.statusHistory.push({
      status: this.status,
      changedBy: this.assignedTo, // You might want to pass the actual user making the change
      changedAt: new Date()
    });
    
    // Set completedAt when status changes to completed
    if (this.status === 'completed') {
      this.completedAt = new Date();
    } else if (this.status === 'pending') {
      this.completedAt = null;
    }
  }
  next();
});

// Instance method to check if user can modify this todo
todoSchema.methods.canModify = function(userId) {
  return this.createdBy.toString() === userId.toString() || 
         this.assignedTo.toString() === userId.toString();
};

// Static method to get todos for dashboard
todoSchema.statics.getDashboardData = async function(userId) {
  const [assignedByMe, assignedToMe] = await Promise.all([
    // Tasks I created/assigned to others
    this.find({ createdBy: userId })
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 }),
    
    // Tasks assigned to me
    this.find({ assignedTo: userId })
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
  ]);
  
  return { assignedByMe, assignedToMe };
};

module.exports = mongoose.model('Todo', todoSchema);