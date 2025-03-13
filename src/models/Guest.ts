import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Guest name is required']
  },
  phoneNumber: {
    type: String,
    required: false
  },
  numberOfGuests: {
    type: Number,
    required: true,
    default: 1
  },
  side: {
    type: String,
    enum: ['חתן', 'כלה', 'משותף'],
    required: true,
    default: 'משותף'
  },
  isConfirmed: {
    type: Boolean,
    default: null
  },
  notes: {
    type: String,
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
}, {
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Update timestamp when modified
guestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add index for better query performance
guestSchema.index({ userId: 1 });

// Create model (or use existing model)
export default mongoose.models.Guest || mongoose.model('Guest', guestSchema); 