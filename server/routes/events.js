const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const {
      eventId,
      eventType,
      eventSubtype,
      eventSubtypeOther,
      subEvents,
      description,
      rules,
      malesFee,
      femalesFee,
      minParticipants,
      maxParticipants,
      isTeamEvent,
      teamSize,
      status,
      coordinatorName,
      coordinatorEmail,
      coordinatorPhone,
      venue,
      venueOther,
      date,
      time
    } = req.body;

    // Check if event ID already exists
    const existingEvent = await Event.findOne({ eventId });
    if (existingEvent) {
      return res.status(400).json({ message: 'Event ID already exists' });
    }

    const event = new Event({
      eventId,
      eventType,
      eventSubtype,
      eventSubtypeOther,
      subEvents,
      description,
      rules,
      malesFee,
      femalesFee,
      minParticipants,
      maxParticipants,
      isTeamEvent,
      teamSize,
      status,
      coordinatorName,
      coordinatorEmail,
      coordinatorPhone,
      venue,
      venueOther,
      date,
      time
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      eventId,
      eventType,
      eventSubtype,
      eventSubtypeOther,
      subEvents,
      description,
      rules,
      malesFee,
      femalesFee,
      minParticipants,
      maxParticipants,
      isTeamEvent,
      teamSize,
      status,
      coordinatorName,
      coordinatorEmail,
      coordinatorPhone,
      venue,
      venueOther,
      date,
      time
    } = req.body;

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if new event ID conflicts with existing event
    if (eventId !== event.eventId) {
      const existingEvent = await Event.findOne({ eventId });
      if (existingEvent) {
        return res.status(400).json({ message: 'Event ID already exists' });
      }
    }

    // Update fields
    event.eventId = eventId;
    event.eventType = eventType;
    event.eventSubtype = eventSubtype;
    event.eventSubtypeOther = eventSubtypeOther;
    event.subEvents = subEvents;
    event.description = description;
    event.rules = rules;
    event.malesFee = malesFee;
    event.femalesFee = femalesFee;
    event.minParticipants = minParticipants;
    event.maxParticipants = maxParticipants;
    event.isTeamEvent = isTeamEvent;
    event.teamSize = teamSize;
    event.status = status;
    event.coordinatorName = coordinatorName;
    event.coordinatorEmail = coordinatorEmail;
    event.coordinatorPhone = coordinatorPhone;
    event.venue = venue;
    event.venueOther = venueOther;
    event.date = date;
    event.time = time;
    event.updatedAt = Date.now();

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
