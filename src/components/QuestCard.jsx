// Daily quest card: category, title, duration, verification type, coin + material reward.
import { Link } from 'react-router-dom';
import { PROOF_LABEL } from '../api/data.js';
import { Check, CoinIcon, MaterialIcon } from './ui.jsx';

export default function QuestCard({ quest, status }) {
  const bonus = quest.kind === 'bonus';
  const active = typeof status === 'number';
  const { reward } = quest;
  return (
    <article className="card col" style={{ padding: '16px 20px', gap: 12, borderColor: active ? '#5AA9FF' : status === 'done' ? '#1E3A5C' : undefined }}>
      <div className="row between wrap" style={{ gap: 20 }}>
        <div className="col" style={{ gap: 6 }}>
          <span className="row mono muted wrap" style={{ gap: 10, fontSize: 11, letterSpacing: '.1em' }}>
            <span className="tag" style={{ background: bonus ? '#2A2110' : '#16202F', color: bonus ? '#F2B84B' : '#8CC4FF' }}>{bonus ? 'BONUS' : 'REQUIRED'}</span>
            {quest.name.toUpperCase()}
          </span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{quest.title}</h3>
          <div className="row wrap muted" style={{ gap: 16, fontSize: 13 }}>
            <span>{quest.mins} min</span>
            <span>{PROOF_LABEL[quest.proof]} verification</span>
          </div>
        </div>
        {status === 'done' ? (
          <span className="row" style={{ gap: 8, color: 'var(--blue)', fontWeight: 600 }}><Check />Claimed</span>
        ) : (
          <Link className={`btn ${active ? 'btn-blue' : 'btn-light'}`} style={{ height: 48, padding: '0 22px', fontSize: 15 }} to={`/quest/${quest.id}`}>
            {active ? 'Resume quest' : 'Start quest'}
          </Link>
        )}
      </div>
      <div className="row wrap" style={{ gap: 16, fontSize: 13, color: '#F2D9A0' }}>
        <span className="row" style={{ gap: 6 }}><CoinIcon size={16} />+{reward.coins} coins</span>
        <span className="row" style={{ gap: 6 }}><MaterialIcon color={reward.material.color} size={16} />{reward.qty}× {reward.material.name}</span>
        <span className="muted">+{reward.xp} EXP · +1 {quest.name}</span>
      </div>
    </article>
  );
}
