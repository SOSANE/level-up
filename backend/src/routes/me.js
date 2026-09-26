import { Router } from 'express';
import { userView } from '../game/userView.js';
import { createChapter } from '../services/story.js';

const router = Router();

// GET /api/me -> everything the HUD, dashboard, inventory, and Rift screen need.
router.get('/', async (req, res) => {
  const user = req.user;
  // Banishment over? Play the "returned" chapter once.
  if (user.inRift && (!user.banishedUntil || user.banishedUntil <= new Date())) {
    user.inRift = false;
    await user.save();
    await createChapter(user, 'returned');
  }
  res.json(await userView(user));
});

export default router;
