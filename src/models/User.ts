import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false,
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  fullName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: false,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  idNumber: {
    type: String,
    required: false,
  },
  displayName: String,
  authProvider: {
    type: String,
    required: true,
    enum: ['google', 'email'],
    default: 'email'
  },
  providerId: String,
  profilePicture: String,
  
  // Partner Details
  partnerName: {
    type: String,
    required: false,
  },
  partnerEmail: {
    type: String,
    required: false,
  },
  partnerPhone: {
    type: String,
    required: false,
  },
  partnerIdNumber: {
    type: String,
    required: false,
  },
  partnerGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false,
  },
  
  // Wedding Details
  weddingDate: {
    type: Date,
    required: false,
  },
  expectedGuests: {
    type: String,
    required: false,
  },
  weddingLocation: {
    type: String,
    required: false,
  },
  budget: {
    type: String,
    required: false,
  },
  
  // Wedding Preferences
  preferences: {
    venue: { type: Boolean, default: false },
    catering: { type: Boolean, default: false },
    photography: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    design: { type: Boolean, default: false }
  },
  
  // Additional Wedding Details
  venueType: {
    type: String,
    enum: ['garden', 'nature', ''],
    default: '',
  },
  timeOfDay: {
    type: String,
    enum: ['evening', 'afternoon', ''],
    default: '',
  },
  locationPreference: {
    type: String,
    enum: ['south', 'center', 'north', ''],
    default: '',
  },
  
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userSchema.pre('save', function(next) {
  if (this.isNew && this.authProvider === 'email' && !this.password) {
    next(new Error('Password is required for email registration'));
  } else {
    next();
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
