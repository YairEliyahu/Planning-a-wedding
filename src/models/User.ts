import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // יהיה required: false כי משתמשים שמתחברים דרך גוגל/פייסבוק לא צריכים סיסמה
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  providerId: {
    type: String,
    // המזהה הייחודי מהספק (גוגל/פייסבוק)
  },
  profilePicture: {
    type: String,
    // URL לתמונת הפרופיל (יכול להגיע מהספק החברתי)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  displayName: {
    type: String,
    required: false
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
