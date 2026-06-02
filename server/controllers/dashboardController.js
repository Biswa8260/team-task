const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    if (req.user.role === 'Admin') {
      // Admin Dashboard statistics
      const totalProjects = await Project.countDocuments({});
      const totalMembers = await User.countDocuments({ role: 'Member' });
      const totalTasks = await Task.countDocuments({});
      
      const completedTasks = await Task.countDocuments({ status: 'Completed' });
      const pendingTasks = await Task.countDocuments({
        status: { $in: ['Todo', 'In Progress'] },
      });
      const overdueTasks = await Task.countDocuments({
        dueDate: { $lt: now },
        status: { $ne: 'Completed' },
      });

      // Get 5 most recent tasks
      const recentTasks = await Task.find({})
        .populate('projectId', 'name')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      // Fetch project progress metrics and task assignees for project status view
      const projects = await Project.find({}).populate('createdBy', 'name');
      const projectProgress = [];

      for (const project of projects) {
        const projectTasks = await Task.find({ projectId: project._id })
          .populate('assignedTo', 'name email')
          .select('title status priority dueDate');
        
        const total = projectTasks.length;
        const completed = projectTasks.filter(t => t.status === 'Completed').length;
        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        projectProgress.push({
          _id: project._id,
          name: project.name,
          createdBy: project.createdBy?.name || 'Admin',
          totalTasks: total,
          completedTasks: completed,
          progress: progressPercentage,
          tasks: projectTasks,
        });
      }

      res.json({
        role: 'Admin',
        stats: {
          totalProjects,
          totalMembers,
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
        },
        recentTasks,
        projectProgress,
      });
    } else {
      // Member Dashboard statistics
      const userId = req.user._id;

      // 1. Only get projects where the user is an accepted member
      const userProjects = await Project.find({ members: userId }).select('_id name description');
      const projectIds = userProjects.map(p => p._id);

      // 2. Count tasks assigned to this user inside accepted projects
      const assignedTasksCount = await Task.countDocuments({ 
        assignedTo: userId, 
        projectId: { $in: projectIds } 
      });
      const completedTasksCount = await Task.countDocuments({
        assignedTo: userId,
        projectId: { $in: projectIds },
        status: 'Completed',
      });
      const pendingTasksCount = await Task.countDocuments({
        assignedTo: userId,
        projectId: { $in: projectIds },
        status: { $in: ['Todo', 'In Progress'] },
      });
      const overdueTasksCount = await Task.countDocuments({
        assignedTo: userId,
        projectId: { $in: projectIds },
        dueDate: { $lt: now },
        status: { $ne: 'Completed' },
      });

      // Upcoming deadlines (tasks due soonest, not completed, in accepted projects)
      const upcomingDeadlines = await Task.find({
        assignedTo: userId,
        projectId: { $in: projectIds },
        status: { $ne: 'Completed' },
      })
        .populate('projectId', 'name')
        .sort({ dueDate: 1 })
        .limit(5);

      res.json({
        role: 'Member',
        stats: {
          assignedTasks: assignedTasksCount,
          completedTasks: completedTasksCount,
          pendingTasks: pendingTasksCount,
          overdueTasks: overdueTasksCount,
        },
        upcomingDeadlines,
        assignedProjects: userProjects, // Include projects listed on Member Dashboard
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
