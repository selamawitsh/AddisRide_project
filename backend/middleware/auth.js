import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - Verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Bearer string
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ 
          message: 'Server configuration error' 
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object (exclude password)
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('assignedVehicle', 'plateNumber route');

      if (!req.user) {
        return res.status(401).json({ 
          message: 'User not found' 
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.name, error.message);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token' 
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired' 
        });
      }
      return res.status(401).json({ 
        message: 'Not authorized' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized, no token provided' 
    });
  }
};

/**
 * Restrict to admin users only
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

/**
 * Restrict to driver users only
 */
export const driver = (req, res, next) => {
  if (req.user && req.user.role === 'driver') {
    // Check if driver is verified
    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: 'Account pending verification. Please contact admin.' 
      });
    }
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Driver privileges required.' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Silently fail - user remains unauthenticated
    }
  }
  next();
};