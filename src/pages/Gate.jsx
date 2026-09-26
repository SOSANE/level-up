import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../api/player.jsx';
import { RANKS, gain, rankOf } from '../api/game.js';
import { Bar } from '../components/ui.jsx';

const GATES = [
  { name: 'Hollow Quarry', rank: 'C', lv: 10, color: '#5AA9FF', boss: 'Quarry Warden', bossHp: 300, xp: 120, coins: 80, drop: 'Stone shard', runner: 'river.k', runnerRank: 'B', runnerLv: 24, streak: 96, watchers: 38 },
  { name: 'Ember Vault', rank: 'B', lv: 20, color: '#FF8A5A', boss: 'Vault Keeper', bossHp: 520, xp: 260, coins: 150, drop: 'Ember cloak', runner: 'mika.lifts', runnerRank: 'A', runnerLv: 41, streak: 204, watchers: 112 },
  { name: 'Sky Spire', rank: 'A', lv: 35, color: '#9B7BFF', boss: 'Spire Sentinel', bossHp: 800, xp: 500, coins: 300, drop: 'New character', runner: 'nightrunner', runnerRank: 'S', runnerLv: 52, streak: 311, watchers: 457 }
];
const roll = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fresh = (mode) => ({ mode, enemy: 120, hp: 100, mp: 60, log: [{ t: '[SYSTEM] Gate opened. A Quarry Warden stirs.', c: '#9B7BFF' }] });

function Boss({ color, label, dim }) {
  return (
    <svg viewBox="0 0 260 260" style={{ width: 250, maxWidth: '100%' }} role="img" aria-label={label} opacity={dim ? 0.25 : 1}>
      <polygon points="130,24 186,70 176,138 84,138 74,70" fill="#1A2233" stroke={color} strokeWidth="2" />
      <rect x="104" y="80" width="14" height="8" fill="#FF6B6B" /><rect x="142" y="80" width="14" height="8" fill="#FF6B6B" />
      <polygon points="74,72 34,120 48,170 70,130" fill="#141B28" stroke={color} strokeWidth="2" />
      <polygon points="186,72 226,120 212,170 190,130" fill="#141B28" stroke={color} strokeWidth="2" />
      <polygon points="90,140 170,140 160,200 100,200" fill="#141B28" stroke={color} strokeWidth="2" />
      <polygon points="100,200 124,200 118,244 94,244" fill="#1A2233" stroke={color} strokeWidth="2" />
      <polygon points="136,200 160,200 166,244 142,244" fill="#1A2233" stroke={color} strokeWidth="2" />
    </svg>
  );
}

const Log = ({ title, lines }) => (
  <div className="card deep log grow" style={{ padding: 16 }}>
    <span className="dim" style={{ letterSpacing: '.12em' }}>{title}</span>
    <div className="col" aria-live="polite" style={{ gap: 8 }}>{lines.map((l, k) => <span key={k} style={{ color: l.c }}>{l.t}</span>)}</div>
  </div>
);

