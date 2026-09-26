// Builds each day's 3 quests: Gemini first, fallback list if it fails.
import { Quest } from '../models/Quest.js';
import { CATEGORIES, FALLBACK_QUESTS } from '../game/content.js';
import { QUESTS_PER_DAY, clampDifficulty, difficultyRangeForRank, questCoins } from '../game/rules.js';
import { generateQuests } from './gemini.js';

// Rotate through the user's categories so each one comes up regularly.
function pickCategories(user) {
  const cats = user.categories;
  const picked = [];
  for (let i = 0; i < Math.min(QUESTS_PER_DAY, cats.length); i++) {
    picked.push(cats[(user.rotationIndex + i) % cats.length]);
  }
  user.rotationIndex = (user.rotationIndex + QUESTS_PER_DAY) % cats.length;
  return picked;
}

function fallbackQuest(category, range) {
  const options = FALLBACK_QUESTS[category];
  const fitting = options.filter(([, , , d]) => d >= range[0] && d <= range[1]);
  const [title, description, durationMinutes, difficulty] =
    (fitting.length ? fitting : options)[Math.floor(Math.random() * (fitting.length || options.length))];
  return { category, title, description, durationMinutes, difficulty };
}

export async function ensureQuestsForDay(user, date) {
  const existing = await Quest.find({ userId: user._id, date });
  if (existing.length) return existing;

  const categories = pickCategories(user);
  const range = difficultyRangeForRank(user.rank);
  const recent = await Quest.find({ userId: user._id }).sort({ createdAt: -1 }).limit(12).select('title');

  let drafts;
  try {
    drafts = await generateQuests({
      categories, rank: user.rank, difficultyRange: range, recentTitles: recent.map((q) => q.title),
    });
    // Never trust the model blindly: one valid quest per picked category, or fall back for that category.
    drafts = categories.map((c) => {
      const d = drafts.find((q) => q.category === c && q.title && q.description);
      return d
        ? { ...d, durationMinutes: Math.min(180, Math.max(5, Number(d.durationMinutes) || 15)) }
        : fallbackQuest(c, range);
    });
  } catch (err) {
    if (err.message !== 'Gemini is not configured') console.warn('Quest fallback:', err.message);
    drafts = categories.map((c) => fallbackQuest(c, range));
  }

  const docs = drafts.map((d) => {
    const difficulty = Math.min(range[1], Math.max(range[0], clampDifficulty(d.difficulty)));
    return {
      userId: user._id,
      date,
      category: d.category,
      title: d.title,
      description: d.description,
      durationMinutes: d.durationMinutes,
      difficulty,
      verification: CATEGORIES[d.category].verification, // decided by us, not the model
      rewards: {
        coins: questCoins(difficulty, user.awakened),
        materialId: CATEGORIES[d.category].material.id,
        materialCount: 1,
      },
    };
  });
  await user.save(); // saves rotationIndex
  return Quest.insertMany(docs);
}
