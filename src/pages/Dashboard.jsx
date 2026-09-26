import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../api/player.jsx';
import { sendToRift, today, todaysQuests } from '../api/game.js';
import Hud from '../components/Hud.jsx';
import QuestCard from '../components/QuestCard.jsx';
import RewardPopup from '../components/RewardPopup.jsx';

export default function Dashboard() {
  const { player, update } = usePlayer();
  const navigate = useNavigate();
  const { state } = useLocation();
  const reward = state?.reward;
  const quests = todaysQuests(player);
  const status = player.day.status;
  const done = quests.slice(0, 4).filter((q) => status[q.id] === 'done').length;
  const riftActive = player.rift && player.rift.until > Date.now();

  // A fresh banishment is shown once, straight away.
  useEffect(() => {
    if (player.rift && !player.rift.seen) navigate('/rift', { replace: true });
  }, [player.rift, navigate]);

  const dayN = Math.round((new Date(today()) - new Date(player.started)) / 864e5) + 1;
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  return (
    <div className="page col" style={{ gap: 24 }}>
      <div className="row between wrap">
        <span className="mono" style={{ color: 'var(--blue)' }}>[DAILY QUEST] · LEVEL {player.level}</span>
        <span className="mono muted" style={{ fontSize: 13 }}>{weekday} · DAY {dayN} OF YOUR AWAKENING</span>
      </div>

      {player.rift && (
        <Link to="/rift" className="card row between wrap" style={{ borderColor: '#4A2A2E', background: '#150F12', color: 'var(--red)', textDecoration: 'none' }}>
          <span className="mono">{riftActive ? '[RIFT] YOUR CHARACTER IS STILL TRAPPED' : '[RIFT] THE RIFT HAS OPENED — ESCAPE NOW'}</span><span>View the Rift →</span>
        </Link>
      )}

      <div className="row wrap" style={{ gap: 32, alignItems: 'flex-start' }}>
        <section className="col" style={{ flex: '1 1 560px', gap: 16 }} aria-labelledby="today">
          <div className="row between wrap" style={{ alignItems: 'flex-end' }}>
            <h1 id="today" className="display" style={{ fontSize: 34 }}>Today: 4 quests minimum</h1>
            <b style={{ fontSize: 16 }}>{done} / 4 required</b>
          </div>
          {quests.map((q) => <QuestCard key={q.id} quest={q} status={status[q.id]} />)}
          {player.day.cleared && (
            <div className="sys" style={{ borderColor: 'var(--gold)', color: '#F2D9A0' }}>
              [SYSTEM] 4 quests cleared · daily bonus +50 EXP · +25 coins. Rift sealed for today. Jinho: “Not bad. Same time tomorrow.”
            </div>
          )}
          <div className="card col" style={{ borderColor: '#4A2A2E', background: '#150F12', gap: 10 }}>
            <span className="mono" style={{ color: 'var(--red)' }}>RIFT WARNING</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: '#D6DCE6' }}>
              Finish fewer than 4 quests today and your character is banished to the Rift: you lose 150 EXP and 25 coins, entertainment apps lock for 1 hour, and each missed day in a row adds another.
            </span>
            <button className="btn-danger" onClick={() => { update((p) => sendToRift(p, 1)); }}>Demo: fail today</button>
          </div>
        </section>
        <Hud player={player} highlight={reward ? quests.find((q) => q.name === reward.category)?.id : undefined} />
      </div>

      {reward && <RewardPopup reward={reward} onClose={() => navigate('.', { replace: true, state: null })} />}
    </div>
  );
}
