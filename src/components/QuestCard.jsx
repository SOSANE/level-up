// One goal row in the Quest Info window: category, title, duration, verification type, coin + material reward.
import { Link } from 'react-router-dom';
import { PROOF_COLOR, PROOF_LABEL } from '../api/data.js';
import { STAT_OF } from '../api/game.js';
import { CoinIcon, MaterialIcon, ProofChip } from './ui.jsx';

const TAG = { required: ['REQUIRED', 'var(--raised)', 'var(--blue-soft)'], bonus: ['BONUS', 'var(--gold-tint)', 'var(--gold)'], extra: ['EXTRA', 'var(--crimson-tint)', 'var(--crimson-soft)'] };

export default function QuestCard({ quest, status }) {
  const [tag, tagBg, tagFg] = TAG[quest.kind];
  const active = typeof status === 'number';
  const done = status === 'done';
  const { reward } = quest;
  return (
    <article className={`goal-row${done ? ' done' : ''}${active ? ' active' : ''}`}>
      <div className="row between" style={{ gap: 16, alignItems: 'flex-start' }}>
        <div className="row" style={{ gap: 14, alignItems: 'flex-start', minWidth: 0 }}>
          <ProofChip proof={quest.proof} color={PROOF_COLOR[quest.proof]} />
          <div className="col" style={{ gap: 6, minWidth: 0 }}>
            <span className="row mono muted wrap" style={{ gap: 10, fontSize: 11, letterSpacing: '.1em' }}>
              <span className="tag" style={{ background: tagBg, color: tagFg }}>{tag}</span>
              {quest.name.toUpperCase()}
            </span>
            <h3 className="goal-title">{quest.title}</h3>
            <div className="row wrap muted" style={{ gap: 14, fontSize: 13 }}>
              <span>{quest.mins} min</span>
              <span>{PROOF_LABEL[quest.proof]} verification</span>
              <span className="proof-text" style={{ '--c': PROOF_COLOR[quest.proof] }}>+{STAT_OF[quest.proof]}</span>
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 10, flexShrink: 0 }}>
          <span className="bracket">[{done ? 1 : 0}/1]</span>
          <span className={`goal-check${done ? ' on' : ''}`} role="img" aria-label={done ? 'Completed' : 'Not completed'}>{done ? '✓' : ''}</span>
        </div>
      </div>
      <div className="row between wrap" style={{ gap: 12 }}>
        <div className="row wrap" style={{ gap: 16, fontSize: 13, color: 'var(--gold-soft)' }}>
          <span className="row" style={{ gap: 6 }}><CoinIcon size={16} />+{reward.coins} coins</span>
          <span className="row" style={{ gap: 6 }}><MaterialIcon color={reward.material.color} size={16} />{reward.qty}× {reward.material.name}</span>
          <span className="muted">+{reward.xp} EXP</span>
        </div>
        {!done && (
          <Link className={`btn ${active ? 'btn-blue' : 'btn-light'}`} style={{ height: 44, padding: '0 20px', fontSize: 15 }} to={`/quest/${quest.id}`}>
            {active ? 'Resume quest' : 'Start quest'}
          </Link>
        )}
      </div>
    </article>
  );
}
