const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all tasks (with filters & search)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, search, assignedTo } = req.query;
    const query = {};

    // 1. Role-based scoping
    if (req.user.role === 'Admin') {
      // Admin can search all tasks
      if (projectId) query.projectId = projectId;
      if (assignedTo) query.assignedTo = assignedTo;
    } else {
      // Members can only see tasks of projects they are members of
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map((p) => p._id);

      if (projectId) {
        // Verify member belongs to requested project
        if (!projectIds.some((id) => id.toString() === projectId.toString())) {
          res.status(403);
          throw new Error('Not authorized to view tasks for this project');
        }
        query.projectId = projectId;
      } else {
        query.projectId = { $in: projectIds };
      }

      if (assignedTo) {
        // Members can query for tasks assigned to users, but only within their accessible projects
        query.assignedTo = assignedTo;
      }
    }

    // 2. Additional Filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // 3. Search logic (matches title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 }); // Sort by due date (closest first)

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'name members')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Role-based authorization
    if (req.user.role !== 'Admin') {
      // Check if Member is in the task's project members
      const project = task.projectId;
      if (!project.members.some((m) => m.toString() === req.user._id.toString())) {
        res.status(403);
        throw new Error('Not authorized to view this task');
      }
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Verify assigned user exists
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      res.status(404);
      throw new Error('Assigned user not found');
    }

    // Optional but good: Verify assigned user is a member of the project
    if (!project.members.includes(assignedTo)) {
      res.status(400);
      throw new Error('Assigned user is not a member of this project');
    }

    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();

    const populatedTask = await Task.findById(createdTask._id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.user.role === 'Admin') {
      // Admin has complete update control
      if (projectId && projectId !== task.projectId.toString()) {
        const project = await Project.findById(projectId);
        if (!project) {
          res.status(404);
          throw new Error('Project not found');
        }
        task.projectId = projectId;
      }

      if (assignedTo && assignedTo !== task.assignedTo.toString()) {
        const assignee = await User.findById(assignedTo);
        if (!assignee) {
          res.status(404);
          throw new Error('Assigned user not found');
        }
        
        // Ensure assignee is member of project
        const projId = projectId || task.projectId;
        const project = await Project.findById(projId);
        if (project && !project.members.includes(assignedTo)) {
          res.status(400);
          throw new Error('Assigned user is not a member of this project');
        }
        task.assignedTo = assignedTo;
      }

      task.title = title || task.title;
      task.description = description || task.description;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
    } else {
      // Member can ONLY update own task status
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this task status');
      }

      if (status) {
        task.status = status;
      } else {
        res.status(400);
        throw new Error('Members can only update task status');
      }
    }

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
