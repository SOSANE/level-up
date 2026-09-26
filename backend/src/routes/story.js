import { Router } from 'express';
import { StoryChapter } from '../models/StoryChapter.js';

const router = Router();

// GET /api/story -> chapters, newest first. audioStatus "pending" means poll again in a few seconds.
router.get('/', async (req, res) => {
  const chapters = await StoryChapter.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json(chapters);
});

export default router;
