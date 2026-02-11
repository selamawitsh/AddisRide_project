import LocationUpdate from '../models/LocationUpdate.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

// @desc    Get latest locations of all active vehicles
// @route   GET /api/locations/current
// @access  Public
export const getCurrentLocations = async (req, res) => {
  try {
    // Get the latest location for each active vehicle
    const latestLocations = await LocationUpdate.aggregate([
      // Join with vehicles collection
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleInfo'
        }
      },
      { $unwind: '$vehicleInfo' },
      // Join with routes collection
      {
        $lookup: {
          from: 'routes',
          localField: 'vehicleInfo.route',
          foreignField: '_id',
          as: 'routeInfo'
        }
      },
      { $unwind: '$routeInfo' },
      // Filter only active vehicles
      {
        $match: {
          'vehicleInfo.status': 'active'
        }
      },
      // Sort by timestamp descending
      {
        $sort: { createdAt: -1 }
      },
      // Group by vehicle to get the latest location
      {
        $group: {
          _id: '$vehicle',
          vehicle: { $first: '$vehicleInfo' },
          route: { $first: '$routeInfo' },
          lat: { $first: '$lat' },
          lng: { $first: '$lng' },
          lastUpdated: { $first: '$createdAt' }
        }
      },
      // Format the output
      {
        $project: {
          _id: 0,
          vehicleId: '$_id',
          plateNumber: '$vehicle.plateNumber',
          occupancy: '$vehicle.occupancy',
          status: '$vehicle.status',
          routeId: '$route._id',
          routeName: '$route.name',
          routeStops: '$route.stops',
          coordinates: {
            lat: '$lat',
            lng: '$lng'
          },
          lastUpdated: 1
        }
      }
    ]);

    res.json(latestLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit location update (for simulation script or driver app)
// @route   POST /api/locations
// @access  Private/Driver or Simulation
export const submitLocation = async (req, res) => {
  try {
    const { vehicleId, lat, lng } = req.body;

    // Check if vehicle exists and is active
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // For driver role, verify they own this vehicle
    if (req.user && req.user.role === 'driver') {
      const user = await User.findById(req.user.id);
      if (user.assignedVehicle?.toString() !== vehicleId) {
        return res.status(403).json({ message: 'Not authorized for this vehicle' });
      }
    }

    // Create location update
    const locationUpdate = await LocationUpdate.create({
      vehicle: vehicleId,
      lat,
      lng
    });

    // Optionally update vehicle status to active if it was inactive
    if (vehicle.status === 'inactive') {
      vehicle.status = 'active';
      await vehicle.save();
    }

    res.status(201).json(locationUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get location history for a vehicle
// @route   GET /api/locations/vehicle/:vehicleId
// @access  Private/Admin or Driver
export const getVehicleLocationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 50 } = req.query;

    const locations = await LocationUpdate.find({ vehicle: vehicleId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};