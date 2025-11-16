const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Event Reference
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Team Information (optional, for team events)
  teamName: {
    type: String,
    trim: true
  },
  membersCount: {
    type: Number,
    default: 1
  },
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String // 'captain' or 'member'
  }],
  isTeamCaptain: {
    type: Boolean,
    default: false
  },
  
  // Payment Information
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  
  // Registration Status
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'approved'
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
  collection: 'registrations'
});

// Update timestamp on save
registrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
registrationSchema.index({ userId: 1 });
registrationSchema.index({ eventId: 1 });
registrationSchema.index({ createdAt: -1 });
registrationSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Registration', registrationSchema, 'registrations');
