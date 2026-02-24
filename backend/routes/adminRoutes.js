import express from 'express';
import {
  getPendingVerifications,
  getDriverDocuments,
  verifyDriverWithDocs,
  getVerificationStats
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin); // All admin routes require admin authentication

router.get('/pending-verifications', getPendingVerifications);
router.get('/verification-stats', getVerificationStats);
router.get('/driver-documents/:id', getDriverDocuments);
router.post('/verify-driver/:id', verifyDriverWithDocs);

export default router;