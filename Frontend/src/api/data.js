// Static game content.
export const CATEGORIES = [
  ['strength', 'Strength training', 'VITALS', 15, 'Gym session — heart rate check before and after'],
  ['yoga', 'Yoga', 'VITALS', 10, 'Guided breathing flow — slow your breath'],
  ['running', 'Running', 'VITALS', 12, 'Easy jog, any pace'],
  ['walk', 'Nature walks', 'PHOTO', 20, 'Walk outside and photograph something green'],
  ['reading', 'Reading', 'PHOTO', 15, 'Read 10 pages and photograph where you stopped'],
  ['study', 'Studying', 'FOCUS', 25, 'One focused study block, phone out of reach'],
  ['language', 'New language', 'FOCUS', 15, 'Learn and say 10 new words out loud'],
  ['meditate', 'Meditation', 'FOCUS', 8, 'Sit in silence, eyes closed'],
  ['cooking', 'Cooking healthier', 'PHOTO', 30, 'Cook one meal with a vegetable in it'],
  ['cleaning', 'Cleaning', 'PHOTO', 15, 'Clear one surface — before and after photo'],
  ['organizing', 'Organizing', 'PHOTO', 15, 'Sort out one drawer'],
  ['journal', 'Journaling', 'PHOTO', 10, 'Write half a page about today'],
  ['drawing', 'Drawing', 'PHOTO', 15, 'Sketch anything in front of you'],
  ['instrument', 'Instrument practice', 'HONOR', 15, 'Practice scales, then one song'],
  ['music', 'Music', 'HONOR', 40, 'Listen to a full album, no phone'],
  ['hobbies', 'Hobbies', 'HONOR', 20, 'Spend time on the hobby you keep postponing'],
  ['social', 'Socializing', 'HONOR', 10, 'Call a friend you haven’t talked to in a while'],
  ['working', 'Working', 'HONOR', 25, 'Finish the task you keep pushing back'],
  ['sleep', 'Sleep by 11', 'HONOR', 5, 'Phone down and lights out by 11 pm'],
  ['water', 'Hydration', 'HONOR', 5, 'Drink 6 glasses of water today'],
  ['stretch', 'Stretching', 'HONOR', 10, 'Full-body stretch, hold each pose 30 seconds'],
  ['cycling', 'Cycling', 'VITALS', 20, 'Ride at a pace that makes talking hard'],
  ['swim', 'Swimming', 'HONOR', 20, 'Swim 10 easy lengths'],
  ['budget', 'Budgeting', 'PHOTO', 10, 'Log every purchase from this week'],
  ['garden', 'Plants & gardening', 'PHOTO', 15, 'Water, repot or trim one plant'],
  ['code', 'Side project', 'FOCUS', 30, 'Build one small piece of your project'],
  ['detox', 'Screen-time detox', 'FOCUS', 60, 'One full hour with the phone in another room'],
  ['family', 'Family time', 'HONOR', 20, 'Share a meal or a walk with family'],
  ['volunteer', 'Helping others', 'HONOR', 15, 'Do one thing for someone without being asked'],
  ['selfcare', 'Self-care', 'HONOR', 10, 'Shower, skincare, clean clothes — reset yourself']
].map(([id, name, proof, mins, title]) => ({ id, name, proof, mins, title }));
export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const MIN_CATEGORIES = 10;

export const PROOF_LABEL = { PHOTO: 'Photo', VITALS: 'Vitals', FOCUS: 'Focus', HONOR: 'Honor' };
// One accent per verification type, reused for its material, stat, bars and quest icons (hex: the canvas reads these too).
export const PROOF_COLOR = { VITALS: '#FF5C74', FOCUS: '#0ECCED', PHOTO: '#B9D3E2', HONOR: '#4D8FE8' };
export const PROOF_CTA = { PHOTO: 'Upload photo proof', VITALS: 'Run vitals check', FOCUS: 'End focus session', HONOR: 'I did it' };

// Each verification type drops its own crafting material.
export const MATERIAL = {
  VITALS: { name: 'Iron ore', color: '#FF5C74' },
  PHOTO: { name: 'Spirit herb', color: '#B9D3E2' },
  FOCUS: { name: 'Mana crystal', color: '#0ECCED' },
  HONOR: { name: 'Oath token', color: '#4D8FE8' }
};


export const BLOCKED_APPS = ['Video', 'Social', 'Games', 'Streaming', 'Short clips'];
