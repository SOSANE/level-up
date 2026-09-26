import { Router } from 'express';
import { CategoryProgress } from '../models/CategoryProgress.js';
import { CATEGORY_IDS, CHARACTERS } from '../game/content.js';
import { ensureQuestsForDay } from '../services/quests.js';
import { createChapter } from '../services/story.js';
import { userView } from '../game/userView.js';
import { httpError } from '../utils/http.js';
import { todayStr } from '../utils/dates.js';

const router = Router();

// POST /api/onboarding  { categories: [...], characterId, displayName? }
router.post('/', async (req, res) => {
  const user = req.user;
  if (user.onboarded) throw httpError(409, 'Already onboarded');

  const { categories, characterId, displayName } = req.body || {};
  const unique = [...new Set(Array.isArray(categories) ? categories : [])];
  const invalid = unique.filter((c) => !CATEGORY_IDS.includes(c));
  if (invalid.length) throw httpError(400, `Unknown categories: ${invalid.join(', ')}`, { allowed: CATEGORY_IDS });
  if (unique.length < 10) throw httpError(400, `Pick at least 10 categories (you picked ${unique.length})`);
  if (!CHARACTERS[characterId]) throw httpError(400, 'Pick one of the starter characters', { allowed: Object.keys(CHARACTERS) });

  user.categories = unique;
  user.characterId = characterId;
  if (displayName) user.displayName = String(displayName).slice(0, 40);
  user.onboarded = true;
  user.gameDate = todayStr();
  await user.save();

  await CategoryProgress.insertMany(unique.map((category) => ({ userId: user._id, category })));
  const quests = await ensureQuestsForDay(user, user.gameDate);
  const chapter = await createChapter(user, 'intro'); // the first awakening

  res.status(201).json({ me: await userView(user), quests, chapter });
});

export default router;
