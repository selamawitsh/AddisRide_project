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

    const route = await Route.create({
      name,
      stops,
      path
    });

    res.status(201).json(route);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    await route.deleteOne();
    res.json({ message: 'Route removed' });
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