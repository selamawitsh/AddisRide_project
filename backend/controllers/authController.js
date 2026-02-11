import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Register user (Admin/Driver)
 * POST /api/auth/register
 * Public access - Phase 1, restrict to admin only in production
 */
export const registerUser = async (req, res) => {
  try {
    const { name, phoneNumber, role, password } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, phone number and password' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this phone number' 
      });
    }

    // Hash password with salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      phoneNumber,
      role: role || 'driver',
      password: hashedPassword,
      isVerified: role === 'admin' // Auto-verify admin, drivers need verification
    });

    // Validate JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ 
        message: 'Server configuration error' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
      assignedVehicle: user.assignedVehicle,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error during registration' 
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Public access
 */
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Validate required fields
    if (!phoneNumber || !password) {
      return res.status(400).json({ 
        message: 'Please provide phone number and password' 
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is verified (for drivers)
    if (!user.isVerified && user.role === 'driver') {
      return res.status(403).json({ 
        message: 'Account pending verification. Please contact admin.' 
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Validate JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ 
        message: 'Server configuration error' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
      assignedVehicle: user.assignedVehicle,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error during login' 
    });
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 * Private access
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assignedVehicle', 'plateNumber route');
      
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user' 
    });
  }
};

/**
 * Delete user - Admin only
 * DELETE /api/auth/:id
 * Private/Admin access
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }

    await user.deleteOne();

    res.json({ 
      message: 'User removed successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error while deleting user' 
    });
  }
};

/**
 * Get all users - Admin only
 * GET /api/auth/users
 * Private/Admin access
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('assignedVehicle', 'plateNumber route')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching users' 
    });
  }
};

/**
 * Get user count - Admin only
 * GET /api/auth/count
 * Private/Admin access
 */
export const getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const driverCount = await User.countDocuments({ role: 'driver' });
    const verifiedCount = await User.countDocuments({ isVerified: true });
    const pendingCount = await User.countDocuments({ isVerified: false, role: 'driver' });

    res.json({
      total: totalUsers,
      admins: adminCount,
      drivers: driverCount,
      verified: verifiedCount,
      pending: pendingCount
    });
  } catch (error) {
    console.error('Get user count error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching user counts' 
    });
  }
};

/**
 * Verify driver - Admin only
 * PUT /api/auth/:id/verify
 * Private/Admin access
 */
export const verifyDriver = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    if (user.role !== 'driver') {
      return res.status(400).json({ 
        message: 'Only drivers can be verified' 
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      message: 'Driver verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify driver error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error while verifying driver' 
    });
  }
};