import express from 'express';
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} from '../controllers/routeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRoutes);
router.get('/:id', getRouteById);
router.post('/', protect, admin, createRoute);
router.put('/:id', protect, admin, updateRoute);
router.delete('/:id', protect, admin, deleteRoute);

export default router;