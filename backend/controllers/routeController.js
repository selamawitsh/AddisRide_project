import Route from '../models/Route.js';

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ name: 1 });
    res.json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a route
// @route   POST /api/routes
// @access  Private/Admin
export const createRoute = async (req, res) => {
  try {
    const { name, stops, path } = req.body;

    // Validate stops
    if (!stops || stops.length === 0) {
      return res.status(400).json({ message: 'At least one stop is required' });
    }

    // Validate each stop has required fields
    for (const stop of stops) {
      if (!stop.name || !stop.lat || !stop.lng) {
        return res.status(400).json({ 
          message: 'Each stop must have name, latitude, and longitude' 
        });
      }
    }

    const route = await Route.create({
      name,
      stops,
      path: path || []
    });

    res.status(201).json(route);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a route
// @route   PUT /api/routes/:id
// @access  Private/Admin
export const updateRoute = async (req, res) => {
  try {
    const { name, stops, path } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Validate stops if provided
    if (stops) {
      if (stops.length === 0) {
        return res.status(400).json({ message: 'At least one stop is required' });
      }
      for (const stop of stops) {
        if (!stop.name || !stop.lat || !stop.lng) {
          return res.status(400).json({ 
            message: 'Each stop must have name, latitude, and longitude' 
          });
        }
      }
    }

    route.name = name || route.name;
    route.stops = stops || route.stops;
    route.path = path || route.path;

    const updatedRoute = await route.save();
    res.json(updatedRoute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Check if route is being used by vehicles
    const Vehicle = (await import('../models/Vehicle.js')).default;
    const vehiclesUsingRoute = await Vehicle.countDocuments({ route: route._id });
    
    if (vehiclesUsingRoute > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete route that is assigned to vehicles' 
      });
    }

    await route.deleteOne();
    res.json({ message: 'Route removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get route count
// @route   GET /api/routes/count
// @access  Public
export const getRouteCount = async (req, res) => {
  try {
    const count = await Route.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// import Route from '../models/Route.js';

// // @desc    Get all routes
// // @route   GET /api/routes
// // @access  Public
// export const getRoutes = async (req, res) => {
//   try {
//     const routes = await Route.find().sort({ name: 1 });
//     res.json(routes);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Get single route
// // @route   GET /api/routes/:id
// // @access  Public
// export const getRouteById = async (req, res) => {
//   try {
//     const route = await Route.findById(req.params.id);
//     if (!route) {
//       return res.status(404).json({ message: 'Route not found' });
//     }
//     res.json(route);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Create a route
// // @route   POST /api/routes
// // @access  Private/Admin
// export const createRoute = async (req, res) => {
//   try {
//     const { name, stops, path } = req.body;

//     const route = await Route.create({
//       name,
//       stops,
//       path
//     });

//     res.status(201).json(route);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Update a route
// // @route   PUT /api/routes/:id
// // @access  Private/Admin
// export const updateRoute = async (req, res) => {
//   try {
//     const { name, stops, path } = req.body;

//     const route = await Route.findById(req.params.id);
//     if (!route) {
//       return res.status(404).json({ message: 'Route not found' });
//     }

//     route.name = name || route.name;
//     route.stops = stops || route.stops;
//     route.path = path || route.path;

//     const updatedRoute = await route.save();
//     res.json(updatedRoute);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Delete a route
// // @route   DELETE /api/routes/:id
// // @access  Private/Admin
// export const deleteRoute = async (req, res) => {
//   try {
//     const route = await Route.findById(req.params.id);
//     if (!route) {
//       return res.status(404).json({ message: 'Route not found' });
//     }

//     await route.deleteOne();
//     res.json({ message: 'Route removed' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // @desc    Get route count
// // @route   GET /api/routes/count
// // @access  Public
// export const getRouteCount = async (req, res) => {
//   try {
//     const count = await Route.countDocuments();
//     res.json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };