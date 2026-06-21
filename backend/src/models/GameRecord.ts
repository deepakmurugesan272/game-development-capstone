import mongoose, { Schema } from 'mongoose';

const GameRecordSchema = new Schema({
  gameType: { type: String, required: true, enum: ['pallanguzhi', 'aadupuli', 'paramapadham', 'dayakattai'] },
  players: [{ type: String }], // user IDs or usernames, or 'AI' / 'Guest'
  winner: { type: String }, // username of the winner, or 'Draw' / 'AI'
  scores: { type: Map, of: Number }, // player_username -> score
  durationSeconds: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'abandoned'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.GameRecord || mongoose.model('GameRecord', GameRecordSchema);
