const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true
  },
  teamName: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  captain: {
    name: String,
    email: String,
    phone: String,
    registrationId: mongoose.Schema.Types.ObjectId
  },
  members: [{
    name: String,
    email: String,
    phone: String,
    registrationId: mongoose.Schema.Types.ObjectId
  }],
  totalMembers: {
    type: Number,
    default: 0
  },
  college: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'disqualified'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema, 'teams');
