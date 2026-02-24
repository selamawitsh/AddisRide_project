import express from 'express';
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteCount
} from '../controllers/routeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getRoutes)
  .post(protect, admin, createRoute);

router.route('/count')
  .get(getRouteCount);

router.route('/:id')
  .get(getRouteById)
  .put(protect, admin, updateRoute)
  .delete(protect, admin, deleteRoute);

export default router;


// import express from 'express';
// import {
//   getRoutes,
//   getRouteById,
//   createRoute,
//   updateRoute,
//   deleteRoute,
//   getRouteCount  // ADD THIS
// } from '../controllers/routeController.js';
// import { protect, admin } from '../middleware/auth.js';

// const router = express.Router();

// router.get('/', getRoutes);
// router.get('/count', getRouteCount); // ADD THIS LINE
// router.get('/:id', getRouteById);
// router.post('/', protect, admin, createRoute);
// router.put('/:id', protect, admin, updateRoute);
// router.delete('/:id', protect, admin, deleteRoute);

// export default router;