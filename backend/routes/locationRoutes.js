import express from 'express';
import {
  getCurrentLocations,
  submitLocation,
  getVehicleLocationHistory
} from '../controllers/locationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/current', getCurrentLocations);
router.post('/', protect, submitLocation);
router.get('/vehicle/:vehicleId', protect, getVehicleLocationHistory);

export default router;