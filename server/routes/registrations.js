const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

// Get all registrations
router.get('/', auth, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get single registration
router.get('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create new registration (Public route - no auth needed for user registration)
router.post('/register', async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res.status(201).json({
      message: 'Registration successful!',
      registration
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update registration
router.put('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete registration
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get registrations by payment status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ 
      paymentStatus: req.params.status 
    }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations by status:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get registrations by payment status (alternative route)
router.get('/payment-status/:status', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ 
      paymentStatus: req.params.status 
    }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations by payment status:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
