import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
};

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).fields([
  { name: 'licenseImage', maxCount: 1 },
  { name: 'idCardImage', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]);

// @desc    Upload driver documents
// @route   POST /api/driver/upload-documents
// @access  Private/Driver
export const uploadDocuments = async (req, res) => {
  try {
    const { 
      licenseNumber, 
      licenseExpiry, 
      idCardNumber, 
      address, 
      dateOfBirth, 
      emergencyContact, 
      experience 
    } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can upload documents' });
    }

    // Build document paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const documents = { ...user.documents };

    if (req.files?.licenseImage?.[0]) {
      documents.licenseImage = `${baseUrl}/uploads/documents/${req.files.licenseImage[0].filename}`;
    }
    if (req.files?.idCardImage?.[0]) {
      documents.idCardImage = `${baseUrl}/uploads/documents/${req.files.idCardImage[0].filename}`;
    }
    if (req.files?.photo?.[0]) {
      documents.photo = `${baseUrl}/uploads/documents/${req.files.photo[0].filename}`;
    }

    // Update text fields
    if (licenseNumber) documents.licenseNumber = licenseNumber;
    if (licenseExpiry) documents.licenseExpiry = new Date(licenseExpiry);
    if (idCardNumber) documents.idCardNumber = idCardNumber;
    
    documents.submittedAt = new Date();

    // Update driver details
    const driverDetails = { ...user.driverDetails };
    if (address) driverDetails.address = address;
    if (dateOfBirth) driverDetails.dateOfBirth = new Date(dateOfBirth);
    if (emergencyContact) driverDetails.emergencyContact = emergencyContact;
    if (experience) driverDetails.experience = parseInt(experience);

    // Update user
    user.documents = documents;
    user.driverDetails = driverDetails;
    
    // Reset verification status
    user.isVerified = false;
    user.documents.verifiedBy = null;
    user.documents.verifiedAt = null;
    user.documents.rejectionReason = null;

    await user.save();

    res.json({ 
      success: true,
      message: 'Documents uploaded successfully. Pending admin verification.',
      documents: user.documents,
      driverDetails: user.driverDetails
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get driver's own documents
// @route   GET /api/driver/my-documents
// @access  Private/Driver
export const getMyDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name phoneNumber documents driverDetails isVerified');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};