// Shapes the user document into the JSON the frontend reads from GET /api/me.
import { CategoryProgress } from '../models/CategoryProgress.js';
import { CATEGORIES, CHARACTERS } from './content.js';
import { awakeningStatus, expToNext } from './rules.js';

export async function getBars(user) {
  return CategoryProgress.find({ userId: user._id }).lean();
}

export function materialsObject(user) {
  return Object.fromEntries(user.materials || new Map());
}

export function awakeningFor(user, bars) {
  return awakeningStatus({
    awakened: user.awakened,
    categories: user.categories,
    bars,
    materials: materialsObject(user),
    materialFor: (c) => CATEGORIES[c].material.id,
  });
}

export async function userView(user) {
  const bars = await getBars(user);
  const now = Date.now();
  const banished = Boolean(user.banishedUntil && user.banishedUntil.getTime() > now);
  return {
    displayName: user.displayName,
    onboarded: user.onboarded,
    character: user.characterId
      ? { id: user.characterId, name: CHARACTERS[user.characterId]?.name, awakened: user.awakened }
      : null,
    level: user.level,
    exp: user.exp,
    expToNext: expToNext(user.level),
    rank: user.rank,
    coins: user.coins,
    streak: user.streak,
    materials: materialsObject(user),
    categories: user.categories,
    bars: user.categories.map((c) => {
      const b = bars.find((x) => x.category === c) || { count: 0, target: 10 };
      return { category: c, label: CATEGORIES[c].label, count: b.count, target: b.target, materialId: CATEGORIES[c].material.id };
    }),
    banishment: {
      active: banished,
      until: banished ? user.banishedUntil : null,
      remainingMs: banished ? user.banishedUntil.getTime() - now : 0,
      failedDaysInRow: user.failedDaysInRow,
    },
    gameDate: user.gameDate,
    lastDayResult: user.lastDayResult,
    awakening: user.onboarded ? awakeningFor(user, bars) : null,
  };
}
