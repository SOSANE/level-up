// Run: npm test
import assert from 'node:assert/strict';
import { checkMissedDays, completeQuest, rankOf, sendToRift, today, todaysQuests } from './game.js';
import { CATEGORIES } from './data.js';

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
assert.equal(completeQuest(p, qs[0].id), null, 'cannot claim twice');
qs.slice(1, 4).forEach((q) => completeQuest(p, q.id));
assert.ok(p.day.cleared);
assert.equal(p.coins, 50 + 40 + 25);
assert.equal(p.history[today()], 'd');

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

console.log('game rules ok');
