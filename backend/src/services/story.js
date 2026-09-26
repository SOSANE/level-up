// Creates story chapters: text now (Gemini or fallback), audio in the background (ElevenLabs).
import { StoryChapter } from '../models/StoryChapter.js';
import { CHARACTERS } from '../game/content.js';
import { writeChapter } from './gemini.js';
import { synthesize, voiceEnabled } from './voice.js';

const FALLBACK_CHAPTERS = {
  intro:     (n) => ({ title: 'The First Awakening', text: `The System stirs. "Player detected." Light gathers, and ${n} opens their eyes for the first time. "Your paths are chosen. Walk them every day, and you will grow. Abandon them, and the Rift will take you." ${n} clenches a fist. The journey begins.` }),
  rankUp:    (n, d) => ({ title: `Rank ${d.rankAfter}`, text: `The System's voice rings out: "Rank up confirmed. Rank ${d.rankAfter}." A new mark burns onto ${n}'s shoulder. Days of steady effort have become real strength. "Do not stop now," the System warns. "Higher ranks bring harder trials."` }),
  banished:  (n, d) => ({ title: 'Banished to the Rift', text: `"Daily quests failed." The ground splits open, and ${n} falls into the Rift, a cold dimension without light. ${d.expLost} EXP bleeds away into the dark. "Return by keeping your promises," the System says. "The Rift holds you for ${d.banishHours} hour${d.banishHours > 1 ? 's' : ''}."` }),
  returned:  (n) => ({ title: 'Return from the Rift', text: `A crack of light. ${n} climbs out of the Rift, tired but unbroken. "Welcome back," says the System. "The Rift remembers you. Make sure it never sees you again."` }),
  awakening: (n) => ({ title: 'The Second Awakening', text: `The gathered materials blaze and dissolve into ${n}. Every path, walked without fail, becomes power. The old form shatters like glass. "Second awakening complete," the System announces. A new voice speaks from ${n}'s lips: "Now the real journey starts."` }),
};

export async function createChapter(user, type, details = {}) {
  const characterName = CHARACTERS[user.characterId]?.name || 'The Hunter';
  let content;
  try {
    content = await writeChapter({
      type, characterName, awakened: user.awakened, rank: user.rank,
      categories: user.categories, streak: user.streak, details,
    });
  } catch (err) {
    if (err.message !== 'Gemini is not configured') console.warn('Chapter fallback:', err.message);
    content = FALLBACK_CHAPTERS[type](characterName, details);
  }

  const chapter = await StoryChapter.create({
    userId: user._id, type, title: content.title, text: content.text,
    audioStatus: voiceEnabled ? 'pending' : 'none',
  });

  if (voiceEnabled) {
    // Not awaited: the request returns right away and the audio link appears when ready.
    // The Gemini teammate's multi-voice narration (narrator + character) can replace this call.
    synthesize(content.text, 'system')
      .then(({ url }) => StoryChapter.updateOne({ _id: chapter._id }, { audioUrl: url, audioStatus: 'ready' }))
      .catch((err) => {
        console.warn('Chapter audio failed:', err.message);
        return StoryChapter.updateOne({ _id: chapter._id }, { audioStatus: 'failed' });
      });
  }
  return chapter;
}
