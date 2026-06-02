const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
  respondToInvitation,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validateProject } = require('../middleware/validationMiddleware');

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, admin, validateProject, createProject);

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, validateProject, updateProject)
  .delete(protect, admin, deleteProject);

router.route('/:id/members').put(protect, admin, updateProjectMembers);
router.route('/:id/invitation-response').post(protect, respondToInvitation);

module.exports = router;
