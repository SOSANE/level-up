// Gemini calls. The Gemini teammate owns the prompts; keep these three function
// signatures the same and the rest of the backend will keep working.
// Every function throws on failure; callers catch and use fallbacks.
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const ai = config.gemini.apiKey ? new GoogleGenAI({ apiKey: config.gemini.apiKey }) : null;
export const geminiEnabled = Boolean(ai);

async function askJson(contents, schema) {
  if (!ai) throw new Error('Gemini is not configured');
  const res = await ai.models.generateContent({
    model: config.gemini.model,
    contents,
    config: { responseMimeType: 'application/json', responseJsonSchema: schema },
  });
  return JSON.parse(res.text);
}

// -> [{ category, title, description, durationMinutes, difficulty }]
export async function generateQuests({ categories, rank, difficultyRange, recentTitles }) {
  const prompt = `You write daily quests for a habit app styled like an RPG.
Write exactly one quest for each of these categories: ${categories.join(', ')}.
The player is rank ${rank}. Difficulty must be between ${difficultyRange[0]} and ${difficultyRange[1]} (1 easy, 3 hard).
Quests must be safe, realistic, doable in one session, and specific. Photo-verified categories
(cooking, cleaning, organizing, reading) should say what the photo should show.
Avoid repeating these recent quests: ${recentTitles.join('; ') || 'none'}.`;
  const schema = {
    type: 'object',
    properties: {
      quests: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string', enum: categories },
            title: { type: 'string' },
            description: { type: 'string' },
            durationMinutes: { type: 'integer' },
            difficulty: { type: 'integer' },
          },
          required: ['category', 'title', 'description', 'durationMinutes', 'difficulty'],
        },
      },
    },
    required: ['quests'],
  };
  const out = await askJson(prompt, schema);
  return out.quests;
}

// -> { verified, confidence, reason }
export async function verifyPhoto({ buffer, mimeType, quest }) {
  const prompt = `A user of a habit app says this photo proves they completed the quest:
"${quest.title}: ${quest.description}".
Decide whether the photo reasonably shows the quest was done. Be fair, not strict:
approve normal real-life photos. Reject only if the photo clearly does not match.
Give a one-sentence reason addressed to the user.`;
  const schema = {
    type: 'object',
    properties: {
      verified: { type: 'boolean' },
      confidence: { type: 'number' },
      reason: { type: 'string' },
    },
    required: ['verified', 'confidence', 'reason'],
  };
  return askJson(
    [{ inlineData: { mimeType, data: buffer.toString('base64') } }, { text: prompt }],
    schema
  );
}

// -> { title, text }   (text under ~45 seconds when spoken, about 110 words)
export async function writeChapter({ type, characterName, awakened, rank, categories, streak, details }) {
  const prompt = `Write a short story chapter for a habit app told like an original anime/RPG.
The "System" narrates; the player's character is ${characterName}${awakened ? ' (awakened form)' : ''}.
Chapter type: ${type}. Player rank: ${rank}. Current streak: ${streak} days.
The player's real-life paths: ${categories.join(', ')}.
What happened: ${JSON.stringify(details || {})}.
The Rift is a dark dimension where characters are banished when their player misses a day.
Keep it under 110 words, vivid, and encouraging. Use only original characters and places.`;
  const schema = {
    type: 'object',
    properties: { title: { type: 'string' }, text: { type: 'string' } },
    required: ['title', 'text'],
  };
  return askJson(prompt, schema);
}
