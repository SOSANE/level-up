import { useEffect, useState } from 'react';
import { usePlayer } from '../api/player.jsx';
import { MATERIAL } from '../api/data.js';
import { lookOf, stageOf } from '../api/look.js';
import { localDailyStats, today } from '../api/game.js';
import { API_ENABLED, api } from '../api/client.js';
import ActivityChart from '../components/ActivityChart.jsx';
import TigerPanel from '../components/TigerPanel.jsx';
import CharacterCard from '../components/CharacterCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SystemWindow from '../components/SystemWindow.jsx';
import EvolutionTimeline from '../components/EvolutionTimeline.jsx';
import { MaterialIcon, Potion } from '../components/ui.jsx';

const SHOP = [
  { id: 'freeze', name: 'Frost elixir', desc: 'Freezes your streak for one missed day', cost: 100, color: 'var(--blue)' },
  { id: 'shield', name: 'Ward potion', desc: 'Cuts a Rift banishment to 30 min', cost: 150, color: 'var(--crimson)' },
  { id: 'outfit', name: 'Essence of style', desc: 'Unlocks 3 premium outfit colors', cost: 400, color: 'var(--sapphire-light)' }
];
const DAY_LOOK = {
  d: { bg: 'var(--blue)', ring: 'var(--blue)', fg: 'var(--on-accent)', label: 'All quests done' },
  p: { bg: 'var(--blue-deep)', ring: 'var(--blue-deep)', fg: 'var(--fg)', label: 'Some quests done' },
  m: { bg: 'transparent', ring: 'var(--red)', fg: 'var(--red)', label: 'Missed' },
  f: { bg: 'transparent', ring: 'var(--line)', fg: 'var(--dim)', label: 'Upcoming' }
};

export default function Profile() {
  const { player, update, reset, demo } = usePlayer();
  const t = today();

  // With the backend on, the calendar and the 30-day chart come from Tiger Data's daily_player_stats view.
  const live = API_ENABLED && !demo;
  const [serverStats, setServerStats] = useState(null);
  const [serverHistory, setServerHistory] = useState(null);
  useEffect(() => {
    if (!live) return;
    let alive = true;
    api.stats(30).then((s) => { if (alive) setServerStats(s); }).catch(() => {});
    api.history(t.slice(0, 7)).then((h) => { if (alive) setServerHistory(h); }).catch(() => {});
    return () => { alive = false; };
  }, [live, t]);
  const history = serverHistory ? { ...serverHistory, ...(player.history[t] && { [t]: player.history[t] }) } : player.history;
  const activity = serverStats ? serverStats.days : localDailyStats(player, 30);

  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, k) => {
    const key = today(new Date(now.getFullYear(), now.getMonth(), k + 1));
    const h = history[key];
    const kind = h || (key < t && key >= player.started ? 'm' : 'f');
    return { n: k + 1, ...DAY_LOOK[kind], label: `${key}: ${DAY_LOOK[kind].label}` };
  });

  const look = lookOf(player);
  const stage = stageOf(player.level);

  const buy = (item) => update((p) => { p.coins -= item.cost; p.items[item.id] = (p.items[item.id] || 0) + 1; });

  return (
    <div className="page col" style={{ gap: 28 }}>
      <PageHeader eyebrow="PLAYER PROFILE" color="var(--crimson-soft)" title={player.name}
        sub="Your character, what you’ve collected, and where to spend your coins." />
    <div className="row wrap" style={{ gap: 28, alignItems: 'flex-start' }}>
      <div className="col" style={{ flex: '1 1 400px', maxWidth: 460, gap: 20 }}>
        <CharacterCard player={player} />
        <p className="muted" style={{ fontSize: 13, textAlign: 'center', marginTop: -8 }}>
          Awakened {new Date(player.started + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {player.questsDone} quests done · Level up needs 1000 EXP and every path bar full.
        </p>

        <SystemWindow title="MATERIALS" icon={null}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {Object.values(MATERIAL).map((m) => (
              <div key={m.name} className="row stat" style={{ flexDirection: 'row', gap: 10 }}>
                <MaterialIcon color={m.color} size={24} /><span className="grow">{m.name}</span><b>{player.materials[m.name] || 0}</b>
              </div>
            ))}
          </div>
        </SystemWindow>

      </div>

      <div className="col" style={{ flex: '1 1 520px', gap: 20 }}>
        <EvolutionTimeline look={look} stage={stage} level={player.level} />
        <SystemWindow title={`${month.toUpperCase()} HISTORY`} icon={null}>
          <div className="row muted" style={{ gap: 14, fontSize: 12, justifyContent: 'center', marginBottom: 14 }}>
              <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'var(--blue)' }} />All 4</span>
              <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'var(--blue-deep)' }} />Partial</span>
              <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ border: '1.5px solid var(--red)' }} />Missed</span>
            </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
            {days.map((d) => (
              <div key={d.n} title={d.label} aria-label={d.label} style={{ height: 30, borderRadius: 'var(--r-sm)', background: d.bg, border: `1.5px solid ${d.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: d.fg }}>{d.n}</div>
            ))}
          </div>
        </SystemWindow>

        <SystemWindow title="LAST 30 DAYS" icon={null}>
          <ActivityChart days={activity} source={serverStats ? 'server' : 'local'} queryMs={serverStats?.queryMs} />
        </SystemWindow>

        {API_ENABLED && <TigerPanel />}

        <SystemWindow title="POTION MARKETPLACE" icon={null} tone="crimson">
          <div className="col" style={{ gap: 14 }}>
            <p className="sys-note">[Balance: <span className="gold">{player.coins} coins</span>]</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {SHOP.map((item) => (
                <button key={item.id} className="potion-item" style={{ '--c': item.color }} disabled={player.coins < item.cost} onClick={() => buy(item)}>
                  <Potion color={item.color} />
                  <b>{item.name}</b>
                  <span className="muted" style={{ fontSize: 13 }}>{item.desc}</span>
                  <span className="gold" style={{ fontSize: 13 }}>{item.cost} coins</span>
                  {player.items[item.id] ? <span className="bracket" style={{ fontSize: 12 }}>[owned: {player.items[item.id]}]</span> : null}
                </button>
              ))}
            </div>
            <button className="btn-danger" style={{ alignSelf: 'center' }} onClick={() => { if (confirm('Erase all progress and start over?')) reset(); }}>Reset progress</button>
          </div>
        </SystemWindow>
      </div>
    </div>
    </div>
  );
}
