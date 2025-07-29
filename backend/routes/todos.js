// routes/todos.js
const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  searchUsers,
  getAnalytics
} = require('../controllers/todoController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Dashboard and analytics routes
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// User search for assignment
router.get('/users/search', searchUsers);

// CRUD routes
router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;