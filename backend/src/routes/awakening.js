import { Router } from 'express';
import { CATEGORIES } from '../game/content.js';
import { AWAKENING_MATERIALS_PER_CATEGORY } from '../game/rules.js';
import { getBars, awakeningFor, userView } from '../game/userView.js';
import { createChapter } from '../services/story.js';
import { httpError } from '../utils/http.js';

const router = Router();

// POST /api/awakening -> uses up the materials, transforms the character, returns the chapter.
router.post('/', async (req, res) => {
  const user = req.user;
  if (user.awakened) throw httpError(409, 'Already awakened');

  const status = awakeningFor(user, await getBars(user));
  if (!status.ready) throw httpError(400, 'Not ready for the second awakening', status);

  for (const c of user.categories) {
    const id = CATEGORIES[c].material.id;
    user.materials.set(id, user.materials.get(id) - AWAKENING_MATERIALS_PER_CATEGORY);
  }
  user.awakened = true; // permanent; coins are x1.5 from now on
  await user.save();

  const chapter = await createChapter(user, 'awakening');
  res.json({ me: await userView(user), chapter });
});

export default router;
