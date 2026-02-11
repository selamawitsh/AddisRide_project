import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUser,
  getAllUsers,
  getUserCount,
  verifyDriver
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - require authentication
router.get('/me', protect, getCurrentUser);

// Admin only routes
router.get('/users', protect, admin, getAllUsers);
router.get('/count', protect, admin, getUserCount);
router.put('/:id/verify', protect, admin, verifyDriver);
router.delete('/:id', protect, admin, deleteUser);

export default router;

// import express from 'express';
// import { 
//   registerUser, 
//   loginUser, 
//   getCurrentUser, 
//   deleteUser, 
//   getAllUsers,
//   getUserCount  // ADD THIS
// } from '../controllers/authController.js';
// import { protect, admin } from '../middleware/auth.js';

// const router = express.Router();

// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.get('/me', protect, getCurrentUser);
// router.get('/users', protect, admin, getAllUsers);
// router.get('/count', protect, admin, getUserCount); // ADD THIS LINE
// router.delete('/:id', protect, admin, deleteUser);

// export default router;