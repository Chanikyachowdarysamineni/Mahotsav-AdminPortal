const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  // Tracking fields
  loginStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lastLoginAt: { type: Date, default: null },
  lastLogoutAt: { type: Date, default: null },
  loginHistory: [
    {
      loginAt: { type: Date, required: true },
      logoutAt: { type: Date, default: null }
    }
  ],
  collections: {
    totalAmountCollected: { type: Number, default: 0 },
    paymentsHandled: { type: Number, default: 0 }
  },
  registrationsHandled: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'coordinators' });

// Hash password if provided and modified
const bcrypt = require('bcryptjs');
coordinatorSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

coordinatorSchema.methods.recordLogin = function () {
  this.loginStatus = 'online';
  const now = new Date();
  this.lastLoginAt = now;
  this.loginHistory.push({ loginAt: now });
  return this.save();
};

coordinatorSchema.methods.recordLogout = function () {
  this.loginStatus = 'offline';
  const now = new Date();
  this.lastLogoutAt = now;
  // update the last history entry if not already set
  const last = this.loginHistory[this.loginHistory.length - 1];
  if (last && !last.logoutAt) {
    last.logoutAt = now;
  }
  return this.save();
};

coordinatorSchema.methods.recordCollection = function (amount) {
  if (typeof amount === 'number' && amount > 0) {
    this.collections.totalAmountCollected += amount;
    this.collections.paymentsHandled += 1;
  }
  return this.save();
};

coordinatorSchema.methods.incrementRegistrationsHandled = function () {
  this.registrationsHandled += 1;
  return this.save();
};

module.exports = mongoose.model('Coordinator', coordinatorSchema, 'coordinators');
