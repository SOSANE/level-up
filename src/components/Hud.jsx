// Dashboard HUD: character, rank badge, level, EXP bar, coins, streak, one bar per category.
import { CATEGORY, CHARACTER } from '../api/data.js';
import { rankOf, streak } from '../api/game.js';
import { Avatar, Bar, CoinIcon, RankBadge } from './ui.jsx';

export default function Hud({ player, highlight }) {
  const ch = CHARACTER[player.character] || CHARACTER.rookie;
  return (
    <aside className="col" style={{ flex: '0 1 380px', gap: 16 }}>
      <section className="card col" style={{ gap: 18 }} aria-label="Player status">
        <div className="row" style={{ gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: '#0D1017', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Avatar color={ch.color} size={48} />
          </div>
          <div className="col grow" style={{ gap: 2 }}>
            <span className="display" style={{ fontSize: 22 }}>{player.name}</span>
            <span className="muted" style={{ fontSize: 14 }}>{ch.name}</span>
          </div>
          <RankBadge level={player.level} size={56} />
        </div>
        <div className="col" style={{ gap: 8 }}>
          <div className="row between" style={{ fontSize: 14 }}>
            <b>Level {player.level} · Rank {rankOf(player.level)}</b>
            <span className="muted">{player.xp} / 1000 EXP</span>
          </div>
          <Bar pct={player.xp / 10} h={8} label="Experience" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="stat"><span className="display gold row" style={{ fontSize: 24, gap: 6 }}><CoinIcon />{player.coins}</span><span className="muted">Coins</span></div>
          <div className="stat"><span className="display" style={{ fontSize: 24 }}>{streak(player)}</span><span className="muted">Day streak</span></div>
        </div>
      </section>
      <section className="card deep col" aria-label="Category bars">
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <span className="display" style={{ fontSize: 18 }}>Category bars</span>
          <span className="muted" style={{ fontSize: 13 }}>Fill all to level up</span>
        </div>
        {player.chosen.map((id) => {
          const v = player.bars[id] || 0;
          return (
            <div key={id} className="col" style={{ gap: 5 }}>
              <div className="row between" style={{ fontSize: 13 }}><span>{CATEGORY[id].name}</span><span className="muted">{v} / 10</span></div>
              <Bar pct={v * 10} color={highlight === id ? 'var(--gold)' : 'var(--blue)'} />
            </div>
          );
        })}
      </section>
    </aside>
  );
}
