import mongoose, { Schema } from 'mongoose';

const GameStatsSchema = new Schema({
  played: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 }
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: 'avatar1' }, // standard avatar selections
  title: { type: String, default: 'Heritage Learner' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 100 },
  gameStats: {
    pallanguzhi: { type: GameStatsSchema, default: () => ({}) },
    aadupuli: { type: GameStatsSchema, default: () => ({}) },
    paramapadham: { type: GameStatsSchema, default: () => ({}) },
    dayakattai: { type: GameStatsSchema, default: () => ({}) }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
