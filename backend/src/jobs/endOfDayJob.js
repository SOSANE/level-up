// Runs every night at midnight (server time zone) and once at startup to catch up after downtime.
import cron from 'node-cron';
import { User } from '../models/User.js';
import { processDay } from '../game/endOfDay.js';
import { todayStr } from '../utils/dates.js';

export async function runEndOfDay() {
  const today = todayStr();
  // Users whose game day is behind the real date. (Demo mode can push a user ahead; they are skipped.)
  const users = await User.find({ onboarded: true, gameDate: { $lt: today } });
  for (const user of users) {
    try {
      // If the server was down for several days, each missed day is processed separately.
      while (user.gameDate < today) {
        const next = user.gameDate;
        await processDay(user, {});
        if (user.gameDate === next) break; // safety: never loop forever
      }
    } catch (err) {
      console.error(`End of day failed for ${user._id}:`, err);
    }
  }
  if (users.length) console.log(`End of day processed for ${users.length} user(s)`);
}

export function startEndOfDayJob() {
  cron.schedule('0 0 * * *', () => runEndOfDay().catch((e) => console.error('End-of-day job error:', e)));
  runEndOfDay().catch((e) => console.error('Startup catch-up error:', e));
}
