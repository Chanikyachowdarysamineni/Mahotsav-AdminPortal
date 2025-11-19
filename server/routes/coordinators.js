const express = require('express');
const router = express.Router();
const Coordinator = require('../models/Coordinator');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// SYNC coordinators: Remove all and insert new
// @route   POST /api/coordinators/sync
// @desc    Replace all coordinators with new list
// @access  Private (Admin)
router.post('/sync', auth, async (req, res) => {
  try {
    const { coordinators } = req.body;
    if (!Array.isArray(coordinators) || coordinators.length === 0) {
      return res.status(400).json({ message: 'No coordinators provided' });
    }

    // Remove all coordinators
    await Coordinator.deleteMany({});

    // Hash passwords if provided
    const toInsert = await Promise.all(coordinators.map(async (c) => {
      if (c.password) {
        const salt = await bcrypt.genSalt(10);
        c.password = await bcrypt.hash(c.password, salt);
      }
      return c;
    }));

    // Insert new coordinators
    const inserted = await Coordinator.insertMany(toInsert);
    // Remove password from response
    const response = inserted.map(c => {
      const obj = c.toObject();
      delete obj.password;
      return obj;
    });
    res.status(201).json({ message: 'Coordinators synced', coordinators: response });
  } catch (error) {
    console.error('Error syncing coordinators:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coordinators
// @desc    Get all coordinators
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const coordinators = await Coordinator.find({ isActive: true })
      .select('-password')
      .sort({ firstName: 1 });
    res.json(coordinators);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coordinators/:id
// @desc    Get single coordinator
// @access  Private (Admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.params.id).select('-password');
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    res.json(coordinator);
  } catch (error) {
    console.error('Error fetching coordinator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coordinators
// @desc    Create new coordinator
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.password || typeof payload.password !== 'string' || payload.password.length < 6) {
      return res.status(400).json({ message: 'Password is required and must be at least 6 characters.' });
    }
    const coordinator = new Coordinator(payload);
    await coordinator.save();
    
    // Remove password from response
    const coordinatorResponse = coordinator.toObject();
    delete coordinatorResponse.password;
    
    res.status(201).json(coordinatorResponse);
  } catch (error) {
    console.error('Error creating coordinator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/coordinators/:id
// @desc    Update coordinator
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: Date.now() };

    // If password provided, hash it before updating
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }
    
    const coordinator = await Coordinator.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    res.json(coordinator);
  } catch (error) {
    console.error('Error updating coordinator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/coordinators/:id
// @desc    Delete coordinator (soft delete)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const coordinator = await Coordinator.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    res.json({ message: 'Coordinator deleted successfully' });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coordinators/department/:department
// @desc    Get coordinators by department
// @access  Private (Admin)
router.get('/department/:department', auth, async (req, res) => {
  try {
    const coordinators = await Coordinator.find({
      isActive: true,
      department: req.params.department
    })
      .select('-password')
      .sort({ firstName: 1 });
    res.json(coordinators);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
/** Additional tracking endpoints **/
// Login (mark online)
router.post('/:id/login', auth, async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    await coordinator.recordLogin();
    res.json({ message: 'Login recorded', loginStatus: coordinator.loginStatus, lastLoginAt: coordinator.lastLoginAt });
  } catch (err) {
    console.error('Error recording login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Logout (mark offline)
router.post('/:id/logout', auth, async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    await coordinator.recordLogout();
    res.json({ message: 'Logout recorded', loginStatus: coordinator.loginStatus, lastLogoutAt: coordinator.lastLogoutAt });
  } catch (err) {
    console.error('Error recording logout:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Record collection/payment handled
router.post('/:id/collection', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    const coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    await coordinator.recordCollection(amount);
    res.json({
      message: 'Collection recorded',
      totalAmountCollected: coordinator.collections.totalAmountCollected,
      paymentsHandled: coordinator.collections.paymentsHandled
    });
  } catch (err) {
    console.error('Error recording collection:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Increment registrations handled (e.g., when coordinator assists a registration)
router.post('/:id/registration-handled', auth, async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    await coordinator.incrementRegistrationsHandled();
    res.json({ message: 'Registration count incremented', registrationsHandled: coordinator.registrationsHandled });
  } catch (err) {
    console.error('Error incrementing registrations handled:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Stats endpoint
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.params.id).select('-password');
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    res.json({
      loginStatus: coordinator.loginStatus,
      lastLoginAt: coordinator.lastLoginAt,
      lastLogoutAt: coordinator.lastLogoutAt,
      loginHistory: coordinator.loginHistory,
      collections: coordinator.collections,
      registrationsHandled: coordinator.registrationsHandled
    });
  } catch (err) {
    console.error('Error fetching coordinator stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Cleanup inactive coordinators (mark as offline if no activity for 5 minutes)
router.post('/cleanup-inactive', auth, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await Coordinator.updateMany(
      {
        loginStatus: 'online',
        lastLoginAt: { $lt: fiveMinutesAgo }
      },
      {
        $set: { loginStatus: 'offline', lastLogoutAt: new Date() }
      }
    );
    res.json({ message: 'Inactive coordinators cleaned up', updated: result.modifiedCount });
  } catch (err) {
    console.error('Error cleaning up inactive coordinators:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
