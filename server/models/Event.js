const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Event Information
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Category & Type (NEW STRUCTURE)
  category: {
    type: String,
    enum: ['sports', 'cultural'],
    required: true
  },
  eventType: {
    type: String,
    enum: ['team', 'individual'],
    required: true
  },
  
  // Team Configuration
  maxTeamSize: {
    type: Number,
    default: 1
  },
  minTeamSize: {
    type: Number,
    default: 1
  },
  
  // Additional Details (backward compatibility)
  eventSubtype: {
    type: String
  },
  eventSubtypeOther: {
    type: String
  },
  subEvents: [{
    name: String,
    description: String
  }],
  description: {
    type: String
  },
  rules: {
    type: String
  },
  
  // Registration Fees
  malesFee: {
    type: Number,
    default: 0
  },
  femalesFee: {
    type: Number,
    default: 0
  },
  
  // Capacity
  maxParticipants: {
    type: Number
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  
  // Coordinator Information
  coordinatorName: {
    type: String
  },
  coordinatorEmail: {
    type: String
  },
  coordinatorPhone: {
    type: String
  },
  
  // Venue and Schedule
  venue: {
    type: String
  },
  venueOther: {
    type: String
  },
  date: {
    type: String
  },
  time: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'events'
});

// Update timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for backward compatibility
eventSchema.virtual('isTeamEvent').get(function() {
  return this.eventType === 'team';
});

eventSchema.virtual('teamSize').get(function() {
  return this.maxTeamSize;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema, 'events');
