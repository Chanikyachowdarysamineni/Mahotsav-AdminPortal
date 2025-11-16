const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const auth = require('../middleware/auth');

// Get all teams
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get single team
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create new team (Public route - for user team registration)
router.post('/create', async (req, res) => {
  try {
    const { teamId } = req.body;
    
    // Check if team ID already exists
    const existingTeam = await Team.findOne({ teamId });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team ID already exists' });
    }

    const team = new Team(req.body);
    await team.save();
    
    res.status(201).json({
      message: 'Team created successfully!',
      team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update team
router.put('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete team
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get teams by event
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const teams = await Team.find({ eventId: req.params.eventId });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams by event:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get teams by college
router.get('/college/:college', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 
      college: new RegExp(req.params.college, 'i') 
    });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams by college:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Add member to team
router.post('/:id/add-member', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    team.members.push(req.body);
    team.totalMembers = team.members.length + 1; // +1 for captain
    await team.save();
    
    res.json({
      message: 'Member added successfully',
      team
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
