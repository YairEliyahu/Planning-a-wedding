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
  findOptimized(query: any): mongoose.Query<IGuestDocument[], IGuestDocument>;
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
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 10
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
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  group: {
    type: String,
    required: false,
    default: '',
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  // Seating arrangement fields
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: false
  },
  seatNumber: {
    type: Number,
    required: false
  },
  specialNeeds: {
    type: String,
    required: false,
    default: '',
    maxlength: [200, 'Special needs cannot exceed 200 characters']
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
  toObject: { getters: true, virtuals: true },
  // אופטימיזציות ביצועים
  minimize: false,
  versionKey: false
});

// Update timestamp when modified
guestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// אופטימיזציה של אינדקסים לביצועים טובים יותר
guestSchema.index({ userId: 1, side: 1, isConfirmed: 1 });
guestSchema.index({ sharedEventId: 1, side: 1, updatedAt: -1 });
guestSchema.index({ userId: 1, updatedAt: -1 });
guestSchema.index({ sharedEventId: 1, updatedAt: -1 });
guestSchema.index({ name: 1, sharedEventId: 1 }); // לחיפוש כפילויות
guestSchema.index({ createdAt: -1 }); // למיון כרונולוגי

// Virtual for total number of guests for this user
guestSchema.virtual('totalGuests').get(function(this: IGuestDocument) {
  return this.numberOfGuests || 1;
});

// אופטימיזציה של שאילתות עם פרויקציה מוגבלת
guestSchema.statics.findOptimized = function(query: any) {
  return this.find(query)
    .select('name phoneNumber numberOfGuests side isConfirmed notes group userId sharedEventId updatedAt createdAt')
    .lean();
};

// Static method to get guests organized by user (optimized version)
guestSchema.statics.getOrganizedGuestList = async function(userId: string, sharedGuests?: IGuestDocument[]) {
  let guests;
  
  if (sharedGuests) {
    guests = sharedGuests;
  } else {
    // אופטימיזציה: השתמש בפרויקציה מוגבלת ובמיון יעיל
    guests = await this.find({ userId })
      .select('side isConfirmed numberOfGuests name group')
      .sort({ side: 1, isConfirmed: -1, name: 1 })
      .lean();
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

  // אופטימיזציה: לולאה אחת לכל הסטטיסטיקות
  for (const guest of guests) {
    organizedGuests.sides[guest.side].push(guest);
    
    const guestCount = guest.numberOfGuests;
    organizedGuests.total += guestCount;
    
    if (guest.isConfirmed === true) {
      organizedGuests.confirmed += guestCount;
    } else if (guest.isConfirmed === false) {
      organizedGuests.declined += guestCount;
    } else {
      organizedGuests.pending += guestCount;
    }
  }

  return organizedGuests;
};

// אופטימיזציה: הוספת middleware לביצועים
guestSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  // הוספת hint לאינדקס המתאים
  if (this.getQuery().sharedEventId) {
    this.hint({ sharedEventId: 1, updatedAt: -1 });
  } else if (this.getQuery().userId) {
    this.hint({ userId: 1, updatedAt: -1 });
  }
});

// Create model (or use existing model)
export default (mongoose.models.Guest as IGuestModel) || mongoose.model<IGuestDocument, IGuestModel>('Guest', guestSchema); 