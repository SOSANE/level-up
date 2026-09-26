// Game rules. Every function mutates the player object it is given (a fresh clone from usePlayer().update).
import { CATEGORY, MATERIAL } from './data.js';

export const RANKS = [['E', 1], ['D', 5], ['C', 10], ['B', 20], ['A', 35], ['S', 50]];
export const RANK_COLOR = { S: '#F2B84B', A: '#FF8A8A', B: '#9B7BFF', C: '#5AA9FF', D: '#5AD19A', E: '#B4BDCC' };
export const XP_PER_LEVEL = 1000;
export const REWARD = { required: { xp: 25, coins: 10, qty: 1 }, bonus: { xp: 40, coins: 20, qty: 2 }, clear: { xp: 50, coins: 25 } };
export const RIFT = { xpPerDay: 150, coinsPerDay: 25, hoursPerDay: 1 };

export const today = (d = new Date()) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD, local
export const rankOf = (level) => RANKS.filter((r) => level >= r[1]).pop()[0];
export const totalXp = (p) => (p.level - 1) * XP_PER_LEVEL + p.xp;

// Level up needs 1000 EXP and every chosen category bar full; bars reset after.
export function gain(p, xp, coins) {
  p.xp += xp;
  p.coins += coins;
  while (p.xp >= XP_PER_LEVEL && p.chosen.every((id) => (p.bars[id] || 0) >= 10)) {
    p.xp -= XP_PER_LEVEL;
    p.level++;
    p.chosen.forEach((id) => { p.bars[id] = 0; });
  }
}

// ponytail: rotation stands in for Gemini-written quests; swap in an API call here when the backend exists.
export function todaysQuests(p) {
  const n = p.chosen.length;
  if (!n) return [];
  const off = Math.floor(new Date(today()).getTime() / 864e5) % n;
  return [0, 1, 2, 3, 4].map((k) => {
    const c = CATEGORY[p.chosen[(off + k) % n]];
    const kind = k === 4 ? 'bonus' : 'required';
    return { ...c, kind, reward: { ...REWARD[kind], material: MATERIAL[c.proof] } };
  });
}

export function completeQuest(p, id) {
  const quests = todaysQuests(p);
  const q = quests.find((x) => x.id === id);
  if (!q || p.day.status[id] === 'done') return null;
  const r = { category: q.name, xp: q.reward.xp, coins: q.reward.coins, material: q.reward.material, qty: q.reward.qty, barFrom: p.bars[id] || 0 };
  p.day.status[id] = 'done';
  p.bars[id] = Math.min(10, r.barFrom + 1);
  r.barTo = p.bars[id];
  p.materials[r.material.name] = (p.materials[r.material.name] || 0) + r.qty;
  p.questsDone++;
  gain(p, r.xp, r.coins);
  if (!p.day.cleared && quests.slice(0, 4).every((x) => p.day.status[x.id] === 'done')) {
    p.day.cleared = true;
    gain(p, REWARD.clear.xp, REWARD.clear.coins);
    r.xp += REWARD.clear.xp;
    r.coins += REWARD.clear.coins;
    r.cleared = true;
  }
  p.history[today()] = p.day.cleared ? 'd' : 'p';
  return r;
}

// Banish the player to the Rift for `days` failed days in a row; records exactly what was lost.
export function sendToRift(p, days = 1) {
  const before = { total: totalXp(p), level: p.level, rank: rankOf(p.level), coins: p.coins };
  p.coins -= Math.min(p.coins, RIFT.coinsPerDay * days);
  p.xp -= RIFT.xpPerDay * days;
  while (p.xp < 0 && p.level > 1) { p.level--; p.xp += XP_PER_LEVEL; }
  p.xp = Math.max(0, p.xp);
  let hours = RIFT.hoursPerDay * days;
  if (p.items.shield) { p.items.shield--; hours = 0.5; }
  p.rift = {
    until: Date.now() + hours * 3600e3, days, seen: false,
    lost: { xp: before.total - totalXp(p), coins: before.coins - p.coins, levelFrom: before.level, levelTo: p.level, rankFrom: before.rank, rankTo: rankOf(p.level) }
  };
}

// On load: any day since the last check without all 4 required quests counts as failed.
export function checkMissedDays(p) {
  const t = today();
  if (p.onboarded && p.lastCheck < t) {
    let run = 0;
    const d = new Date(p.lastCheck + 'T00:00');
    while (today(d) < t) { run = p.history[today(d)] === 'd' ? 0 : run + 1; d.setDate(d.getDate() + 1); }
    if (run) sendToRift(p, run);
  }
  p.lastCheck = t;
}

export function streak(p) {
  // ponytail: owned streak freezes bridge gaps but are never used up; track consumption if the shop matters
  let n = 0, freezes = p.items.freeze || 0;
  const d = new Date();
  if (p.history[today(d)] !== 'd') d.setDate(d.getDate() - 1);
  for (;;) {
    const key = today(d);
    if (p.history[key] === 'd') n++;
    else if (freezes > 0 && key >= p.started) freezes--;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const mmss = (sec) => {
  const s = Math.max(0, Math.ceil(sec));
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  return (hh ? String(hh).padStart(2, '0') + ':' : '') + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
};
