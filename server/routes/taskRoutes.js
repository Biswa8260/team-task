const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validateTask } = require('../middleware/validationMiddleware');

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, admin, validateTask, createTask);

router
  .route('/:id')
  .get(protect, getTaskById)
  .put(protect, protect, updateTask) // Update access checking is handled within the controller
  .delete(protect, admin, deleteTask);

module.exports = router;
