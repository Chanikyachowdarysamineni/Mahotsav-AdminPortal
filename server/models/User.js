const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // College Information
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Registration Details
  registerId: {
    type: String,
    trim: true
  },
  mahotsavId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Role
  role: {
    type: String,
    enum: ['admin', 'student', 'user'],
    default: 'student'
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
  collection: 'users'
});

// Generate Mahotsav ID before saving
userSchema.pre('save', async function(next) {
  // Generate mahotsavId if not exists
  if (!this.mahotsavId && this.role === 'student') {
    try {
      const count = await mongoose.model('User').countDocuments({ role: 'student' });
      const paddedCount = String(count + 1).padStart(6, '0');
      this.mahotsavId = `MH26${paddedCount}`;
    } catch (error) {
      console.error('Error generating mahotsavId:', error);
    }
  }
  
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
