import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../api/player.jsx';
import { CHARACTER } from '../api/data.js';
import { RANKS, RANK_COLOR, gain, rankOf } from '../api/game.js';
import Arena from '../components/arena/Arena.jsx';

const GATES = [
  { name: 'Hollow Quarry', rank: 'C', lv: 10, color: '#5AA9FF', boss: 'Quarry Warden', bossHp: 700, xp: 120, coins: 80, drop: 'Stone shard', runner: 'river.k', runnerRank: 'B', runnerLv: 24, streak: 96, watchers: 38 },
  { name: 'Ember Vault', rank: 'B', lv: 20, color: '#FF8A5A', boss: 'Vault Keeper', bossHp: 1000, xp: 260, coins: 150, drop: 'Ember cloak', runner: 'mika.lifts', runnerRank: 'A', runnerLv: 41, streak: 204, watchers: 112 },
  { name: 'Sky Spire', rank: 'A', lv: 35, color: '#9B7BFF', boss: 'Spire Sentinel', bossHp: 1300, xp: 500, coins: 300, drop: 'New character', runner: 'nightrunner', runnerRank: 'S', runnerLv: 52, streak: 311, watchers: 457 }
];
const PLAY_BOSS = { name: 'Quarry Warden', hp: 400, color: '#9B7BFF' };
const REWARD = { xp: 40, coins: 30 };

function Log({ title, lines }) {
  return (
    <div className="card deep log grow" style={{ padding: 16 }}>
      <span className="dim" style={{ letterSpacing: '.12em' }}>{title}</span>
      <div className="col" aria-live="polite" style={{ gap: 8 }}>
        {lines.map((l) => <span key={l.id} style={{ color: l.c }}>{l.t}</span>)}
      </div>
    </div>
  );
}

function useLog() {
  const [lines, setLines] = useState([]);
  const push = useCallback((t, c) => setLines((ls) => [...ls, { t, c, id: Math.random() }].slice(-8)), []);
  const clear = useCallback(() => setLines([]), []);
  return [lines, push, clear];
}

