# Level Up: backend (Person 2)

Node + Express 5 + MongoDB (Mongoose). This folder already covers every backend task in the team plan.
Your job this weekend is to get it running, understand each piece, connect it to your teammates' work, and tune it.

## Get it running (15 minutes)

1. Install Node 20 or newer.
2. `npm install`
3. `cp .env.example .env` and fill in at least `MONGODB_URI`.
   For your first run, also set `AUTH_DISABLED=true` and `DEMO_MODE=true` so you can test without Auth0.
4. `npm run dev` (restarts on every save). You should see "Connected to MongoDB" and "API on http://localhost:4000".
5. `npm test` runs the game-math tests.

With `AUTH_DISABLED=true`, every request acts as the user named in the `x-dev-user` header.
Use a new name any time you want a fresh player. **Never set it to true on the Vultr server.**

## Where each of your tasks lives

| Task in the plan | File(s) |
|---|---|
| Express server, Atlas, Mongoose, dotenv/cors/helmet | `src/server.js`, `src/config.js`, `.env.example` |
| API contract with mock JSON | The route files below; share the curl outputs as mock JSON |
| Models: User, CategoryProgress, Quest, StoryChapter | `src/models/` |
| Routes: me, onboarding, today's quests, start quest | `src/routes/me.js`, `onboarding.js`, `quests.js` |
| Auth0 middleware | `src/middleware/auth.js` |
| Rewards on quest complete | `POST /:id/complete` in `src/routes/quests.js` |
| End-of-day job with node-cron | `src/jobs/endOfDayJob.js`, `src/game/endOfDay.js` |
| Photo uploads with multer | `src/routes/quests.js` (upload), `src/services/gemini.js` (verifyPhoto) |
| POST /api/voice with caching | `src/routes/voice.js`, `src/services/voice.js` |
| Second awakening route | `src/routes/awakening.js` |
| Shop routes | `src/routes/shop.js` |
| Plug in Gemini quests, verification, chapters | `src/services/gemini.js`, `quests.js`, `story.js` |
| Demo-mode routes | `src/routes/demo.js` |
| All the numbers (coins, EXP, ranks, losses) | `src/game/rules.js` (pure functions, tested in `test/`) |
| Category, material, and character names | `src/game/content.js` |

## Try the whole game loop with curl

```bash
API=http://localhost:4000/api

# 1. Onboard (10+ categories, one starter)
curl -s -X POST $API/onboarding -H "x-dev-user: alice" -H "Content-Type: application/json" -d '{
  "displayName":"Alice","characterId":"starter1",
  "categories":["hobbies","studying","socializing","reading","instrument","cooking",
                "cleaning","organizing","working","strength_training","yoga"]}'

# 2. Today's quests (copy one _id)
curl -s $API/quests/today -H "x-dev-user: alice"

# 3. Start and complete a quest
curl -s -X POST $API/quests/QUEST_ID/start -H "x-dev-user: alice"
curl -s -X POST $API/quests/QUEST_ID/complete -H "x-dev-user: alice"                         # self quest
curl -s -X POST $API/quests/QUEST_ID/complete -H "x-dev-user: alice" -F "photo=@meal.jpg"     # photo quest
curl -s -X POST $API/quests/QUEST_ID/complete -H "x-dev-user: alice" -H "Content-Type: application/json" \
     -d '{"vitals":{"restingHr":70,"afterHr":96}}'                                              # presage quest

# 4. Demo: fail a day (banished), then check /me for the losses and the Rift timer
curl -s -X POST $API/demo/next-day -H "x-dev-user: alice" -H "Content-Type: application/json" -d '{"outcome":"fail"}'
curl -s $API/me -H "x-dev-user: alice"

# 5. Demo: rank-up
curl -s -X POST $API/demo/add-exp -H "x-dev-user: alice"
curl -s -X POST $API/demo/next-day -H "x-dev-user: alice" -H "Content-Type: application/json" -d '{"outcome":"perfect"}'

# 6. Demo: second awakening
curl -s -X POST $API/demo/fill-bars -H "x-dev-user: alice"
# ...start and complete the one unfinished quest, then:
curl -s -X POST $API/awakening -H "x-dev-user: alice"

# 7. Story chapters (audioStatus "pending" -> poll again)
curl -s $API/story -H "x-dev-user: alice"
```

## Decisions made in the code (tell the team)

- **Game days** are `YYYY-MM-DD` strings stored as `user.gameDate`. The cron job and demo mode both close a day with the same `processDay()`, so demo behaviour matches the real thing. Set `TZ=America/Toronto` (or your zone) on the server so midnight is local midnight.
- **Streak bonus** counts today: the first perfect day gives 60 EXP. With this, a perfect player hits rank D on day 10, matching the plan (there's a test for it).
- **Unverified vitals** still complete the quest but drop 1 material instead of 2, so a Presage hiccup never costs the player their day.
- **Rejected photos** return `422` with Gemini's reason and don't complete the quest; the player can retry. If Gemini itself errors, the photo is accepted without the bonus.
- **Bars** stop at their target (never 11/10). The awakening uses up 3 materials per category and leaves bars full.
- **Story audio** is generated in the background. Chapters come back with `audioStatus: "pending"`; the frontend polls `GET /api/story` until it's `ready`.
- **Quest verification type** is decided by `content.js`, never by Gemini.
- **Timer check:** outside demo mode, completing before `endsAt` returns `409`.

## Hand-offs

- **Frontend:** send `Authorization: Bearer <token>` from `getAccessTokenSilently()`. Audio files are at `http://localhost:4000/audio/...` locally and `/audio/...` in production. Photos go as multipart field `photo`.
- **Gemini teammate:** replace the prompts in `src/services/gemini.js` but keep the three function signatures. Put the story bible names into `src/game/content.js`. Multi-voice narration replaces the single `synthesize(...)` call in `src/services/story.js`.
- **Testing & Presage teammate:** the companion app sends `{ vitals: {...} }` to the complete route (shapes in `verifyVitals` in `rules.js`). Unit tests are in `test/rules.test.js`. For production: `pm2 start src/server.js --name levelup-api`, and Nginx proxies `/api` and `/audio` to port 4000.
