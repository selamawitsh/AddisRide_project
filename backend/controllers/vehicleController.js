import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

// @desc    Get all vehicles with route info
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('route', 'name stops')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get vehicles by route
// @route   GET /api/vehicles/route/:routeId
// @access  Public
export const getVehiclesByRoute = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ route: req.params.routeId })
      .populate('route', 'name stops');
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res) => {
  try {
    const { plateNumber, route, status, occupancy } = req.body;

    // Check if plate number already exists
    const vehicleExists = await Vehicle.findOne({ plateNumber });
    if (vehicleExists) {
      return res.status(400).json({ message: 'Vehicle already exists' });
    }

    const vehicle = await Vehicle.create({
      plateNumber,
      route,
      status: status || 'inactive',
      occupancy: occupancy || 'seats_available'
    });

    // Populate route info in response
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('route', 'name stops');

    res.status(201).json(populatedVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vehicle status
// @route   PUT /api/vehicles/:id/status
// @access  Private/Driver or Admin
export const updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if driver owns this vehicle (for driver role)
    if (req.user.role === 'driver') {
      const user = await User.findById(req.user.id);
      if (user.assignedVehicle?.toString() !== vehicle._id.toString()) {
        return res.status(403).json({ message: 'Not authorized for this vehicle' });
      }
    }

    vehicle.status = status;
    await vehicle.save();

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign vehicle to driver
// @route   PUT /api/vehicles/:id/assign
// @access  Private/Admin
export const assignVehicleToDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ message: 'Invalid driver' });
    }

    if (!driver.isVerified) {
      return res.status(400).json({ message: 'Driver not verified' });
    }

    if (driver.assignedVehicle) {
      return res.status(400).json({ message: 'Driver already has a vehicle' });
    }

    vehicle.status = 'active';
    await vehicle.save();



    // Remove vehicle from previous driver if any
    await User.updateOne(
      { assignedVehicle: vehicle._id },
      { $set: { assignedVehicle: null } }
    );

    // Assign to new driver
    driver.assignedVehicle = vehicle._id;
    await driver.save();

    res.json({ message: 'Vehicle assigned successfully', vehicle, driver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get vehicle count
// @route   GET /api/vehicles/count
// @access  Public
export const getVehicleCount = async (req, res) => {
  try {
    const count = await Vehicle.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get active vehicle count
// @route   GET /api/vehicles/active-count
// @access  Public
export const getActiveVehicleCount = async (req, res) => {
  try {
    const count = await Vehicle.countDocuments({ status: 'active' });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};