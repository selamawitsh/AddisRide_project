import express from 'express';
import {
  getVehicles,
  getVehiclesByRoute,
  createVehicle,
  updateVehicleStatus,
  assignVehicleToDriver,
  getVehicleCount,  // ADD THIS
  getActiveVehicleCount  // ADD THIS
} from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/count', getVehicleCount); // ADD THIS LINE
router.get('/active-count', getActiveVehicleCount); // ADD THIS LINE
router.get('/route/:routeId', getVehiclesByRoute);
router.post('/', protect, admin, createVehicle);
router.put('/:id/status', protect, updateVehicleStatus);
router.put('/:id/assign', protect, admin, assignVehicleToDriver);

export default router;