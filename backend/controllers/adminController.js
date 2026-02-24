import User from '../models/User.js';

// @desc    Get all pending driver verifications
// @route   GET /api/admin/pending-verifications
// @access  Private/Admin
export const getPendingVerifications = async (req, res) => {
  try {
    const pendingDrivers = await User.find({
      role: 'driver',
      isVerified: false,
      'documents.licenseNumber': { $exists: true, $ne: null }
    })
    .select('-password')
    .populate('assignedVehicle', 'plateNumber');

    res.json(pendingDrivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get driver documents for verification
// @route   GET /api/admin/driver-documents/:id
// @access  Private/Admin
export const getDriverDocuments = async (req, res) => {
  try {
    const driver = await User.findById(req.params.id)
      .select('name phoneNumber documents driverDetails isVerified')
      .populate('assignedVehicle', 'plateNumber');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({ message: 'User is not a driver' });
    }

    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify driver with documents check
// @route   POST /api/admin/verify-driver/:id
// @access  Private/Admin
export const verifyDriverWithDocs = async (req, res) => {
  try {
    const { status, rejectionReason, notes } = req.body; // status: 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const driver = await User.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({ message: 'User is not a driver' });
    }

    if (status === 'approved') {
      driver.isVerified = true;
      driver.documents.verifiedBy = req.user.id;
      driver.documents.verifiedAt = new Date();
      driver.documents.rejectionReason = null;
    } else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      driver.isVerified = false;
      driver.documents.rejectionReason = rejectionReason;
      driver.documents.verifiedBy = req.user.id;
      driver.documents.verifiedAt = new Date();
    }

    if (notes) {
      driver.documents.adminNotes = notes;
    }

    await driver.save();

    res.json({ 
      success: true,
      message: `Driver ${status === 'approved' ? 'verified' : 'rejected'} successfully`,
      driver: {
        _id: driver._id,
        name: driver.name,
        isVerified: driver.isVerified,
        rejectionReason: driver.documents.rejectionReason
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get verification statistics
// @route   GET /api/admin/verification-stats
// @access  Private/Admin
export const getVerificationStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'driver' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          pending: { $sum: { $cond: [
            { $and: [
              { $eq: ['$isVerified', false] },
              { $ne: ['$documents.licenseNumber', null] }
            ]}, 1, 0
          ]}},
          withoutDocuments: { $sum: { $cond: [
            { $eq: ['$documents.licenseNumber', null] }, 1, 0
          ]}}
        }
      }
    ]);

    res.json(stats[0] || { total: 0, verified: 0, pending: 0, withoutDocuments: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};