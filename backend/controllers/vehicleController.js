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

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('route', 'name stops');
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
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
    const vehicleExists = await Vehicle.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (vehicleExists) {
      return res.status(400).json({ message: 'Vehicle already exists' });
    }

    const vehicle = await Vehicle.create({
      plateNumber: plateNumber.toUpperCase(),
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

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res) => {
  try {
    const { plateNumber, route, status, occupancy } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if plate number is being changed and already exists
    if (plateNumber && plateNumber.toUpperCase() !== vehicle.plateNumber) {
      const vehicleExists = await Vehicle.findOne({ 
        plateNumber: plateNumber.toUpperCase() 
      });
      if (vehicleExists) {
        return res.status(400).json({ message: 'Vehicle already exists' });
      }
    }

    vehicle.plateNumber = plateNumber ? plateNumber.toUpperCase() : vehicle.plateNumber;
    vehicle.route = route || vehicle.route;
    vehicle.status = status || vehicle.status;
    vehicle.occupancy = occupancy || vehicle.occupancy;

    const updatedVehicle = await vehicle.save();
    const populatedVehicle = await Vehicle.findById(updatedVehicle._id)
      .populate('route', 'name stops');

    res.json(populatedVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle is assigned to a driver
    const driverWithVehicle = await User.findOne({ assignedVehicle: vehicle._id });
    if (driverWithVehicle) {
      // Unassign the vehicle from driver
      driverWithVehicle.assignedVehicle = null;
      await driverWithVehicle.save();
    }

    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

// @desc    Update vehicle occupancy
// @route   PUT /api/vehicles/:id/occupancy
// @access  Private/Driver or Admin
export const updateVehicleOccupancy = async (req, res) => {
  try {
    const { occupancy } = req.body;

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

    vehicle.occupancy = occupancy;
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

    // Remove vehicle from previous driver if any
    await User.updateOne(
      { assignedVehicle: vehicle._id },
      { $set: { assignedVehicle: null } }
    );

    // Assign to new driver
    driver.assignedVehicle = vehicle._id;
    await driver.save();

    vehicle.status = 'active';
    await vehicle.save();

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('route', 'name stops');

    res.json({ 
      message: 'Vehicle assigned successfully', 
      vehicle: populatedVehicle,
      driver: {
        _id: driver._id,
        name: driver.name,
        phoneNumber: driver.phoneNumber
      }
    });
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

// @desc    Get admin stats
// @route   GET /api/vehicles/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const [totalVehicles, activeVehicles, totalRoutes, totalUsers] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'active' }),
      (await import('../models/Route.js')).default.countDocuments(),
      (await import('../models/User.js')).default.countDocuments()
    ]);

    res.json({
      totalVehicles,
      activeVehicles,
      totalRoutes,
      totalUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Unassign vehicle from driver
// @route   PUT /api/vehicles/:id/unassign
// @access  Private/Admin
export const unassignVehicleFromDriver = async (req, res) => {
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

    // Check if this driver actually has this vehicle
    if (driver.assignedVehicle?.toString() !== vehicle._id.toString()) {
      return res.status(400).json({ message: 'This vehicle is not assigned to this driver' });
    }

    // Unassign from driver
    driver.assignedVehicle = null;
    await driver.save();

    // Update vehicle status to inactive
    vehicle.status = 'inactive';
    await vehicle.save();

    res.json({ 
      message: 'Vehicle unassigned successfully',
      vehicle,
      driver: {
        _id: driver._id,
        name: driver.name,
        phoneNumber: driver.phoneNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// import Vehicle from '../models/Vehicle.js';
// import User from '../models/User.js';

// // @desc    Get all vehicles with route info
// // @route   GET /api/vehicles
// // @access  Public
// export const getVehicles = async (req, res) => {
//   try {
//     const vehicles = await Vehicle.find()
//       .populate('route', 'name stops')
//       .sort({ createdAt: -1 });
//     res.json(vehicles);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Get vehicles by route
// // @route   GET /api/vehicles/route/:routeId
// // @access  Public
// export const getVehiclesByRoute = async (req, res) => {
//   try {
//     const vehicles = await Vehicle.find({ route: req.params.routeId })
//       .populate('route', 'name stops');
//     res.json(vehicles);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Create a vehicle
// // @route   POST /api/vehicles
// // @access  Private/Admin
// export const createVehicle = async (req, res) => {
//   try {
//     const { plateNumber, route, status, occupancy } = req.body;

//     // Check if plate number already exists
//     const vehicleExists = await Vehicle.findOne({ plateNumber });
//     if (vehicleExists) {
//       return res.status(400).json({ message: 'Vehicle already exists' });
//     }

//     const vehicle = await Vehicle.create({
//       plateNumber,
//       route,
//       status: status || 'inactive',
//       occupancy: occupancy || 'seats_available'
//     });

//     // Populate route info in response
//     const populatedVehicle = await Vehicle.findById(vehicle._id)
//       .populate('route', 'name stops');

//     res.status(201).json(populatedVehicle);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Update vehicle status
// // @route   PUT /api/vehicles/:id/status
// // @access  Private/Driver or Admin
// export const updateVehicleStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const vehicle = await Vehicle.findById(req.params.id);
//     if (!vehicle) {
//       return res.status(404).json({ message: 'Vehicle not found' });
//     }

//     // Check if driver owns this vehicle (for driver role)
//     if (req.user.role === 'driver') {
//       const user = await User.findById(req.user.id);
//       if (user.assignedVehicle?.toString() !== vehicle._id.toString()) {
//         return res.status(403).json({ message: 'Not authorized for this vehicle' });
//       }
//     }

//     vehicle.status = status;
//     await vehicle.save();

//     res.json(vehicle);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Assign vehicle to driver
// // @route   PUT /api/vehicles/:id/assign
// // @access  Private/Admin
// export const assignVehicleToDriver = async (req, res) => {
//   try {
//     const { driverId } = req.body;

//     const vehicle = await Vehicle.findById(req.params.id);
//     if (!vehicle) {
//       return res.status(404).json({ message: 'Vehicle not found' });
//     }

//     const driver = await User.findById(driverId);
//     if (!driver || driver.role !== 'driver') {
//       return res.status(400).json({ message: 'Invalid driver' });
//     }

//     if (!driver.isVerified) {
//       return res.status(400).json({ message: 'Driver not verified' });
//     }

//     if (driver.assignedVehicle) {
//       return res.status(400).json({ message: 'Driver already has a vehicle' });
//     }

//     vehicle.status = 'active';
//     await vehicle.save();



//     // Remove vehicle from previous driver if any
//     await User.updateOne(
//       { assignedVehicle: vehicle._id },
//       { $set: { assignedVehicle: null } }
//     );

//     // Assign to new driver
//     driver.assignedVehicle = vehicle._id;
//     await driver.save();

//     res.json({ message: 'Vehicle assigned successfully', vehicle, driver });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// // @desc    Get vehicle count
// // @route   GET /api/vehicles/count
// // @access  Public
// export const getVehicleCount = async (req, res) => {
//   try {
//     const count = await Vehicle.countDocuments();
//     res.json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Get active vehicle count
// // @route   GET /api/vehicles/active-count
// // @access  Public
// export const getActiveVehicleCount = async (req, res) => {
//   try {
//     const count = await Vehicle.countDocuments({ status: 'active' });
//     res.json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };