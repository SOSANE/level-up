import mongoose from 'mongoose';

const storyChapterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['intro', 'rankUp', 'banished', 'returned', 'awakening'], required: true },
    title: String,
    text: String,
    audioUrl: { type: String, default: null },
    // text is ready immediately; audio arrives a few seconds later. The frontend polls /api/story.
    audioStatus: { type: String, enum: ['pending', 'ready', 'failed', 'none'], default: 'pending' },
  },
  { timestamps: true }
);
storyChapterSchema.index({ userId: 1, createdAt: -1 });

export const StoryChapter = mongoose.model('StoryChapter', storyChapterSchema);
