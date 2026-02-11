import express from 'express';
import { registerUser , loginUser, getCurrentUser, deleteUser, getAllUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser );
router.post('/login', loginUser);

router.get('/me',protect, getCurrentUser);

router.get('/users', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

export default router;