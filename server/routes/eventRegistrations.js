const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/EventRegistration');
const auth = require('../middleware/auth');

// @route   GET /api/event-registrations/stats/summary
// @desc    Get event registrations statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const total = await EventRegistration.countDocuments();
    const byStatus = await EventRegistration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byEvent = await EventRegistration.aggregate([
      { $group: { _id: '$eventName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      total,
      byStatus,
      byEvent
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/event-registrations
// @desc    Get all event registrations (teams) with event details
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const Event = require('../models/Event');
    console.log('=== Fetching Event Registrations with Category ===');
    console.log('Collection:', EventRegistration.collection.collectionName);
    console.log('Database:', EventRegistration.db.name);
    
    const registrations = await EventRegistration.find()
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✓ Found ${registrations.length} event registrations`);
    
    // Define sports-related keywords for fallback categorization
    const sportsKeywords = ['cricket', 'football', 'basketball', 'volleyball', 'badminton', 
                           'athletics', 'athletic', 'kabaddi', 'kho-kho', 'tennis', 
                           'table tennis', 'hockey', 'swimming', 'chess', 'carrom'];
    const culturalKeywords = ['dance', 'music', 'singing', 'drama', 'painting', 'art', 
                             'fashion', 'quiz', 'debate', 'elocution', 'rangoli'];
    
    // Enrich with event category by matching eventName
    const enrichedRegistrations = await Promise.all(
      registrations.map(async (reg) => {
        // Try exact match first
        let event = await Event.findOne({ eventName: reg.eventName }).lean();
        
        // Try case-insensitive match if exact match fails
        if (!event) {
          event = await Event.findOne({ 
            eventName: { $regex: new RegExp(`^${reg.eventName}$`, 'i') } 
          }).lean();
        }
        
        // Try matching by eventId if still no match
        if (!event && reg.eventId) {
          event = await Event.findOne({ eventId: reg.eventId }).lean();
        }
        
        let category = event?.category || 'unknown';
        
        // Fallback: Determine category from event name if not found in events collection
        if (category === 'unknown' && reg.eventName) {
          const eventNameLower = reg.eventName.toLowerCase();
          if (sportsKeywords.some(keyword => eventNameLower.includes(keyword))) {
            category = 'sports';
          } else if (culturalKeywords.some(keyword => eventNameLower.includes(keyword))) {
            category = 'cultural';
          }
        }
        
        return {
          ...reg,
          category: category,
          eventType: event?.eventType || 'team'
        };
      })
    );
    
    console.log(`✓ Enriched ${enrichedRegistrations.length} registrations with category data`);
    const sportsCount = enrichedRegistrations.filter(r => r.category === 'sports').length;
    const culturalCount = enrichedRegistrations.filter(r => r.category === 'cultural').length;
    console.log(`  - Sports: ${sportsCount}, Cultural: ${culturalCount}, Unknown: ${enrichedRegistrations.length - sportsCount - culturalCount}`);
    if (enrichedRegistrations.length > 0) {
      console.log('Sample enriched document:', JSON.stringify(enrichedRegistrations[0], null, 2));
    }
    
    res.json(enrichedRegistrations);
  } catch (error) {
    console.error('✗ Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/event-registrations/:id
// @desc    Get single event registration
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const registration = await EventRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Event registration not found' });
    }
    res.json(registration);
  } catch (error) {
    console.error('Error fetching event registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/event-registrations/event/:eventName
// @desc    Get registrations by event name
// @access  Private
router.get('/event/:eventName', auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ 
      eventName: new RegExp(req.params.eventName, 'i') 
    }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/event-registrations/college/:college
// @desc    Get registrations by college
// @access  Private
router.get('/college/:college', auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ 
      $or: [
        { college: new RegExp(req.params.college, 'i') },
        { collegeName: new RegExp(req.params.college, 'i') }
      ]
    }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/event-registrations/status/:status
// @desc    Get registrations by status
// @access  Private
router.get('/status/:status', auth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ 
      status: req.params.status 
    }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/event-registrations
// @desc    Create new event registration
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const registration = new EventRegistration(req.body);
    await registration.save();
    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating event registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/event-registrations/:id
// @desc    Update event registration
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: Date.now() };
    const registration = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!registration) {
      return res.status(404).json({ message: 'Event registration not found' });
    }
    res.json(registration);
  } catch (error) {
    console.error('Error updating event registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/event-registrations/:id
// @desc    Delete event registration
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await EventRegistration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Event registration not found' });
    }
    res.json({ message: 'Event registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting event registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
