// Shown after a quest: coins count up, the material drops in, the category bar fills.
import { useEffect, useState } from 'react';
import SystemWindow from './SystemWindow.jsx';
import { Bar, CoinIcon, MaterialIcon } from './ui.jsx';

export default function RewardPopup({ reward, onClose }) {
  const [coins, setCoins] = useState(0);
  const [bar, setBar] = useState(reward.barFrom);

  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 900);
      setCoins(Math.round(reward.coins * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const t = setTimeout(() => setBar(reward.barTo), 700);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [reward]);

  return (
    <div className="overlay dim-bg" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <SystemWindow title="QUEST COMPLETE" tone="gold" style={{ width: 460, maxWidth: '100%', textAlign: 'left' }}>
        <div className="col" style={{ gap: 20 }}>
          <p className="sys-note">[{reward.category} has been cleared.{reward.cleared ? ' Daily bonus earned.' : ''}]</p>
          <h3 id="reward-title" className="display" style={{ fontSize: 26, textAlign: 'center' }}>{reward.category}</h3>
          <div className="row between">
            <span className="row display gold" style={{ fontSize: 44, gap: 10 }} aria-live="polite"><CoinIcon size={34} />+{coins}</span>
            <span className="soft" style={{ fontSize: 16 }}>+{reward.xp} EXP</span>
          </div>
          <div className="row drop-in" style={{ gap: 14, padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--deep)' }}>
            <MaterialIcon color={reward.material.color} size={40} />
            <div className="col" style={{ gap: 2 }}>
              <b>{reward.qty}× {reward.material.name}</b>
              <span className="muted" style={{ fontSize: 13 }}>Material added to your inventory</span>
            </div>
          </div>
          <div className="col" style={{ gap: 6 }}>
            <div className="row between" style={{ fontSize: 14 }}><span>{reward.category} bar</span><span className="muted">{bar} / 10</span></div>
            <Bar pct={bar * 10} color="var(--gold)" h={10} label={`${reward.category} bar`} />
          </div>
          {reward.stat && <p className="sys-note" style={{ margin: 0 }}>[{reward.stat} +2]</p>}
          <button className="btn btn-light" onClick={onClose} autoFocus>Continue</button>
        </div>
      </SystemWindow>
    </div>
  );
}
