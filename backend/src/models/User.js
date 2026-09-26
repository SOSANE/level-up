import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    displayName: { type: String, default: 'Hunter' },
    onboarded: { type: Boolean, default: false },

    categories: { type: [String], default: [] },      // at least 10 after onboarding
    characterId: { type: String, default: null },      // one of the 3 starters
    awakened: { type: Boolean, default: false },       // second awakening done (never lost)

    level: { type: Number, default: 1, min: 1 },
    exp: { type: Number, default: 0, min: 0 },        // progress inside the current level
    rank: { type: String, enum: ['E', 'D', 'C', 'B', 'A', 'S'], default: 'E' },
    coins: { type: Number, default: 0, min: 0 },
    materials: { type: Map, of: Number, default: {} }, // materialId -> count

    streak: { type: Number, default: 0 },
    failedDaysInRow: { type: Number, default: 0 },
    banishedUntil: { type: Date, default: null },      // in the Rift until this time
    inRift: { type: Boolean, default: false },         // true until the "returned" chapter plays

    gameDate: { type: String, required: true },        // the day the user's current quests belong to
    rotationIndex: { type: Number, default: 0 },       // which categories get quests next
    lastDayResult: { type: mongoose.Schema.Types.Mixed, default: null }, // for the Rift / rank-up screens
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
