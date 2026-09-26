// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  questCoins, materialDrop, addExp, removeExp, rankForLevel, perfectDayExp,
  applyPerfectDay, applyFailedDay, verifyVitals, awakeningStatus, lastLevelOfRank,
} from '../src/game/rules.js';

const fresh = { level: 1, exp: 0, coins: 0, streak: 0, failedDaysInRow: 0 };

test('coins by difficulty, x1.5 when awakened', () => {
  assert.equal(questCoins(1, false), 10);
  assert.equal(questCoins(3, false), 30);
  assert.equal(questCoins(2, true), 30);
});

test('verified quests drop 2 materials', () => {
  assert.equal(materialDrop(true), 2);
  assert.equal(materialDrop(false), 1);
});

test('ranks follow level', () => {
  assert.equal(rankForLevel(1), 'E');
  assert.equal(rankForLevel(4), 'E');
  assert.equal(rankForLevel(5), 'D');
  assert.equal(rankForLevel(25), 'S');
  assert.equal(lastLevelOfRank('E'), 4);
  assert.equal(lastLevelOfRank('S'), null);
});

test('EXP carries over across level-ups', () => {
  assert.deepEqual(addExp(1, 90, 60), { level: 2, exp: 50 });
  assert.deepEqual(addExp(1, 0, 350), { level: 3, exp: 50 }); // 100 + 200 used, 50 left
});

test('EXP loss comes out of the level below, floor at level 1', () => {
  assert.deepEqual(removeExp(3, 20, 50), { level: 2, exp: 170 });
  assert.deepEqual(removeExp(1, 30, 50), { level: 1, exp: 0 });
});

test('perfect-day bonus caps at +100', () => {
  assert.equal(perfectDayExp(1), 60);
  assert.equal(perfectDayExp(10), 150);
  assert.equal(perfectDayExp(30), 150);
});

test('a player who never misses reaches rank D in about 10 days', () => {
  let s = fresh;
  let day = 0;
  while (rankForLevel(s.level) === 'E') {
    s = applyPerfectDay(s).state;
    day++;
  }
  assert.equal(day, 10);
});

test('failed days banish longer and cost more', () => {
  const start = { ...fresh, level: 3, exp: 20, coins: 101, streak: 5 };
  const first = applyFailedDay(start);
  assert.equal(first.summary.banishHours, 1);
  assert.equal(first.summary.expLost, 50);
  assert.equal(first.summary.coinsLost, 20);
  assert.equal(first.state.coins, 81);
  assert.equal(first.state.streak, 0);
  assert.equal(first.state.level, 2);

  const second = applyFailedDay(first.state);
  assert.equal(second.summary.banishHours, 2);
  assert.equal(second.summary.expLost, 75);

  const recovered = applyPerfectDay(second.state);
  assert.equal(recovered.state.failedDaysInRow, 0);
});

test('failed day can drop the rank', () => {
  const r = applyFailedDay({ ...fresh, level: 5, exp: 10 });
  assert.equal(r.summary.rankBefore, 'D');
  assert.equal(r.summary.rankAfter, 'E');
});

test('vitals verification', () => {
  assert.equal(verifyVitals('strength_training', { restingHr: 70, afterHr: 95 }).verified, true);
  assert.equal(verifyVitals('strength_training', { restingHr: 70, afterHr: 75 }).verified, false);
  assert.equal(verifyVitals('yoga', { breathingStart: 16, breathingEnd: 10 }).verified, true);
  assert.equal(verifyVitals('studying', { focusScore: 0.5 }).verified, false);
  assert.equal(verifyVitals('yoga', undefined).verified, false);
});

test('awakening needs full bars and 3 materials per category', () => {
  const base = {
    awakened: false,
    categories: ['a', 'b'],
    materialFor: (c) => `m_${c}`,
  };
  const notReady = awakeningStatus({
    ...base,
    bars: [{ category: 'a', count: 10, target: 10 }, { category: 'b', count: 9, target: 10 }],
    materials: { m_a: 3, m_b: 1 },
  });
  assert.equal(notReady.ready, false);
  assert.deepEqual(notReady.missingBars, ['b']);
  assert.deepEqual(notReady.missingMaterials, { m_b: 2 });

  const ready = awakeningStatus({
    ...base,
    bars: [{ category: 'a', count: 10, target: 10 }, { category: 'b', count: 10, target: 10 }],
    materials: { m_a: 3, m_b: 5 },
  });
  assert.equal(ready.ready, true);
});
