// Closes out a user's game day: perfect day -> EXP (maybe rank-up); any miss -> banished to the Rift.
// Used by the midnight cron job and by POST /api/demo/next-day.
import { Quest } from '../models/Quest.js';
import { CategoryProgress } from '../models/CategoryProgress.js';
import { applyFailedDay, applyPerfectDay, rankForLevel, rankIndex } from './rules.js';
import { ensureQuestsForDay } from '../services/quests.js';
import { createChapter } from '../services/story.js';
import { addDays } from '../utils/dates.js';

// forceOutcome: 'perfect' | 'fail' | undefined (demo mode only)
export async function processDay(user, { nextDate, forceOutcome } = {}) {
  const date = user.gameDate;
  const quests = await Quest.find({ userId: user._id, date });

  if (forceOutcome === 'perfect') {
    await Quest.updateMany(
      { userId: user._id, date, status: { $ne: 'completed' } },
      { status: 'completed', completedAt: new Date() }
    );
    quests.forEach((q) => (q.status = 'completed'));
  }

  const missed = quests.filter((q) => q.status !== 'completed');
  const perfect = forceOutcome !== 'fail' && quests.length > 0 && missed.length === 0;

  // Missed quests fail, and their category bars reset to 0 (the "consecutive" rule).
  if (missed.length) {
    await Quest.updateMany({ _id: { $in: missed.map((q) => q._id) } }, { status: 'failed' });
    await CategoryProgress.updateMany(
      { userId: user._id, category: { $in: missed.map((q) => q.category) } },
      { count: 0 }
    );
  }

  const before = {
    level: user.level, exp: user.exp, coins: user.coins,
    streak: user.streak, failedDaysInRow: user.failedDaysInRow,
  };
  const { state, summary } = perfect ? applyPerfectDay(before) : applyFailedDay(before);

  Object.assign(user, state);
  user.rank = rankForLevel(user.level);
  if (!perfect) user.inRift = true;
  user.lastDayResult = { ...summary, date, missedCategories: missed.map((q) => q.category) };
  user.gameDate = nextDate || addDays(date, 1);
  await user.save();

  // Story: one chapter per event.
  if (!perfect) {
    await createChapter(user, 'banished', summary);
  } else if (rankIndex(summary.rankAfter) > rankIndex(summary.rankBefore)) {
    await createChapter(user, 'rankUp', summary);
  }

  await ensureQuestsForDay(user, user.gameDate);
  return user.lastDayResult;
}
