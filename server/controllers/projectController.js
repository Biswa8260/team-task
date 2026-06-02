const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      // Admins see all projects
      projects = await Project.find({})
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .populate('pendingMembers', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      // Members see only projects they are added to
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .populate('pendingMembers', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .populate('pendingMembers', 'name email role');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Access control: Admin can access, Member only if they belong to it (either pending or accepted)
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isPending = project.pendingMembers.some((m) => m._id.toString() === req.user._id.toString());

    if (req.user.role !== 'Admin' && !isMember && !isPending) {
      res.status(403);
      throw new Error('Not authorized to view this project');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    const project = new Project({
      name,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const createdProject = await project.save();
    
    // Populate before sending back
    const populatedProject = await Project.findById(createdProject._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .populate('pendingMembers', 'name email role');

    res.status(201).json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project.name = name || project.name;
    project.description = description || project.description;
    
    if (members) {
      project.members = members;
    }

    const updatedProject = await project.save();
    
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .populate('pendingMembers', 'name email role');

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Cascade delete: delete all tasks in the project
    await Task.deleteMany({ projectId: req.params.id });

    // Use deleteOne instead of remove (since model.remove is deprecated in mongoose 6+)
    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project and all associated tasks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project members (and send invitations to new members)
// @route   PUT /api/projects/:id/members
// @access  Private/Admin
const updateProjectMembers = async (req, res, next) => {
  try {
    const { members } = req.body; // Array of User IDs (both existing and new)

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Ensure member IDs are valid user accounts in DB
    if (members && members.length > 0) {
      const validUsersCount = await User.countDocuments({ _id: { $in: members } });
      if (validUsersCount !== members.length) {
        res.status(400);
        throw new Error('One or more user IDs are invalid');
      }
    }

    const currentMembers = project.members.map(m => m.toString());
    const currentPending = project.pendingMembers.map(m => m.toString());

    // 1. Identify users to keep (still checked)
    const updatedMembers = currentMembers.filter(m => members.includes(m));
    const updatedPending = currentPending.filter(m => members.includes(m));

    // 2. Identify newly checked users (not in members and not in pending)
    const newInvites = members.filter(m => !currentMembers.includes(m) && !currentPending.includes(m));

    // 3. For new invites: add to pendingMembers and create an Invitation notification
    for (const userId of newInvites) {
      updatedPending.push(userId);
      await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: 'Invitation',
        project: project._id,
        status: 'Pending',
        message: `${req.user.name} has assigned you to project: ${project.name}`,
      });
    }

    project.members = updatedMembers;
    project.pendingMembers = updatedPending;
    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .populate('pendingMembers', 'name email role');

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to project invitation
// @route   POST /api/projects/:id/invitation-response
// @access  Private
const respondToInvitation = async (req, res, next) => {
  try {
    const { status, notificationId } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Status must be Accepted or Rejected');
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const invitation = await Notification.findById(notificationId);
    if (!invitation) {
      res.status(404);
      throw new Error('Invitation record not found');
    }

    const userId = req.user._id.toString();

    // Verify user is in pendingMembers
    const isPending = project.pendingMembers.some(m => m.toString() === userId);
    if (!isPending) {
      res.status(400);
      throw new Error('User is not a pending member of this project');
    }

    // Remove from pendingMembers
    project.pendingMembers = project.pendingMembers.filter(m => m.toString() !== userId);

    if (status === 'Accepted') {
      project.members.push(req.user._id);
      invitation.status = 'Accepted';
    } else {
      invitation.status = 'Rejected';
    }

    await project.save();
    await invitation.save();

    // Send response notification back to the Admin who sent the invitation
    await Notification.create({
      recipient: invitation.sender,
      sender: req.user._id,
      type: 'Response',
      project: project._id,
      status: 'Pending',
      message: `${req.user.name} has ${status.toLowerCase()}ed your invitation to project: ${project.name}`,
    });

    res.json({ message: `Invitation ${status.toLowerCase()}ed successfully`, project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
  respondToInvitation,
};
