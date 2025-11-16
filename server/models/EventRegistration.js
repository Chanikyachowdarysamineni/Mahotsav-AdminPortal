const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  eventId: {
    type: String
  },
  captainName: {
    type: String
  },
  captainEmail: {
    type: String
  },
  captainPhone: {
    type: String
  },
  members: [{
    name: String,
    email: String,
    phone: String,
    rollNumber: String
  }],
  college: {
    type: String
  },
  collegeName: {
    type: String
  },
  totalMembers: {
    type: Number
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentAmount: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'eventRegistrations'
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema, 'eventRegistrations');
