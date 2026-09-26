import mongoose from 'mongoose';

const questSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    date: { type: String, required: true }, // game day, YYYY-MM-DD
    title: String,
    description: String,
    durationMinutes: { type: Number, default: 15 },
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    verification: { type: String, enum: ['photo', 'presage', 'self'], default: 'self' },
    status: { type: String, enum: ['pending', 'active', 'completed', 'failed'], default: 'pending' },
    startedAt: Date,
    endsAt: Date,
    completedAt: Date,
    rewards: {
      coins: Number,
      materialId: String,
      materialCount: Number, // 1 shown up front; 2 if verified at completion
    },
    proof: {
      verified: Boolean,
      reason: String,
      vitals: mongoose.Schema.Types.Mixed,
      attempts: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
questSchema.index({ userId: 1, date: 1 });

export const Quest = mongoose.model('Quest', questSchema);
