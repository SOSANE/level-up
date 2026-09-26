import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { config, checkConfig } from './config.js';
import { requireAuth, loadUser, requireOnboarded } from './middleware/auth.js';
import meRoutes from './routes/me.js';
import onboardingRoutes from './routes/onboarding.js';
import questRoutes from './routes/quests.js';
import awakeningRoutes from './routes/awakening.js';
import shopRoutes from './routes/shop.js';
import storyRoutes from './routes/story.js';
import voiceRoutes from './routes/voice.js';
import demoRoutes from './routes/demo.js';
import { startEndOfDayJob } from './jobs/endOfDayJob.js';

checkConfig();

const app = express();
// cross-origin so the React dev server (another port) can play /audio files.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin, exposedHeaders: ['X-Audio-Url'] }));
app.use(express.json({ limit: '1mb' }));

// Public
app.get('/api/health', (_req, res) => res.json({ ok: true, demoMode: config.demoMode }));
app.use('/audio', express.static(config.audioDir, { maxAge: '7d' }));

// Everything below needs a signed-in user
const api = express.Router();
api.use(...requireAuth(), loadUser);
api.use('/me', meRoutes);
api.use('/onboarding', onboardingRoutes);
api.use('/quests', requireOnboarded, questRoutes);
api.use('/awakening', requireOnboarded, awakeningRoutes);
api.use('/shop', requireOnboarded, shopRoutes);
api.use('/story', requireOnboarded, storyRoutes);
api.use('/voice', voiceRoutes);
if (config.demoMode) api.use('/demo', requireOnboarded, demoRoutes);
app.use('/api', api);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Express 5 sends errors thrown in async routes here automatically.
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Server error' : err.message, ...(err.details && { details: err.details }) });
});

await mongoose.connect(config.mongoUri);
console.log('Connected to MongoDB');
app.listen(config.port, () => console.log(`API on http://localhost:${config.port} (demo mode: ${config.demoMode})`));
startEndOfDayJob();