export default function Gate() {
  const { player, update } = usePlayer();
  const canEnter = player.level >= 10; // Rank C
  const my = rankOf(player.level);
  const [mode, setMode] = useState('locked'); // locked | watch | fight
  const [watchI, setWatchI] = useState(0);
  const [run, setRun] = useState(0); // bump to restart a fight
  const [result, setResult] = useState(null);
  const [log, pushLog, clearLog] = useLog();

  const start = (m, i = watchI) => { setMode(m); setWatchI(i); setResult(null); clearLog(); setRun((r) => r + 1); };
  const g = GATES[watchI];

  const runner = useMemo(() => ({ name: g.runner, color: RANK_COLOR[g.runnerRank], level: g.runnerLv, maxHp: 100 + g.runnerLv * 2, dmg: 0.55 + g.runnerLv / 60 }), [g]);
  const gateBoss = useMemo(() => ({ name: g.boss, hp: g.bossHp, color: g.color }), [g]);
  const me = useMemo(() => ({
    name: player.name, color: (CHARACTER[player.character] || CHARACTER.rookie).color, level: player.level, maxHp: 100, dmg: 1 + (player.level - 1) * 0.05
  }), [player.name, player.character, player.level]);

  function endFight(r) {
    setResult(r);
    if (r === 'won' && canEnter) update((p) => gain(p, REWARD.xp, REWARD.coins));
  }

  if (mode === 'locked') return (
    <div className="page col" style={{ gap: 32 }}>
      <div className="row wrap" style={{ gap: 56 }}>
        <svg width="220" height="270" viewBox="0 0 360 440" aria-hidden="true">
          <rect x="20" y="10" width="320" height="420" rx="160" fill="none" stroke="var(--line2)" strokeWidth="2" />
          <rect x="60" y="50" width="240" height="340" rx="120" fill="var(--deep)" stroke="var(--line3)" strokeWidth="3" />
          <path d="M60 170 H300 M60 230 H300 M60 290 H300" stroke="var(--line)" strokeWidth="3" />
          <rect x="140" y="200" width="80" height="64" rx="10" fill="var(--raised)" stroke="var(--gold)" strokeWidth="4" />
          <path d="M156 200 V184 a24 24 0 0 1 48 0 V200" fill="none" stroke="var(--gold)" strokeWidth="4" />
          <circle cx="180" cy="228" r="7" fill="var(--gold)" />
        </svg>
        <div className="col" style={{ flex: '1 1 400px', gap: 20 }}>
          <span className="mono gold" style={{ fontSize: 13 }}>[{canEnter ? 'GATES OPEN' : 'GATES SEALED'}] · YOUR RANK: {my}</span>
          <h1 className="page-title">{canEnter ? 'The gates recognize you.' : 'You need Rank C to enter.'}</h1>
          <p className="soft" style={{ fontSize: 17, lineHeight: 1.55, maxWidth: 620 }}>
            {canEnter ? 'Rank C gates are open to you. Watch higher-ranked players to learn the boss patterns first.' : 'You can’t fight for real yet — but you can watch live runs and learn the boss patterns in the practice fight.'}
          </p>
          <div className="row wrap" style={{ gap: 8 }}>
            {RANKS.map(([l, lv]) => {
              const isMe = l === my, target = !canEnter && l === 'C';
              return (
                <div key={l} className="col" style={{ width: 60, height: 64, borderRadius: 'var(--r-md)', border: `1.5px solid ${isMe ? 'var(--gold)' : target ? 'var(--blue)' : 'var(--line2)'}`, background: isMe ? 'var(--gold-tint)' : target ? 'var(--blue-tint)' : 'var(--panel)', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'Oxanium, sans-serif', fontWeight: 800, fontSize: 22, color: isMe ? 'var(--gold)' : target ? 'var(--fg)' : 'var(--dim)' }}>{l}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{isMe ? 'You' : `Lv ${lv}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="col" style={{ gap: 14 }}>
        <div className="row between wrap" style={{ alignItems: 'baseline' }}>
          <h2 className="display" style={{ fontSize: 22 }}>Live runs</h2>
          <span className="dim" style={{ fontSize: 13 }}>Watching is free. Fighting needs the rank.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {GATES.map((gate, k) => (
            <div key={gate.name} className="card col" style={{ gap: 14 }}>
              <div className="row between">
                <span className="display" style={{ fontSize: 20 }}>{gate.name}</span>
                <span className="mono tag" style={{ border: `1px solid ${gate.color}`, color: gate.color, fontSize: 11 }}>RANK {gate.rank}</span>
              </div>
              <div className="row muted" style={{ gap: 8, fontSize: 13 }}><span className="live" />{gate.runner} is inside now · {gate.watchers} watching</div>
              <div className="col" style={{ gap: 6, padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--deep)', fontSize: 14 }}>
                <span className="row between"><span className="muted">Boss</span><b>{gate.boss}</b></span>
                <span className="row between"><span className="muted">EXP</span><b>+{gate.xp}</b></span>
                <span className="row between"><span className="muted">Coins</span><b className="gold">+{gate.coins}</b></span>
                <span className="row between"><span className="muted">Drop</span><b>{gate.drop}</b></span>
              </div>
              <button className="btn btn-light" style={{ height: 48, fontSize: 15 }} onClick={() => start('watch', k)}>Watch the run</button>
            </div>
          ))}
        </div>
      </div>
      <div className="row wrap">
        <button className="btn btn-outline-gold" onClick={() => start('fight')}>{canEnter ? 'Enter Hollow Quarry' : 'Practice fight'}</button>
        <Link className="btn btn-ghost" to="/dashboard">Back to quests</Link>
        <span className="dim" style={{ fontSize: 13 }}>{canEnter ? 'Rewards count toward your rank.' : 'Practice mode — nothing here is saved to your rank.'}</span>
      </div>
    </div>
  );

  if (mode === 'watch') return (
    <div className="page col" style={{ gap: 20 }}>
      <div className="row between wrap">
        <div className="row wrap" style={{ gap: 14 }}>
          <span className="row mono tag" style={{ gap: 8, background: 'var(--red-tint)', color: 'var(--red)', fontSize: 11 }}><span className="live" />SPECTATING · {g.watchers} WATCHING</span>
          <span className="display" style={{ fontSize: 22 }}>{g.name}</span><span className="muted" style={{ fontSize: 14 }}>Rank {g.rank} gate</span>
        </div>
        <button className="btn btn-ghost" style={{ height: 44, fontSize: 14 }} onClick={() => setMode('locked')}>Stop watching</button>
      </div>
      <div className="row wrap" style={{ gap: 24, alignItems: 'flex-start' }}>
        <Arena key={run} mode="watch" boss={gateBoss} fighter={runner} onEnd={setResult} onLog={pushLog}>
          {result && (
            <div className="panel-overlay" style={{ borderRadius: 0, background: 'rgba(13,16,23,.9)' }}>
              <span className="mono" style={{ fontSize: 13, color: result === 'won' ? 'var(--gold)' : 'var(--red)' }}>
                {result === 'won' ? `[GATE CLEARED BY ${g.runner}]` : `[${g.runner} FELL IN ${g.name.toUpperCase()}]`}
              </span>
              <span className="display" style={{ fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: 1.15 }}>
                {result === 'won' ? 'That could have been your loot.' : 'Even Rank ' + g.runnerRank + ' players fall.'}
              </span>
              {result === 'won' && <span className="soft" style={{ fontSize: 18 }}>+{g.xp} EXP · +{g.coins} coins · {g.drop}</span>}
              <div className="row wrap" style={{ paddingTop: 8, justifyContent: 'center' }}>
                <Link className="btn btn-gold" to="/dashboard">Do today’s quests</Link>
                <button className="btn btn-ghost" onClick={() => start('watch')}>Watch again</button>
              </div>
            </div>
          )}
        </Arena>
        <div className="col" style={{ flex: '1 1 300px', maxWidth: 380, gap: 16 }}>
          <div className="card col" style={{ borderColor: 'var(--gold)', background: 'var(--gold-tint)', gap: 10 }}>
            <span className="mono gold">WHAT YOU’RE MISSING</span>
            <span className="row between"><span>EXP</span><b>+{g.xp}</b></span>
            <span className="row between"><span>Coins</span><b className="gold">+{g.coins}</b></span>
            <span className="row between"><span>Drop</span><b>{g.drop}</b></span>
            <span className="soft" style={{ fontSize: 13, paddingTop: 4 }}>You unlock this gate at Rank {g.rank} (Level {g.lv}). You’re Level {player.level}.</span>
          </div>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="col" style={{ gap: 2 }}><span className="muted" style={{ fontSize: 12 }}>Their level</span><span className="display" style={{ fontSize: 22 }}>{g.runnerLv}</span></div>
            <div className="col" style={{ gap: 2 }}><span className="muted" style={{ fontSize: 12 }}>Streak</span><span className="display" style={{ fontSize: 22 }}>{g.streak} days</span></div>
          </div>
          <Log title="LIVE LOG" lines={log} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="page col" style={{ gap: 20 }}>
      <div className="row between wrap">
        <div className="row" style={{ gap: 14 }}>
          <span className="display" style={{ fontSize: 22 }}>Hollow Quarry</span>
          <span className="mono gold tag" style={{ background: 'var(--gold-tint)', fontSize: 11 }}>{canEnter ? '' : 'PRACTICE · '}RANK C GATE</span>
        </div>
        <button className="btn btn-ghost" style={{ height: 44, fontSize: 14 }} onClick={() => setMode('locked')}>Leave gate</button>
      </div>
      <div className="row wrap" style={{ gap: 24, alignItems: 'flex-start' }}>
        <Arena key={run} mode="play" boss={PLAY_BOSS} fighter={me} onEnd={endFight} onLog={pushLog}>
          {result && (
            <div className="panel-overlay" style={{ borderRadius: 0, background: 'rgba(13,16,23,.9)' }}>
              <span className="mono" style={{ fontSize: 13, color: result === 'won' ? 'var(--gold)' : 'var(--red)' }}>{result === 'won' ? '[GATE CLEARED]' : '[DEFEATED]'}</span>
              <span className="display" style={{ fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)' }}>
                {result === 'won' ? `+${REWARD.xp} EXP · +${REWARD.coins} coins` : 'Not strong enough. Yet.'}
              </span>
              <span className="soft" style={{ fontSize: 16 }}>
                {result === 'won' ? (canEnter ? 'Added to your wallet.' : 'Practice reward — reach Rank C to earn it for real.') : 'Daily quests raise your level, and your level raises your damage.'}
              </span>
              <button className="btn btn-light" onClick={() => start('fight')} autoFocus>{result === 'won' ? 'Run it again' : 'Try again'}</button>
            </div>
          )}
        </Arena>
        <div className="col" style={{ flex: '1 1 300px', maxWidth: 380, gap: 16 }}>
          <div className="card col" style={{ gap: 8, fontSize: 14 }}>
            <span className="mono muted">BOSS PATTERNS</span>
            <span><b style={{ color: 'var(--red)' }}>Slam</b> — red ring under the boss. Get out, then jump the shockwaves.</span>
            <span><b style={{ color: 'var(--red)' }}>Charge</b> — red lane flashes. Jump over it or dodge through. It stuns itself on the wall.</span>
            <span><b style={{ color: 'var(--red)' }}>Stone shards</b> — red marks show where rocks land. Step aside.</span>
          </div>
          <Log title="BATTLE LOG" lines={log} />
        </div>
      </div>
    </div>
  );
}
