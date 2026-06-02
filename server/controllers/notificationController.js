const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email role')
      .populate('project', 'name description')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    // Verify ownership
    if (notification.recipient.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this notification');
    }

    notification.status = 'Read';
    const updatedNotification = await notification.save();

    res.json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
