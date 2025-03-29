import mongoose from 'mongoose';

const weddingPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  venueType: {
    type: String,
    enum: ['garden', 'nature', ''],
    default: ''
  },
  timeOfDay: {
    type: String,
    enum: ['evening', 'afternoon', ''],
    default: ''
  },
  location: {
    type: String,
    enum: ['south', 'center', 'north', ''],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

weddingPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.WeddingPreferences || mongoose.model('WeddingPreferences', weddingPreferencesSchema); 