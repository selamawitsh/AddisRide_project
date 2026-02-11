import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//register user admin/driver
//post /api/auth/register
// make it public for phase one and later restrict to admin only
export const registerUser = async (req,res) => {
    try {
        const {name, phoneNumber, role, password} = req.body;
        const userExists = await User.findOne({phoneNumber});
        if(userExists) {
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            phoneNumber,
            role,
            password: hashedPassword,
            // Admin is auto-verified, drivers need verification
            isVerified: role === 'admin'
        });

        // Create JWT token
        const token = jwt.sign(
        { id: user._id, role: user.role },
            process.env.JWT_SECRET,
        { expiresIn: '7d' }
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        
    }
    
}

//login user admin/driver
//POST /api/auth/login
// public
export const loginUser = async (req, res) => {
    try {
        const {phoneNumber, password} = req.body;
        const user = await User.findOne({phoneNumber});
        if(!user) {
            return res.status(400).json({message: "Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: "Invalid credentials"});
        }
        
        //  Create token
        const token = jwt.sign(
        { id: user._id, role: user.role },
            process.env.JWT_SECRET,
        { expiresIn: '7d' }
        );

        res.json({
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        assignedVehicle: user.assignedVehicle,
        // token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        
    }
    
}

//get current user
//GET /api/auth/me
// private
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

//delete user - admin only
//DELETE /api/auth/:id
// private (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// get all users - admin only 
// GET /api/auth/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
