import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  licenseNumber: { 
    type: String,
    trim: true
  },
  licenseExpiry: { 
    type: Date 
  },
  licenseImage: { 
    type: String, // URL to uploaded license image
    trim: true
  },
  idCardNumber: { 
    type: String,
    trim: true
  },
  idCardImage: { 
    type: String, // URL to uploaded ID image
    trim: true
  },
  photo: { 
    type: String, // Driver's photo
    trim: true
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  verifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  verifiedAt: { 
    type: Date 
  },
  rejectionReason: { 
    type: String,
    trim: true
  },
  adminNotes: { 
    type: String,
    trim: true
  }
}, { _id: false });

const DriverDetailsSchema = new mongoose.Schema({
  address: { 
    type: String,
    trim: true
  },
  dateOfBirth: { 
    type: Date 
  },
  emergencyContact: { 
    type: String,
    trim: true
  },
  experience: { 
    type: Number, // years of experience
    min: 0
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'driver'],
    default: 'driver'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false // Admin must verify drivers
  },
  password: {
    type: String,
    required: true
  },
  // New document fields
  documents: {
    type: DocumentSchema,
    default: {}
  },
  driverDetails: {
    type: DriverDetailsSchema,
    default: {}
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if documents are submitted
UserSchema.virtual('hasSubmittedDocuments').get(function() {
  return !!(this.documents && 
    (this.documents.licenseImage || 
     this.documents.idCardImage || 
     this.documents.photo));
});

// Virtual for checking if documents are complete
UserSchema.virtual('areDocumentsComplete').get(function() {
  return !!(this.documents &&
    this.documents.licenseNumber &&
    this.documents.licenseExpiry &&
    this.documents.licenseImage &&
    this.documents.idCardNumber &&
    this.documents.idCardImage &&
    this.documents.photo &&
    this.driverDetails.dateOfBirth &&
    this.driverDetails.address &&
    this.driverDetails.emergencyContact);
});

export default mongoose.model('User', UserSchema);


// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   phoneNumber: {
//     type: String,
//     required: true,
//     unique: true // For login
//   },
//   role: {
//     type: String,
//     required: true,
//     enum: ['admin', 'driver'], // Restricts to these two values
//     default: 'driver'
//   },
//   // Link to the vehicle this driver is assigned to (only for drivers)
//   assignedVehicle: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vehicle',
//     default: null
//   },
//   isVerified: {
//     type: Boolean,
//     default: false // Admin must verify drivers
//   },
//   password: {
//     type: String,
//     required: true
//   }
// }, { timestamps: true }); // Adds `createdAt` and `updatedAt` automatically

// export default mongoose.model('User', UserSchema);