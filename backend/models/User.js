import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true // For login
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'driver'], // Restricts to these two values
    default: 'driver'
  },
  // Link to the vehicle this driver is assigned to (only for drivers)
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
  }
}, { timestamps: true }); // Adds `createdAt` and `updatedAt` automatically

export default mongoose.model('User', UserSchema);