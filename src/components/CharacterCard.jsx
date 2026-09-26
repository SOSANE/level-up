// Character card: portrait, level, rank, EXP, stats, coins and streak.
import { CHARACTER, PROOF_COLOR } from '../api/data.js';
import { RANK_COLOR, rankOf, stats, streak } from '../api/game.js';
import SystemWindow from './SystemWindow.jsx';
import { Avatar, Bar, CoinIcon } from './ui.jsx';

export default function CharacterCard({ player }) {
  const ch = CHARACTER[player.character] || CHARACTER.rookie;
  const r = rankOf(player.level);
  return (
    <SystemWindow title="CHARACTER CARD" icon={null} tone="crimson">
      <div className="col" style={{ gap: 16 }}>
        <div className="portrait" style={{ '--c': ch.color }}>
          <Avatar color={ch.color} size={92} />
          <span className="portrait-rank" style={{ color: RANK_COLOR[r], borderColor: RANK_COLOR[r] }} aria-label={`Rank ${r}`}>{r}</span>
          <div className="col" style={{ alignItems: 'center', gap: 2 }}>
            <span className="display" style={{ fontSize: 20 }}>{player.name}</span>
            <span className="muted" style={{ fontSize: 13 }}>{ch.name}</span>
          </div>
        </div>
        <div className="col" style={{ gap: 8 }}>
          <div className="level-line">LEVEL {player.level}</div>
          <Bar pct={player.xp / 10} h={6} color="var(--crimson)" label="Experience" />
          <span className="muted" style={{ fontSize: 12, textAlign: 'center' }}>{player.xp} / 1000 EXP</span>
        </div>
        <dl className="stat-list">
          {stats(player).map((s) => (
            <div key={s.name} style={{ '--c': PROOF_COLOR[s.proof] }}><dt>{s.name.toUpperCase()}</dt><dd>{s.value}</dd></div>
          ))}
        </dl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="orb-box">
            <span className="orb gold"><CoinIcon size={20} /></span>
            <div className="col" style={{ gap: 0 }}><b className="orb-num">{player.coins}</b><span className="muted">Coins</span></div>
          </div>
          <div className="orb-box">
            <span className="orb">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--crimson-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 11.5c0-1.5.7-2.6 1.5-3.5.2 1.6 1 2.5 2 2.5 0-3-1-5 .5-7.5z" /><path d="M6 17c1.5 2.5 3.5 4 6 4s4.5-1.5 6-4" />
              </svg>
            </span>
            <div className="col" style={{ gap: 0 }}><b className="orb-num">{streak(player)}</b><span className="muted">Day streak</span></div>
          </div>
        </div>
      </div>
    </SystemWindow>
  );
}
