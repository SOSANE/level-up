import { usePlayer } from '../api/player.jsx';
import { CHARACTER, CHARACTERS, MATERIAL } from '../api/data.js';
import { streak, today } from '../api/game.js';
import { Avatar, Bar, MaterialIcon, RankBadge } from '../components/ui.jsx';

const UNLOCKS = [['The Ironbound', 3], ['The Wayfarer', 4], ['The Vanguard', 5], ['The Ascendant', 10]];
const SHOP = [
  { id: 'freeze', name: 'Streak freeze', desc: 'Save one missed day', cost: 100 },
  { id: 'shield', name: 'Rift shield', desc: 'Cut a banishment to 30 min', cost: 150 },
  { id: 'outfit', name: 'Character outfit', desc: 'Cosmetic for your character', cost: 400 }
];
const DAY_LOOK = {
  d: { bg: '#5AA9FF', ring: '#5AA9FF', fg: '#06101F', label: 'All quests done' },
  p: { bg: '#2C4A70', ring: '#2C4A70', fg: '#E8ECF4', label: 'Some quests done' },
  m: { bg: 'transparent', ring: '#FF8A8A', fg: '#FF8A8A', label: 'Missed' },
  f: { bg: 'transparent', ring: '#1E2635', fg: '#5A6478', label: 'Upcoming' }
};

export default function Profile() {
  const { player, update, reset } = usePlayer();
  const ch = CHARACTER[player.character] || CHARACTER.rookie;

  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const t = today();
  const days = Array.from({ length: daysInMonth }, (_, k) => {
    const key = today(new Date(now.getFullYear(), now.getMonth(), k + 1));
    const h = player.history[key];
    const kind = h || (key < t && key >= player.started ? 'm' : 'f');
    return { n: k + 1, ...DAY_LOOK[kind], label: `${key}: ${DAY_LOOK[kind].label}` };
  });

  const characters = [
    ...CHARACTERS.map((c) => ({ name: c.name, color: c.color, sub: c.id === player.character ? 'Your starter' : 'Starter', open: c.id === player.character })),
    ...UNLOCKS.map(([name, lv]) => ({ name, color: '#F2B84B', sub: player.level >= lv ? 'Unlocked' : `Level ${lv}`, open: player.level >= lv }))
  ];

  const buy = (item) => update((p) => { p.coins -= item.cost; p.items[item.id] = (p.items[item.id] || 0) + 1; });

  return (
    <div className="page row wrap" style={{ gap: 28, alignItems: 'flex-start' }}>
      <div className="col" style={{ flex: '1 1 400px', maxWidth: 460, gap: 20 }}>
        <section className="card col" style={{ gap: 22, padding: 24 }}>
          <div className="row" style={{ gap: 18 }}>
            <div style={{ width: 84, height: 84, borderRadius: 20, background: '#1E2A3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Avatar color={ch.color} size={54} /></div>
            <div className="col" style={{ gap: 4 }}>
              <span className="display" style={{ fontSize: 26 }}>{player.name}</span>
              <span className="muted" style={{ fontSize: 15 }}>Awakened {new Date(player.started + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {ch.name}</span>
            </div>
          </div>
          <div className="row" style={{ gap: 18 }}>
            <RankBadge level={player.level} />
            <div className="col grow" style={{ gap: 8 }}>
              <div className="row between" style={{ fontSize: 14 }}><b>Level {player.level} → Level {player.level + 1}</b><span className="muted">{player.xp} / 1000 EXP</span></div>
              <Bar pct={player.xp / 10} h={8} label="Experience" />
              <span className="muted" style={{ fontSize: 13 }}>Level up needs 1000 EXP and every category bar full.</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div className="stat"><span className="display" style={{ fontSize: 26 }}>{streak(player)}</span><span className="muted">Day streak</span></div>
            <div className="stat"><span className="display" style={{ fontSize: 26 }}>{player.questsDone}</span><span className="muted">Quests done</span></div>
            <div className="stat"><span className="display gold" style={{ fontSize: 26 }}>{player.coins}</span><span className="muted">Coins</span></div>
          </div>
        </section>

        <section className="card col" style={{ gap: 14 }}>
          <h2 className="display" style={{ fontSize: 18 }}>Materials</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {Object.values(MATERIAL).map((m) => (
              <div key={m.name} className="row stat" style={{ flexDirection: 'row', gap: 10 }}>
                <MaterialIcon color={m.color} size={24} /><span className="grow">{m.name}</span><b>{player.materials[m.name] || 0}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="card col" style={{ gap: 14 }}>
          <div className="row between" style={{ alignItems: 'baseline' }}>
            <h2 className="display" style={{ fontSize: 18 }}>Characters</h2>
            <span className="muted" style={{ fontSize: 13 }}>{characters.filter((c) => c.open).length} of {characters.length} unlocked</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
            {characters.map((c) => (
              <div key={c.name} className="col between" style={{ height: 118, padding: 12, borderRadius: 12, border: `1px solid ${c.open ? c.color : '#1E2635'}`, background: 'var(--deep)', gap: 0 }}>
                <Avatar color={c.color} size={40} locked={!c.open} />
                <div className="col" style={{ gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: c.open ? 'var(--fg)' : 'var(--dim)' }}>{c.open ? c.name : 'Locked'}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{c.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card col" style={{ gap: 14 }}>
          <div className="row between wrap" style={{ alignItems: 'baseline' }}>
            <h2 className="display" style={{ fontSize: 18 }}>{month} history</h2>
            <div className="row muted" style={{ gap: 12, fontSize: 12 }}>
              <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: '#5AA9FF' }} />All 4</span>
              <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: '#2C4A70' }} />Partial</span>
              <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ border: '1.5px solid #FF8A8A' }} />Missed</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
            {days.map((d) => (
              <div key={d.n} title={d.label} aria-label={d.label} style={{ height: 30, borderRadius: 6, background: d.bg, border: `1.5px solid ${d.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: d.fg }}>{d.n}</div>
            ))}
          </div>
        </section>
      </div>

      <section className="card col" style={{ flex: '1 1 520px', gap: 18, padding: 24 }} aria-label="Shop">
        <div className="col" style={{ gap: 12 }}>
          <div className="row between" style={{ alignItems: 'baseline' }}>
            <h2 className="display" style={{ fontSize: 18 }}>Spend your coins</h2>
            <span className="gold" style={{ fontSize: 13 }}>Balance: {player.coins}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {SHOP.map((item) => (
              <button key={item.id} className="shop-item" disabled={player.coins < item.cost} onClick={() => buy(item)}>
                <b>{item.name}</b>
                <span className="muted" style={{ fontSize: 13 }}>{item.desc}</span>
                <span className="gold" style={{ fontSize: 13 }}>{item.cost} coins{player.items[item.id] ? ` · owned ${player.items[item.id]}` : ''}</span>
              </button>
            ))}
          </div>
          <button className="btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => { if (confirm('Erase all progress and start over?')) reset(); }}>Reset progress</button>
        </div>
      </section>
    </div>
  );
}
