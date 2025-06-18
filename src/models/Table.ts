import mongoose from 'mongoose';

interface ITableDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  eventId?: string; // For shared events
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular';
  position: {
    x: number;
    y: number;
  };
  assignments: Array<{
    guestId: mongoose.Types.ObjectId;
    seatNumber?: number;
    assignedAt: Date;
  }>;
  color?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ISeatingArrangementDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  eventId?: string;
  name: string;
  description?: string;
  eventSetup: {
    guestCount: number;
    tableType: 'regular' | 'knight' | 'mix' | 'custom';
    customCapacity?: number;
    knightTablesCount?: number;
  };
  boardDimensions: {
    width: number;
    height: number;
  };
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Table Schema
const tableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventId: {
    type: String,
    required: false,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Table name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Table capacity must be at least 1'],
    max: [50, 'Table capacity cannot exceed 50']
  },
  shape: {
    type: String,
    enum: ['round', 'rectangular'],
    required: true,
    default: 'round'
  },
  position: {
    x: {
      type: Number,
      required: true,
      default: 0
    },
    y: {
      type: Number,
      required: true,
      default: 0
    }
  },
  assignments: [{
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true
    },
    seatNumber: {
      type: Number,
      required: false
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  color: {
    type: String,
    default: '#f59e0b' // Default amber color
  },
  notes: {
    type: String,
    default: ''
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
  }
}, {
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Seating Arrangement Schema
const seatingArrangementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventId: {
    type: String,
    required: false,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Arrangement name is required'],
    default: 'סידור הושבה ראשי'
  },
  description: {
    type: String,
    default: ''
  },
  eventSetup: {
    guestCount: {
      type: Number,
      required: true,
      min: 0
    },
    tableType: {
      type: String,
      enum: ['regular', 'knight', 'mix', 'custom'],
      required: true,
      default: 'regular'
    },
    customCapacity: {
      type: Number,
      required: false
    },
    knightTablesCount: {
      type: Number,
      required: false
    }
  },
  boardDimensions: {
    width: {
      type: Number,
      default: 1200
    },
    height: {
      type: Number,
      default: 800
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
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

// אופטימיזציה של אינדקסים לביצועים טובים יותר
tableSchema.index({ userId: 1, eventId: 1, isActive: 1 });
tableSchema.index({ eventId: 1, isActive: 1 });
tableSchema.index({ userId: 1, isActive: 1 });
tableSchema.index({ createdAt: -1 });
tableSchema.index({ updatedAt: -1 });

// אופטימיזציה של אינדקסים עבור SeatingArrangement
seatingArrangementSchema.index({ userId: 1, eventId: 1, isActive: 1, isDefault: 1 });
seatingArrangementSchema.index({ eventId: 1, isActive: 1, isDefault: 1 });
seatingArrangementSchema.index({ userId: 1, isActive: 1, isDefault: 1 });
seatingArrangementSchema.index({ updatedAt: -1 });

// Update timestamp when modified for both schemas
tableSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

seatingArrangementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// אופטימיזציה: הוספת middleware לביצועים
tableSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  if (this.getQuery().eventId) {
    this.hint({ eventId: 1, isActive: 1 });
  } else if (this.getQuery().userId) {
    this.hint({ userId: 1, isActive: 1 });
  }
});

seatingArrangementSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  if (this.getQuery().eventId) {
    this.hint({ eventId: 1, isActive: 1, isDefault: 1 });
  } else if (this.getQuery().userId) {
    this.hint({ userId: 1, isActive: 1, isDefault: 1 });
  }
});

// Virtuals
tableSchema.virtual('assignedGuestsCount').get(function(this: ITableDocument) {
  return this.assignments?.length || 0;
});

tableSchema.virtual('availableSeats').get(function(this: ITableDocument) {
  return this.capacity - (this.assignments?.length || 0);
});

// Static methods
tableSchema.statics.getTablesByUser = async function(userId: string, eventId?: string) {
  const query: any = { userId, isActive: true };
  if (eventId) {
    query.eventId = eventId;
  }
  return this.find(query).populate('assignments.guestId').sort({ createdAt: 1 });
};

seatingArrangementSchema.statics.getDefaultArrangement = async function(userId: string, eventId?: string) {
  const query: any = { userId, isActive: true, isDefault: true };
  if (eventId) {
    query.eventId = eventId;
  }
  return this.findOne(query);
};

// Export models
export const Table = (mongoose.models.Table as mongoose.Model<ITableDocument>) || 
  mongoose.model<ITableDocument>('Table', tableSchema);

export const SeatingArrangement = (mongoose.models.SeatingArrangement as mongoose.Model<ISeatingArrangementDocument>) || 
  mongoose.model<ISeatingArrangementDocument>('SeatingArrangement', seatingArrangementSchema);

export type { ITableDocument, ISeatingArrangementDocument }; 