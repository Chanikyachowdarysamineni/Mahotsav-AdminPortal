const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

// @route   GET api/leads
// @desc    Get all leads
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching leads'
    });
  }
});

// @route   GET api/leads/:id
// @desc    Get single lead by ID
// @access  Protected
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).select('-password');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while fetching lead'
    });
  }
});

// @route   POST api/leads
// @desc    Create new lead
// @access  Protected
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    // Check if lead already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        error: 'Lead with this email already exists'
      });
    }

    // Create new lead
    const lead = new Lead({
      name,
      email,
      password, // Will be automatically hashed by the model's pre-save middleware
      role: role || 'user'
    });

    await lead.save();

    // Return lead without password
    const leadResponse = await Lead.findById(lead._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: leadResponse
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating lead'
    });
  }
});

// @route   PUT api/leads/:id
// @desc    Update lead
// @access  Protected
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Find lead
    let lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== lead.email) {
      const existingLead = await Lead.findOne({ email });
      if (existingLead) {
        return res.status(400).json({
          success: false,
          error: 'Lead with this email already exists'
        });
      }
    }

    // Update fields
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (password) lead.password = password; // Will be automatically hashed by pre-save middleware
    if (role) lead.role = role;

    await lead.save();

    // Return updated lead without password
    const updatedLead = await Lead.findById(lead._id).select('-password');

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while updating lead'
    });
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete lead
// @access  Protected
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Lead deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while deleting lead'
    });
  }
});

// @route   GET api/leads/role/:role
// @desc    Get leads by role
// @access  Protected
router.get('/role/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin or user'
      });
    }

    const leads = await Lead.find({ role }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching leads by role:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching leads by role'
    });
  }
});

// @route   POST api/leads/search
// @desc    Search leads by name or email
// @access  Protected
router.post('/search', auth, async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      });
    }

    const leads = await Lead.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      searchTerm,
      data: leads
    });
  } catch (error) {
    console.error('Error searching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while searching leads'
    });
  }
});

module.exports = router;