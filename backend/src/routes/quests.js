import { Router } from 'express';
import multer from 'multer';
import { Quest } from '../models/Quest.js';
import { CategoryProgress } from '../models/CategoryProgress.js';
import { ensureQuestsForDay } from '../services/quests.js';
import { verifyPhoto, geminiEnabled } from '../services/gemini.js';
import { materialDrop, questCoins, verifyVitals } from '../game/rules.js';
import { getBars, awakeningFor } from '../game/userView.js';
import { config } from '../config.js';
import { httpError } from '../utils/http.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(httpError(400, 'Photo must be an image')),
});

async function findOwnQuest(req) {
  const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id }).catch(() => null);
  if (!quest) throw httpError(404, 'Quest not found');
  if (quest.date !== req.user.gameDate) throw httpError(409, 'This quest is not from today');
  return quest;
}

// GET /api/quests/today
router.get('/today', async (req, res) => {
  res.json(await ensureQuestsForDay(req.user, req.user.gameDate));
});

// POST /api/quests/:id/start -> { quest, endsAt }
router.post('/:id/start', async (req, res) => {
  const quest = await findOwnQuest(req);
  if (quest.status === 'completed') throw httpError(409, 'Quest already completed');
  if (quest.status === 'pending') {
    quest.status = 'active';
    quest.startedAt = new Date();
    quest.endsAt = new Date(Date.now() + quest.durationMinutes * 60_000);
    await quest.save();
  }
  res.json({ quest, endsAt: quest.endsAt });
});

// POST /api/quests/:id/complete
//   photo quests:   multipart/form-data with a "photo" file
//   presage quests: JSON { vitals: { restingHr, afterHr } | { breathingStart, breathingEnd } | { focusScore } }
//   self quests:    no body
router.post('/:id/complete', upload.single('photo'), async (req, res) => {
  const user = req.user;
  const quest = await findOwnQuest(req);
  if (quest.status === 'completed') throw httpError(409, 'Quest already completed');
  if (quest.status !== 'active') throw httpError(409, 'Start the quest first');
  if (!config.demoMode && quest.endsAt > new Date()) {
    throw httpError(409, 'The timer is still running', { endsAt: quest.endsAt });
  }

  // 1. Verify
  let verified = false;
  let reason = 'Completed on the honor system.';
  if (quest.verification === 'photo') {
    if (!req.file) throw httpError(400, 'This quest needs a photo');
    quest.proof.attempts = (quest.proof.attempts || 0) + 1;
    if (geminiEnabled) {
      let result;
      try {
        result = await verifyPhoto({ buffer: req.file.buffer, mimeType: req.file.mimetype, quest });
      } catch (err) {
        console.warn('Photo check failed, accepting without bonus:', err.message);
        result = { verified: false, reason: 'We could not check the photo right now, so it counts without the bonus.', accepted: true };
      }
      if (!result.verified && !result.accepted) {
        await quest.save(); // keeps the attempt count
        return res.status(422).json({ error: 'Photo not accepted', reason: result.reason, attempts: quest.proof.attempts });
      }
      verified = Boolean(result.verified);
      reason = result.reason;
    } else {
      verified = true;
      reason = 'Photo received (Gemini not configured, auto-approved).';
    }
  } else if (quest.verification === 'presage') {
    const vitals = req.body?.vitals;
    ({ verified, reason } = verifyVitals(quest.category, vitals));
    quest.proof.vitals = vitals || null;
    // Not verified still completes the quest: it just drops 1 material instead of 2.
  }

  // 2. Rewards
  const coins = questCoins(quest.difficulty, user.awakened); // x1.5 if awakened
  const materialCount = materialDrop(verified);
  const materialId = quest.rewards.materialId;
  user.coins += coins;
  user.materials.set(materialId, (user.materials.get(materialId) || 0) + materialCount);
  await user.save();

  const bar = await CategoryProgress.findOneAndUpdate(
    { userId: user._id, category: quest.category },
    { $inc: { count: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  if (bar.count > bar.target) { bar.count = bar.target; await bar.save(); } // bars stay full, never overflow

  quest.status = 'completed';
  quest.completedAt = new Date();
  quest.proof.verified = verified;
  quest.proof.reason = reason;
  quest.rewards = { coins, materialId, materialCount };
  await quest.save();

  const awakening = awakeningFor(user, await getBars(user));
  res.json({
    quest,
    rewards: { coins, materialId, materialCount, verified, reason },
    bar: { category: bar.category, count: bar.count, target: bar.target },
    totals: { coins: user.coins, materials: Object.fromEntries(user.materials) },
    awakeningReady: awakening.ready,
  });
});

export default router;
