import express from 'express';
import {
  getVehicles,
  getVehicleById,
  getVehiclesByRoute,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  updateVehicleOccupancy,
  assignVehicleToDriver,
  getVehicleCount,
  getActiveVehicleCount,
  getAdminStats,
  unassignVehicleFromDriver
} from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getVehicles);

router.route('/count')
  .get(getVehicleCount);

router.route('/active-count')
  .get(getActiveVehicleCount);

router.route('/route/:routeId')
  .get(getVehiclesByRoute);

// Protected routes
router.route('/admin/stats')
  .get(protect, admin, getAdminStats);

router.route('/')
  .post(protect, admin, createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(protect, admin, updateVehicle)
  .delete(protect, admin, deleteVehicle);

router.route('/:id/status')
  .put(protect, updateVehicleStatus);

router.route('/:id/occupancy')
  .put(protect, updateVehicleOccupancy);

router.route('/:id/assign')
  .put(protect, admin, assignVehicleToDriver);

router.route('/:id/unassign')
  .put(protect, admin, unassignVehicleFromDriver);

export default router;


// import express from 'express';
// import {
//   getVehicles,
//   getVehiclesByRoute,
//   createVehicle,
//   updateVehicleStatus,
//   assignVehicleToDriver,
//   getVehicleCount,  // ADD THIS
//   getActiveVehicleCount  // ADD THIS
// } from '../controllers/vehicleController.js';
// import { protect, admin } from '../middleware/auth.js';

// const router = express.Router();

// router.get('/', getVehicles);
// router.get('/count', getVehicleCount); // ADD THIS LINE
// router.get('/active-count', getActiveVehicleCount); // ADD THIS LINE
// router.get('/route/:routeId', getVehiclesByRoute);
// router.post('/', protect, admin, createVehicle);
// router.put('/:id/status', protect, updateVehicleStatus);
// router.put('/:id/assign', protect, admin, assignVehicleToDriver);

// export default router;