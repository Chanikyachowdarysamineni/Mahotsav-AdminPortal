const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const auth = require('../middleware/auth');

// Get all participants
router.get('/', auth, async (req, res) => {
  try {
    const participants = await Participant.find().populate('eventId').sort({ createdAt: -1 });
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get single participant
router.get('/:id', auth, async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id).populate('eventId');
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    res.json(participant);
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create new participant (Public route - for website user registration)
router.post('/register', async (req, res) => {
  try {
    const { email, participantId } = req.body;
    
    // Check if email already exists
    const existingParticipant = await Participant.findOne({ 
      $or: [{ email }, { participantId }] 
    });
    
    if (existingParticipant) {
      return res.status(400).json({ 
        message: 'Participant with this email or ID already exists' 
      });
    }

    const participant = new Participant(req.body);
    await participant.save();
    
    res.status(201).json({
      message: 'Participant registered successfully!',
      participant
    });
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update participant
router.put('/:id', auth, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete participant
router.delete('/:id', auth, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    res.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get participants by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const participants = await Participant.find({ 
      registrationStatus: req.params.status 
    }).populate('eventId');
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants by status:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get participants by payment status
router.get('/payment-status/:status', auth, async (req, res) => {
  try {
    const participants = await Participant.find({ 
      paymentStatus: req.params.status 
    }).populate('eventId');
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants by payment status:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get participants by event
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const participants = await Participant.find({ 
      eventId: req.params.eventId 
    }).populate('eventId');
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants by event:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get participants by college
router.get('/college/:college', auth, async (req, res) => {
  try {
    const participants = await Participant.find({ 
      college: new RegExp(req.params.college, 'i') 
    }).populate('eventId');
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants by college:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
