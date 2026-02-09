import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from '../models/Vehicle.js';
import LocationUpdate from '../models/LocationUpdate.js';
import Route from '../models/Route.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for simulation'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to simulate bus movement along a route
const simulateBusMovement = async () => {
  try {
    // Get all active vehicles with their route details
    const vehicles = await Vehicle.find({ status: 'active' })
      .populate('route');
    
    if (vehicles.length === 0) {
      console.log('No active vehicles found. Activate some vehicles first.');
      return;
    }

    for (const vehicle of vehicles) {
      const route = vehicle.route;
      if (!route || !route.path || route.path.length === 0) {
        console.log(`No path data for vehicle ${vehicle.plateNumber}`);
        continue;
      }

      // For simplicity, move along the path points
      // In Phase 1, just pick a random point from the path
      const randomIndex = Math.floor(Math.random() * route.path.length);
      const point = route.path[randomIndex];

      // Add some randomness to make it look like movement
      const lat = point.lat + (Math.random() - 0.5) * 0.001;
      const lng = point.lng + (Math.random() - 0.5) * 0.001;

      // Create location update
      await LocationUpdate.create({
        vehicle: vehicle._id,
        lat,
        lng
      });

      console.log(`Updated location for ${vehicle.plateNumber}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  } catch (error) {
    console.error('Simulation error:', error);
  }
};

// Run simulation every 10 seconds
console.log('Starting bus simulation...');
setInterval(simulateBusMovement, 10000);

// Initial run
simulateBusMovement();