export default function Gate() {
  const { player, update } = usePlayer();
  const canEnter = player.level >= 10; // Rank C
  const [st, setSt] = useState(fresh('locked'));
  const [w, setW] = useState(null); // spectating: { i, enemy, hp, log }
  const timer = useRef(null);
  const stop = () => { clearInterval(timer.current); timer.current = null; };
  useEffect(() => stop, []);

  function watch(i) {
    stop();
    const g = GATES[i];
    setW({ i, enemy: g.bossHp, hp: 100, log: [{ t: `[SYSTEM] ${g.runner} entered ${g.name}.`, c: g.color }] });
    timer.current = setInterval(() => setW((s) => {
      if (!s || s.enemy <= 0) { stop(); return s; }
      const d = Math.round(g.bossHp * (0.09 + Math.random() * 0.08));
      const enemy = Math.max(0, s.enemy - d);
      let hp = s.hp;
      const log = [...s.log, { t: `${g.runner} · ${['Shadow step', 'Heavy strike', 'Focus burst', 'Combo x3'][roll(0, 3)]} → ${d} dmg`, c: '#E8ECF4' }];
      if (enemy > 0 && Math.random() < 0.4) { const h = roll(4, 10); hp = Math.max(8, hp - h); log.push({ t: `${g.boss} hits back for ${h}`, c: '#FF8A8A' }); }
      if (enemy <= 0) log.push({ t: `[SYSTEM] ${g.boss} defeated. Loot dropped.`, c: '#F2B84B' });
      return { ...s, enemy, hp, log: log.slice(-8) };
    }), 1100);
    setSt(fresh('watch'));
  }
  function leave() { stop(); setW(null); setSt(fresh('locked')); }

  function turn(kind) {
    if (st.mode !== 'fight' || (kind === 'skill' && st.mp < 30)) return;
    let { enemy, hp, mp } = st;
    const log = [...st.log];
    if (kind === 'attack') { const d = roll(10, 16); enemy -= d; mp = Math.min(100, mp + 8); log.push({ t: `You strike for ${d}.`, c: '#E8ECF4' }); }
    if (kind === 'skill') { const d = roll(26, 34); enemy -= d; mp -= 30; log.push({ t: `Surge hits for ${d}!`, c: '#5AA9FF' }); }
    if (kind === 'guard') { mp = Math.min(100, mp + 20); log.push({ t: 'You guard and steady your focus (+20).', c: '#E8ECF4' }); }
    let mode = 'fight';
    if (enemy <= 0) {
      enemy = 0; mode = 'won';
      log.push({ t: '[SYSTEM] Quarry Warden defeated.', c: '#F2B84B' });
      if (canEnter) update((p) => gain(p, 40, 30));
    } else {
      let e = roll(8, 14);
      if (kind === 'guard') e = Math.floor(e / 3);
      hp -= e;
      log.push({ t: `Warden slams you for ${e}.`, c: '#FF8A8A' });
      if (hp <= 0) { hp = 0; mode = 'lost'; }
    }
    setSt({ enemy, hp, mp, mode, log: log.slice(-7) });
  }

  const my = rankOf(player.level);

  if (st.mode === 'locked') return (
    <div className="page col" style={{ gap: 32 }}>
      <div className="row wrap" style={{ gap: 56 }}>
        <svg width="220" height="270" viewBox="0 0 360 440" aria-hidden="true">
          <rect x="20" y="10" width="320" height="420" rx="160" fill="none" stroke="#2A3345" strokeWidth="2" />
          <rect x="60" y="50" width="240" height="340" rx="120" fill="#0E131C" stroke="#3A4458" strokeWidth="3" />
          <path d="M60 170 H300 M60 230 H300 M60 290 H300" stroke="#1E2635" strokeWidth="3" />
          <rect x="140" y="200" width="80" height="64" rx="10" fill="#121620" stroke="#F2B84B" strokeWidth="4" />
          <path d="M156 200 V184 a24 24 0 0 1 48 0 V200" fill="none" stroke="#F2B84B" strokeWidth="4" />
          <circle cx="180" cy="228" r="7" fill="#F2B84B" />
        </svg>
        <div className="col" style={{ flex: '1 1 400px', gap: 20 }}>
          <span className="mono gold" style={{ fontSize: 13 }}>[{canEnter ? 'GATES OPEN' : 'GATES SEALED'}] · YOUR RANK: {my}</span>
          <h1 className="display" style={{ fontSize: 48, lineHeight: 1.05 }}>{canEnter ? 'The gates recognize you.' : 'You need Rank C to enter.'}</h1>
          <p className="soft" style={{ fontSize: 17, lineHeight: 1.55, maxWidth: 620 }}>
            {canEnter ? 'Rank C gates are open to you. Watch higher-ranked players to learn what’s ahead.' : 'You can’t fight yet — but you can watch. See higher-ranked players clear the gates and what they walk away with.'}
          </p>
          <div className="row wrap" style={{ gap: 8 }}>
            {RANKS.map(([l, lv]) => {
              const me = l === my, target = !canEnter && l === 'C';
              return (
                <div key={l} className="col" style={{ width: 60, height: 64, borderRadius: 10, border: `1.5px solid ${me ? '#F2B84B' : target ? '#5AA9FF' : '#2A3345'}`, background: me ? '#2A2110' : target ? '#122036' : '#11151D', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'Oxanium, sans-serif', fontWeight: 800, fontSize: 22, color: me ? '#F2B84B' : target ? '#E8ECF4' : '#7E8AA0' }}>{l}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{me ? 'You' : `Lv ${lv}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="col" style={{ gap: 14 }}>
        <div className="row between wrap" style={{ alignItems: 'baseline' }}>
          <h2 className="display" style={{ fontSize: 22 }}>What you’re missing</h2>
          <span className="dim" style={{ fontSize: 13 }}>Watching is free. Fighting needs the rank.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {GATES.map((g, k) => (
            <div key={g.name} className="card col" style={{ gap: 14 }}>
              <div className="row between">
                <span className="display" style={{ fontSize: 20 }}>{g.name}</span>
                <span className="mono tag" style={{ border: `1px solid ${g.color}`, color: g.color, fontSize: 11 }}>RANK {g.rank}</span>
              </div>
              <div className="row muted" style={{ gap: 8, fontSize: 13 }}><span className="live" />{g.runner} is inside now · {g.watchers} watching</div>
              <div className="col" style={{ gap: 6, padding: '12px 14px', borderRadius: 10, background: 'var(--deep)', fontSize: 14 }}>
                <span className="row between"><span className="muted">EXP</span><b>+{g.xp}</b></span>
                <span className="row between"><span className="muted">Coins</span><b className="gold">+{g.coins}</b></span>
                <span className="row between"><span className="muted">Drop</span><b>{g.drop}</b></span>
              </div>
              <button className="btn btn-light" style={{ height: 48, fontSize: 15 }} onClick={() => watch(k)}>Watch the run</button>
            </div>
          ))}
        </div>
      </div>
      <div className="row wrap">
        <button className="btn btn-outline-gold" onClick={() => setSt(fresh('fight'))}>{canEnter ? 'Enter Hollow Quarry' : 'Try the demo fight'}</button>
        <Link className="btn btn-ghost" to="/dashboard">Back to quests</Link>
        <span className="dim" style={{ fontSize: 13 }}>{canEnter ? 'Rewards count toward your rank.' : 'Demo mode — nothing here is saved to your rank.'}</span>
      </div>
    </div>
  );

  if (st.mode === 'watch' && w) {
    const g = GATES[w.i];
    return (
      <div className="page col" style={{ gap: 20 }}>
        <div className="row between wrap">
          <div className="row wrap" style={{ gap: 14 }}>
            <span className="row mono tag" style={{ gap: 8, background: '#2A1416', color: 'var(--red)', fontSize: 11 }}><span className="live" />SPECTATING · {g.watchers} WATCHING</span>
            <span className="display" style={{ fontSize: 22 }}>{g.name}</span><span className="muted" style={{ fontSize: 14 }}>Rank {g.rank} gate</span>
          </div>
          <button className="btn btn-ghost" style={{ height: 44, fontSize: 14 }} onClick={leave}>Stop watching</button>
        </div>
        <div className="row wrap" style={{ gap: 24, alignItems: 'stretch' }}>
          <div className="arena" style={{ justifyContent: 'space-between' }}>
            <div className="col" style={{ width: 440, maxWidth: '100%', gap: 6 }}>
              <div className="row between" style={{ fontSize: 14 }}><b>{g.boss}</b><span className="muted">{w.enemy} / {g.bossHp}</span></div>
              <Bar pct={(w.enemy / g.bossHp) * 100} color="#FF6B6B" h={10} />
            </div>
            <Boss color={g.color} label={g.boss} />
            <div className="row" style={{ width: 440, maxWidth: '100%', gap: 14, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line2)', background: 'var(--panel)' }}>
              <span className="initials">{g.runner.slice(0, 2).toUpperCase()}</span>
              <div className="col grow" style={{ gap: 5 }}>
                <div className="row between" style={{ fontSize: 14 }}><b>{g.runner} · Rank {g.runnerRank}</b><span className="muted">HP {w.hp}</span></div>
                <Bar pct={w.hp} color="var(--green)" />
              </div>
            </div>
            {w.enemy <= 0 && (
              <div className="panel-overlay">
                <span className="mono gold" style={{ fontSize: 13 }}>[GATE CLEARED BY {g.runner}]</span>
                <span className="display" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1.15 }}>That could have been your loot.</span>
                <span className="soft" style={{ fontSize: 18 }}>+{g.xp} EXP · +{g.coins} coins · {g.drop}</span>
                <div className="row" style={{ paddingTop: 8 }}>
                  <Link className="btn btn-gold" to="/dashboard">Do today’s quests</Link>
                  <button className="btn btn-ghost" onClick={() => watch(w.i)}>Watch again</button>
                </div>
              </div>
            )}
          </div>
          <div className="col" style={{ flex: '0 1 360px', gap: 16 }}>
            <div className="card col" style={{ borderColor: 'var(--gold)', background: '#16120A', gap: 10 }}>
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
            <Log title="LIVE LOG" lines={w.log} />
          </div>
        </div>
      </div>
    );
  }

  const over = st.mode !== 'fight';
  return (
    <div className="page col" style={{ gap: 20 }}>
      <div className="row between wrap">
        <div className="row" style={{ gap: 14 }}>
          <span className="display" style={{ fontSize: 22 }}>Hollow Quarry</span>
          <span className="mono gold tag" style={{ background: '#2A2110', fontSize: 11 }}>{canEnter ? '' : 'DEMO · '}RANK C GATE</span>
        </div>
        <button className="btn btn-ghost" style={{ height: 44, fontSize: 14 }} onClick={leave}>Leave gate</button>
      </div>
      <div className="row wrap" style={{ gap: 24, alignItems: 'stretch' }}>
        <div className="arena" style={{ justifyContent: 'center', gap: 18 }}>
          <div className="col" style={{ width: 420, maxWidth: '100%', gap: 6 }}>
            <div className="row between" style={{ fontSize: 14 }}><b>Quarry Warden</b><span className="muted">{st.enemy} / 120</span></div>
            <Bar pct={(st.enemy / 120) * 100} color="#FF6B6B" h={10} />
          </div>
          <Boss color="#9B7BFF" label="Quarry Warden, a stone creature" dim={st.enemy <= 0} />
          {st.mode === 'won' && (
            <div className="panel-overlay">
              <span className="mono gold" style={{ fontSize: 13 }}>[GATE CLEARED]</span>
              <span className="display" style={{ fontWeight: 800, fontSize: 52 }}>+40 EXP · +30 coins</span>
              <span className="soft" style={{ fontSize: 16 }}>{canEnter ? 'Added to your wallet.' : 'Demo reward — reach Rank C to earn it for real.'}</span>
              <button className="btn btn-light" onClick={() => setSt(fresh('fight'))}>Run it again</button>
            </div>
          )}
          {st.mode === 'lost' && (
            <div className="panel-overlay">
              <span className="mono" style={{ fontSize: 13, color: 'var(--red)' }}>[DEFEATED]</span>
              <span className="display" style={{ fontWeight: 800, fontSize: 48 }}>Not strong enough. Yet.</span>
              <span className="soft" style={{ fontSize: 16 }}>That’s what the daily quests are for.</span>
              <button className="btn btn-light" onClick={() => setSt(fresh('fight'))}>Try again</button>
            </div>
          )}
        </div>
        <div className="col" style={{ flex: '0 1 360px', gap: 16 }}>
          <div className="card col">
            <span className="display" style={{ fontSize: 17 }}>You · Level {player.level}</span>
            {[['HP', st.hp, 'var(--green)'], ['Focus', st.mp, 'var(--blue)']].map(([l, v, c]) => (
              <div key={l} className="col" style={{ gap: 5 }}>
                <div className="row between" style={{ fontSize: 13 }}><span>{l}</span><span className="muted">{v} / 100</span></div>
                <Bar pct={v} color={c} h={8} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button className="btn btn-light" style={{ height: 64, padding: 0 }} onClick={() => turn('attack')} disabled={over}>Strike</button>
            <button className="btn btn-blue" style={{ height: 64, padding: 0, flexDirection: 'column', gap: 0 }} onClick={() => turn('skill')} disabled={over || st.mp < 30}>
              Surge<span style={{ fontSize: 11, fontWeight: 500 }}>30 focus</span>
            </button>
            <button className="btn btn-ghost" style={{ height: 64, padding: 0, fontWeight: 600 }} onClick={() => turn('guard')} disabled={over}>Guard</button>
          </div>
          <Log title="BATTLE LOG" lines={st.log} />
        </div>
      </div>
    </div>
  );
}
