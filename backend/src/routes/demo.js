// Demo-only shortcuts. Mounted only when DEMO_MODE=true.
import { Router } from 'express';
import { CategoryProgress } from '../models/CategoryProgress.js';
import { Quest } from '../models/Quest.js';
import { CATEGORIES } from '../game/content.js';
import { AWAKENING_MATERIALS_PER_CATEGORY, expToNext, lastLevelOfRank, rankForLevel } from '../game/rules.js';
import { processDay } from '../game/endOfDay.js';
import { userView } from '../game/userView.js';
import { httpError } from '../utils/http.js';

const router = Router();

// POST /api/demo/next-day  { outcome?: "auto" | "perfect" | "fail" }
// auto = judge today's quests as they are (any miss -> banished).
router.post('/next-day', async (req, res) => {
  const outcome = req.body?.outcome;
  if (outcome && !['auto', 'perfect', 'fail'].includes(outcome)) throw httpError(400, 'outcome must be auto, perfect, or fail');
  const result = await processDay(req.user, { forceOutcome: outcome === 'auto' ? undefined : outcome });
  res.json({ result, me: await userView(req.user) });
});

// POST /api/demo/add-exp -> last level of the current rank, 1 EXP short of the next level,
// so the next perfect day triggers a rank-up.
router.post('/add-exp', async (req, res) => {
  const user = req.user;
  const top = lastLevelOfRank(user.rank);
  if (top === null) throw httpError(400, 'Already rank S');
  user.level = top;
  user.exp = expToNext(top) - 1;
  user.rank = rankForLevel(top);
  await user.save();
  res.json(await userView(user));
});

// POST /api/demo/fill-bars -> every bar full except one of today's unfinished quests (one short),
// plus enough materials. Finishing that quest makes the awakening ready.
router.post('/fill-bars', async (req, res) => {
  const user = req.user;
  const open = await Quest.findOne({ userId: user._id, date: user.gameDate, status: { $ne: 'completed' } });
  const bars = await CategoryProgress.find({ userId: user._id });
  for (const bar of bars) {
    bar.count = open && bar.category === open.category ? bar.target - 1 : bar.target;
    await bar.save();
  }
  for (const c of user.categories) {
    const id = CATEGORIES[c].material.id;
    user.materials.set(id, Math.max(user.materials.get(id) || 0, AWAKENING_MATERIALS_PER_CATEGORY));
  }
  await user.save();
  res.json(await userView(user));
});

export default router;
