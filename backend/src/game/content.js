// Game content: categories, materials, characters, and fallback quests.
// Names marked PLACEHOLDER get replaced with the story bible from the Gemini teammate.

// verification: how a quest in this category is proven.
//   photo   -> Gemini checks an uploaded photo
//   presage -> vitals summary from the Presage companion app
//   self    -> honor system
export const CATEGORIES = {
  hobbies:           { label: 'Hobbies',                         verification: 'self',    material: { id: 'spark_gem',    name: 'Spark Gem' } },
  studying:          { label: 'Studying',                        verification: 'presage', material: { id: 'ink_scroll',   name: 'Ink Scroll' } },
  socializing:       { label: 'Socializing',                     verification: 'self',    material: { id: 'bond_thread',  name: 'Bond Thread' } },
  reading:           { label: 'Reading',                         verification: 'photo',   material: { id: 'lore_page',    name: 'Lore Page' } },
  instrument:        { label: 'Practicing an instrument',        verification: 'self',    material: { id: 'echo_crystal', name: 'Echo Crystal' } },
  cooking:           { label: 'Cooking a meal / eating healthier', verification: 'photo', material: { id: 'hearth_ember', name: 'Hearth Ember' } },
  cleaning:          { label: 'Cleaning',                        verification: 'photo',   material: { id: 'clear_dew',    name: 'Clear Dew' } },
  organizing:        { label: 'Organizing',                      verification: 'photo',   material: { id: 'order_rune',   name: 'Order Rune' } },
  working:           { label: 'Working',                         verification: 'self',    material: { id: 'guild_seal',   name: 'Guild Seal' } },
  strength_training: { label: 'Strength training',               verification: 'presage', material: { id: 'iron_shard',   name: 'Iron Shard' } },
  yoga:              { label: 'Yoga',                            verification: 'presage', material: { id: 'calm_petal',   name: 'Calm Petal' } },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES);

export const MATERIALS = Object.fromEntries(
  Object.entries(CATEGORIES).map(([category, c]) => [c.material.id, { ...c.material, category }])
);

// PLACEHOLDER names until the story bible is ready. Voice env names come from these ids.
export const CHARACTERS = {
  starter1: { name: 'Starter One' },
  starter2: { name: 'Starter Two' },
  starter3: { name: 'Starter Three' },
};

export const MATERIAL_PRICE = 50; // coins per material in the shop

// Used when Gemini is unavailable. The Gemini teammate expands this to 30+.
export const FALLBACK_QUESTS = {
  hobbies:           [['Creative half hour', 'Spend time on a hobby you enjoy, with no phone.', 20, 1], ['Make something', 'Finish a small piece of work in your hobby.', 40, 2]],
  studying:          [['Focused study block', 'Study one topic at your desk without breaks.', 25, 1], ['Deep study session', 'Study and write a short summary of what you learned.', 45, 2]],
  socializing:       [['Reach out', 'Message or call a friend you have not talked to this week.', 10, 1], ['Meet up', 'Spend time in person with a friend or family member.', 45, 2]],
  reading:           [['Read 10 pages', 'Read at least 10 pages of a book. Photo: the open book.', 20, 1], ['Read a chapter', 'Finish a full chapter. Photo: the page you stopped on.', 40, 2]],
  instrument:        [['Warm-up practice', 'Practice scales or a warm-up routine.', 15, 1], ['Learn a passage', 'Practice one hard passage until it is clean.', 30, 2]],
  cooking:           [['Cook a simple meal', 'Cook a meal with at least one vegetable. Photo: the plate.', 30, 1], ['Healthy full meal', 'Cook a balanced meal from scratch. Photo: the plate.', 60, 3]],
  cleaning:          [['Quick clean', 'Clean one surface or area. Photo: the result.', 15, 1], ['Room reset', 'Clean a whole room. Photo: the room.', 40, 2]],
  organizing:        [['Tidy a drawer', 'Organize one drawer or shelf. Photo: the result.', 15, 1], ['Organize your desk', 'Clear and organize your whole desk. Photo: the desk.', 30, 2]],
  working:           [['Focused work block', 'Work on your most important task without distractions.', 30, 1], ['Deep work', 'Two focused hours on one important task.', 120, 3]],
  strength_training: [['Bodyweight circuit', '3 rounds: 10 push-ups, 15 squats, 30-second plank.', 15, 1], ['Gym session', 'A full strength session at the gym.', 45, 2]],
  yoga:              [['Guided breathing', 'Five minutes of slow guided breathing.', 5, 1], ['Yoga flow', 'A 20-minute yoga flow ending with slow breathing.', 20, 2]],
};
