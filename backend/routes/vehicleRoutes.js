import express from 'express';
import {
  getVehicles,
  getVehiclesByRoute,
  createVehicle,
  updateVehicleStatus,
  assignVehicleToDriver
} from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/route/:routeId', getVehiclesByRoute);
router.post('/', protect, admin, createVehicle);
router.put('/:id/status', protect, updateVehicleStatus);
router.put('/:id/assign', protect, admin, assignVehicleToDriver);

export default router;