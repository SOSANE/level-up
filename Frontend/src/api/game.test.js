// Run: npm test
import assert from 'node:assert/strict';
import { addQuest, canAddQuest, checkMissedDays, completeQuest, rankOf, sendToRift, stats, streak, today, todaysQuests } from './game.js';
import { CATEGORIES } from './data.js';
import { showcasePlayer } from './demo.js';

const player = () => ({
  level: 1, xp: 0, coins: 50, chosen: CATEGORIES.slice(0, 10).map((c) => c.id), bars: {}, materials: {},
  history: {}, items: {}, questsDone: 0, started: today(), lastCheck: today(), onboarded: true,
  day: { date: today(), status: {}, cleared: false }, rift: null
});

// Quest rewards: coins, material, bar; 4 required quests clear the day with a bonus.
const p = player();
const qs = todaysQuests(p);
assert.equal(qs.length, 5);
const r = completeQuest(p, qs[0].id);
assert.deepEqual([r.coins, r.qty, r.barFrom, r.barTo], [10, 1, 0, 1]);
assert.equal(stats(p).find((x) => x.name === r.stat).value, 12, 'quest trains its stat');
assert.equal(completeQuest(p, qs[0].id), null, 'cannot claim twice');
qs.slice(1, 4).forEach((q) => completeQuest(p, q.id));
assert.ok(p.day.cleared);
assert.equal(p.coins, 50 + 40 + 25);
assert.equal(p.history[today()], 'd');

// Extra quests: only once everything is done, one new category each, never a repeat.
assert.equal(canAddQuest(p), false, 'bonus quest still open');
completeQuest(p, qs[4].id);
assert.ok(canAddQuest(p));
addQuest(p);
const more = todaysQuests(p);
assert.equal(more.length, 6);
assert.equal(more[5].kind, 'extra');
assert.equal(canAddQuest(p), false, 'new extra quest not done yet');
assert.equal(completeQuest(p, more[5].id).coins, 8);
for (let k = 0; k < 10; k++) { addQuest(p); todaysQuests(p).forEach((q) => completeQuest(p, q.id)); }
assert.equal(todaysQuests(p).length, 10, 'capped at the number of chosen categories');
assert.equal(new Set(todaysQuests(p).map((q) => q.id)).size, 10);
assert.equal(canAddQuest(p), false);

// Rift: losses are exact and can drop level and rank.
const q = { ...player(), level: 10, xp: 100, coins: 30 };
sendToRift(q, 2);
assert.deepEqual(q.rift.lost, { xp: 300, coins: 30, levelFrom: 10, levelTo: 9, rankFrom: 'C', rankTo: 'D' });
assert.equal(q.xp, 800);
assert.equal(rankOf(q.level), 'D');

// Two missed days since last check -> banished for 2 days.
const m = player();
const d = new Date(); d.setDate(d.getDate() - 2);
m.lastCheck = today(d);
checkMissedDays(m);
assert.equal(m.rift.days, 2);
assert.equal(m.lastCheck, today());

// Judge demo: a Rank S version of the same player, built without touching the real one.
const real = player();
const before = JSON.stringify(real);
const demo = showcasePlayer({ ...real, name: 'Soumeya' });
assert.equal(rankOf(demo.level), 'S');
assert.equal(demo.name, 'Soumeya');
assert.ok(demo.onboarded && demo.demo);
assert.ok(streak(demo) >= 100, `streak ${streak(demo)}`);
assert.equal(Object.values(demo.day.status).filter((v) => v === 'done').length, 2);
assert.equal(JSON.stringify(real), before, 'real player unchanged');

console.log('game rules ok');
