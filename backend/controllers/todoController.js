const Todo = require('../models/Todo');
const User = require('../models/User');

// Get dashboard data with grouped todos
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { assignedByMe, assignedToMe } = await Todo.getDashboardData(userId);
    
    // Calculate statistics
    const stats = {
      totalCreated: assignedByMe.length,
      totalAssigned: assignedToMe.length,
      completedByMe: assignedToMe.filter(t => t.status === 'completed').length,
      pendingByMe: assignedToMe.filter(t => t.status === 'pending').length,
      completedAssignedByMe: assignedByMe.filter(t => t.status === 'completed').length,
      pendingAssignedByMe: assignedByMe.filter(t => t.status === 'pending').length
    };
    
    res.json({ 
      success: true, 
      data: {
        assignedByMe,
        assignedToMe,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all todos for authenticated user (legacy endpoint - keep for compatibility)
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ 
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    })
    .populate('assignedTo', 'username email')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });
    
    res.json({ success: true, todos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new todo
const createTodo = async (req, res) => {
  try {
    const { title, description, assignedTo, assignmentNote, priority, category, dueDate } = req.body;
    
    // Validate assigned user exists
    let assignedUser = req.user._id; // Default to self
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      assignedUser = assignedTo;
    }
    
    const todo = await Todo.create({
      title,
      description,
      createdBy: req.user._id,
      assignedTo: assignedUser,
      assignmentNote: assignedTo !== req.user._id.toString() ? assignmentNote : undefined,
      priority: priority || 'medium',
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    // Populate the created todo
    await todo.populate([
      { path: 'assignedTo', select: 'username email' },
      { path: 'createdBy', select: 'username email' }
    ]);

    res.status(201).json({ success: true, todo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the todo first
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user can modify this todo
    if (!todo.canModify(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to modify this todo' });
    }

    // If reassigning to another user, validate the user exists
    if (updateData.assignedTo && updateData.assignedTo !== todo.assignedTo.toString()) {
      const user = await User.findById(updateData.assignedTo);
      if (!user) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      updateData.assignedAt = new Date();
    }

    // Update the todo
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedTo', select: 'username email' },
      { path: 'createdBy', select: 'username email' }
    ]);

    res.json({ success: true, todo: updatedTodo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Only creator can delete the todo
    if (todo.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete this todo' });
    }

    await Todo.findByIdAndDelete(id);
    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users for assignment
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email')
    .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get todo analytics/timeline
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get todos created in the period
    const todos = await Todo.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ],
      createdAt: { $gte: startDate }
    })
    .populate('assignedTo', 'username email')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });

    // Group by date for timeline
    const timeline = {};
    todos.forEach(todo => {
      const dateKey = todo.createdAt.toISOString().split('T')[0];
      if (!timeline[dateKey]) {
        timeline[dateKey] = [];
      }
      timeline[dateKey].push(todo);
    });

    // Calculate completion rate
    const completedCount = todos.filter(t => t.status === 'completed').length;
    const completionRate = todos.length > 0 ? (completedCount / todos.length * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        timeline,
        stats: {
          totalTodos: todos.length,
          completed: completedCount,
          pending: todos.length - completedCount,
          completionRate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  searchUsers,
  getAnalytics
};