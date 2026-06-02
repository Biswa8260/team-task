const { body, validationResult } = require('express-validator');

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
  body('role')
    .optional()
    .isIn(['Admin', 'Member'])
    .withMessage('Role must be either Admin or Member'),
  validate,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').trim().notEmpty().withMessage('Project description is required'),
  validate,
];

const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').trim().notEmpty().withMessage('Task description is required'),
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('assignedTo').isMongoId().withMessage('Invalid assigned user ID'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  validate,
];

const validateTaskStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateTask,
  validateTaskStatus,
};
