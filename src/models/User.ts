import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  fullName: string;
  age: number;
  gender: string;
  location: string;
  phone: string;
  idNumber: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: [true, 'Full name is required'] },
  age: { type: Number, required: [true, 'Age is required'] },
  gender: { type: String, required: [true, 'Gender is required'] },
  location: { type: String, required: [true, 'Location is required'] },
  phone: { type: String, required: [true, 'Phone number is required'] },
  idNumber: { type: String, required: [true, 'ID number is required'] },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: [true, 'Password is required'] }
}, {
  timestamps: true,
  collection: 'users'
});

// אינדקס לא�ייל
userSchema.index({ email: 1 }, { unique: true });

// בדיקה אם המודל כבר קיים
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
