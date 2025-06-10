import mongoose from 'mongoose';

interface IGuestDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  sharedEventId?: string;
  name: string;
  phoneNumber?: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  isConfirmed: boolean | null;
  notes: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IGuestModel extends mongoose.Model<IGuestDocument> {
  getOrganizedGuestList(userId: string, sharedGuests?: IGuestDocument[]): Promise<{
    userId: string;
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    sides: {
      'חתן': IGuestDocument[];
      'כלה': IGuestDocument[];
      'משותף': IGuestDocument[];
    };
  }>;
}

const guestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sharedEventId: {
    type: String,
    required: false,
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
  group: {
    type: String,
    required: false,
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

// Add compound index for better organization and query performance
guestSchema.index({ userId: 1, side: 1, isConfirmed: 1 });
guestSchema.index({ sharedEventId: 1, side: 1 }); // Add index for shared event queries

// Virtual for total number of guests for this user
guestSchema.virtual('totalGuests').get(function(this: IGuestDocument) {
  return this.numberOfGuests || 1;
});

// Static method to get guests organized by user
guestSchema.statics.getOrganizedGuestList = async function(userId: string, sharedGuests?: IGuestDocument[]) {
  // Use provided guests (for shared events) or fetch guests just for this user
  let guests;
  
  if (sharedGuests) {
    // If shared guests were provided, use them directly
    guests = sharedGuests;
  } else {
    // Otherwise look up by userId only
    guests = await this.find({ userId }).sort({ side: 1, isConfirmed: -1, name: 1 });
  }
  
  const organizedGuests = {
    userId,
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
    sides: {
      'חתן': [] as IGuestDocument[],
      'כלה': [] as IGuestDocument[],
      'משותף': [] as IGuestDocument[]
    }
  };

  guests.forEach((guest: IGuestDocument) => {
    // Add to side-specific array
    organizedGuests.sides[guest.side].push(guest);
    
    // Update counters
    organizedGuests.total += guest.numberOfGuests;
    if (guest.isConfirmed === true) {
      organizedGuests.confirmed += guest.numberOfGuests;
    } else if (guest.isConfirmed === false) {
      organizedGuests.declined += guest.numberOfGuests;
    } else {
      organizedGuests.pending += guest.numberOfGuests;
    }
  });

  return organizedGuests;
};

// Create model (or use existing model)
export default (mongoose.models.Guest as IGuestModel) || mongoose.model<IGuestDocument, IGuestModel>('Guest', guestSchema); 