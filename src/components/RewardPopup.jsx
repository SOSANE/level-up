// Shown after a quest: coins count up, the material drops in, the category bar fills.
import { useEffect, useState } from 'react';
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
      <div className="card col" style={{ width: 440, maxWidth: '100%', gap: 22, padding: 28, borderColor: 'var(--gold)', alignItems: 'stretch', textAlign: 'left' }}>
        <span className="mono gold">[QUEST CLEARED]{reward.cleared ? ' · DAILY BONUS' : ''}</span>
        <h2 id="reward-title" className="display" style={{ fontSize: 30 }}>{reward.category}</h2>
        <div className="row between">
          <span className="row display gold" style={{ fontSize: 44, gap: 10 }} aria-live="polite"><CoinIcon size={34} />+{coins}</span>
          <span className="soft" style={{ fontSize: 16 }}>+{reward.xp} EXP</span>
        </div>
        <div className="row drop-in" style={{ gap: 14, padding: '12px 14px', borderRadius: 12, background: 'var(--deep)' }}>
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
        <button className="btn btn-light" onClick={onClose} autoFocus>Continue</button>
      </div>
    </div>
  );
}
