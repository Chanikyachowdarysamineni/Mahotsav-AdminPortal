const express = require('express');
const router = express.Router();
const College = require('../models/College');
const auth = require('../middleware/auth');

// @route   GET /api/colleges
// @desc    Get all colleges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).sort({ collegeName: 1 });
    res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/colleges/:id
// @desc    Get single college
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/colleges
// @desc    Create new college
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  try {
    const college = new College(req.body);
    await college.save();
    res.status(201).json(college);
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/colleges/:id
// @desc    Update college
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/colleges/:id
// @desc    Delete college (soft delete)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/colleges/search/:query
// @desc    Search colleges by name
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const colleges = await College.find({
      isActive: true,
      collegeName: { $regex: req.params.query, $options: 'i' }
    }).sort({ collegeName: 1 });
    res.json(colleges);
  } catch (error) {
    console.error('Error searching colleges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
