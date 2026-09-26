// All game math lives here as pure functions (no database), so it is easy to test and tune.
// The numbers match the "Game rules" section of the team plan.

export const BAR_TARGET = 10;
export const QUESTS_PER_DAY = 3;
export const AWAKENING_MATERIALS_PER_CATEGORY = 3;
export const AWAKENED_COIN_MULTIPLIER = 1.5;
const COINS_BY_DIFFICULTY = { 1: 10, 2: 20, 3: 30 };

const RANKS = [
  { rank: 'E', minLevel: 1 },
  { rank: 'D', minLevel: 5 },
  { rank: 'C', minLevel: 10 },
  { rank: 'B', minLevel: 15 },
  { rank: 'A', minLevel: 20 },
  { rank: 'S', minLevel: 25 },
];

export function clampDifficulty(d) {
  return Math.min(3, Math.max(1, Math.round(Number(d) || 1)));
}

// ---------- quest rewards ----------
export function questCoins(difficulty, awakened) {
  const base = COINS_BY_DIFFICULTY[clampDifficulty(difficulty)];
  return Math.round(base * (awakened ? AWAKENED_COIN_MULTIPLIER : 1));
}

export function materialDrop(verified) {
  return verified ? 2 : 1;
}

// ---------- levels and ranks ----------
export function expToNext(level) {
  return 100 * level;
}

export function rankForLevel(level) {
  let current = 'E';
  for (const r of RANKS) if (level >= r.minLevel) current = r.rank;
  return current;
}

export function rankIndex(rank) {
  return RANKS.findIndex((r) => r.rank === rank);
}

// Highest level that still belongs to the given rank (used by demo mode).
export function lastLevelOfRank(rank) {
  const i = rankIndex(rank);
  return i < RANKS.length - 1 ? RANKS[i + 1].minLevel - 1 : null; // S has no top
}

// Quest difficulty grows with rank: E -> 1, D -> 1-2, C/B -> 2, A/S -> 2-3.
export function difficultyRangeForRank(rank) {
  const i = rankIndex(rank);
  if (i <= 0) return [1, 1];
  if (i === 1) return [1, 2];
  if (i <= 3) return [2, 2];
  return [2, 3];
}

export function addExp(level, exp, amount) {
  exp += amount;
  while (exp >= expToNext(level)) {
    exp -= expToNext(level);
    level += 1;
  }
  return { level, exp };
}

// Leftover loss comes out of the level below. Floor: level 1 with 0 EXP.
export function removeExp(level, exp, amount) {
  exp -= amount;
  while (exp < 0) {
    if (level === 1) return { level: 1, exp: 0 };
    level -= 1;
    exp += expToNext(level);
  }
  return { level, exp };
}

// ---------- end of day ----------
// state: { level, exp, coins, streak, failedDaysInRow }
export function perfectDayExp(newStreak) {
  return 50 + Math.min(10 * newStreak, 100);
}

export function applyPerfectDay(state) {
  const streak = state.streak + 1;
  const gained = perfectDayExp(streak);
  const { level, exp } = addExp(state.level, state.exp, gained);
  return {
    state: { ...state, level, exp, streak, failedDaysInRow: 0 },
    summary: {
      outcome: 'perfect', expGained: gained, streak,
      levelBefore: state.level, levelAfter: level,
      rankBefore: rankForLevel(state.level), rankAfter: rankForLevel(level),
    },
  };
}

export function applyFailedDay(state, now = new Date()) {
  const failedDaysInRow = state.failedDaysInRow + 1;
  const banishHours = failedDaysInRow;                 // 1h, then +1h per extra failed day
  const expLost = 50 + 25 * (failedDaysInRow - 1);
  const coinsLost = Math.floor(state.coins * 0.2);
  const { level, exp } = removeExp(state.level, state.exp, expLost);
  return {
    state: {
      ...state, level, exp,
      coins: Math.max(0, state.coins - coinsLost),
      streak: 0,
      failedDaysInRow,
      banishedUntil: new Date(now.getTime() + banishHours * 3600_000),
    },
    summary: {
      outcome: 'failed', banishHours, expLost, coinsLost, failedDaysInRow,
      levelBefore: state.level, levelAfter: level,
      rankBefore: rankForLevel(state.level), rankAfter: rankForLevel(level),
    },
  };
}

// ---------- vitals (Presage) ----------
// vitals come from the companion app. Missing vitals -> not verified (quest still counts, 1 material).
export function verifyVitals(category, vitals) {
  if (!vitals) return { verified: false, reason: 'No vitals received; counted without verification.' };
  if (category === 'strength_training') {
    const rise = Number(vitals.afterHr) - Number(vitals.restingHr);
    return rise >= 15
      ? { verified: true, reason: `Heart rate rose ${Math.round(rise)} bpm above resting.` }
      : { verified: false, reason: `Heart rate only rose ${Math.round(rise) || 0} bpm (needs 15).` };
  }
  if (category === 'yoga') {
    const ok = Number(vitals.breathingEnd) < Number(vitals.breathingStart);
    return ok
      ? { verified: true, reason: 'Breathing slowed during the session.' }
      : { verified: false, reason: 'Breathing did not slow down.' };
  }
  if (category === 'studying') {
    const ok = Number(vitals.focusScore) >= 0.7;
    return ok
      ? { verified: true, reason: 'Stayed focused for the session.' }
      : { verified: false, reason: 'Focus dropped too often.' };
  }
  return { verified: false, reason: 'This category is not verified by vitals.' };
}

// ---------- second awakening ----------
// bars: [{ category, count, target }], materials: { materialId: count }, materialFor: category -> materialId
export function awakeningStatus({ awakened, categories, bars, materials, materialFor }) {
  if (awakened) return { ready: false, done: true, missingBars: [], missingMaterials: {} };
  const barByCat = Object.fromEntries(bars.map((b) => [b.category, b]));
  const missingBars = categories.filter((c) => !barByCat[c] || barByCat[c].count < barByCat[c].target);
  const missingMaterials = {};
  for (const c of categories) {
    const id = materialFor(c);
    const have = materials[id] || 0;
    if (have < AWAKENING_MATERIALS_PER_CATEGORY) missingMaterials[id] = AWAKENING_MATERIALS_PER_CATEGORY - have;
  }
  const ready = missingBars.length === 0 && Object.keys(missingMaterials).length === 0;
  return { ready, done: false, missingBars, missingMaterials };
}
