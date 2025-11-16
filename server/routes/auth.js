const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Coordinator = require('../models/Coordinator');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists in leads
    const existingUser = await Lead.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user in leads collection
    const user = new Lead({
      name,
      email,
      password,
      role: role || 'user'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordProvided: !!password });

    // Check if user exists in users collection first, then leads, then coordinators
    let user = await User.findOne({ email });
    let userType = 'user';
    
    if (!user) {
      user = await Lead.findOne({ email });
      userType = 'lead';
    }
    
    if (!user) {
      user = await Coordinator.findOne({ email });
      userType = 'coordinator';
    }
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found in', userType, ':', { email: user.email, hasPassword: !!user.password });

    // Check password (coordinators use bcrypt directly)
    let isMatch;
    if (userType === 'coordinator') {
      const bcrypt = require('bcryptjs');
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = await user.comparePassword(password);
    }
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If coordinator, record login and update status
    if (userType === 'coordinator') {
      await user.recordLogin();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: userType === 'user' ? user.fullName : (userType === 'coordinator' ? `${user.firstName} ${user.lastName}` : user.name),
        email: user.email,
        role: user.role || 'coordinator',
        type: userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.fullName || req.user.name || `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (for coordinators to update status)
router.post('/logout', auth, async (req, res) => {
  try {
    // Check if user is a coordinator
    const coordinator = await Coordinator.findById(req.user._id);
    if (coordinator) {
      await coordinator.recordLogout();
      console.log('Coordinator logged out:', coordinator.email);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
