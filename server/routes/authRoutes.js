const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  resetUserPassword,
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/password', protect, admin, resetUserPassword);

module.exports = router;
