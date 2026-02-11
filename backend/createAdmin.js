import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js'; // Make sure this path is correct

dotenv.config();

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ phoneNumber: '0912345678' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Phone: 0912345678');
      console.log('Password: (use your existing password)');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      phoneNumber: '0912345678',
      role: 'admin',
      password: hashedPassword,
      isVerified: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('==============================');
    console.log('Admin Credentials:');
    console.log('Phone: 0912345678');
    console.log('Password: admin123');
    console.log('==============================');
    console.log('⚠️  Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();