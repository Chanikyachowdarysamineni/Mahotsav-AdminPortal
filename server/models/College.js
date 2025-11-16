const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  
  // Auto-calculated field
  totalRegistrations: {
    type: Number,
    default: 0
  },
  
  // Additional Information (optional)
  university: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
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
  collection: 'colleges'
});

// Update timestamp on save
collegeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('College', collegeSchema, 'colleges');
