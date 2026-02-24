import express from 'express';
import { upload, uploadDocuments, getMyDocuments } from '../controllers/driverController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All driver routes require authentication

router.post('/upload-documents', upload, uploadDocuments);
router.get('/my-documents', getMyDocuments);

export default router;