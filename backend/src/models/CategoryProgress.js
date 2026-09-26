import mongoose from 'mongoose';
import { BAR_TARGET } from '../game/rules.js';

const categoryProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    count: { type: Number, default: 0, min: 0 },   // consecutive completions
    target: { type: Number, default: BAR_TARGET },
  },
  { timestamps: true }
);
categoryProgressSchema.index({ userId: 1, category: 1 }, { unique: true });

export const CategoryProgress = mongoose.model('CategoryProgress', categoryProgressSchema);
