// Small presentational pieces shared across pages.
import { RANK_COLOR, rankOf } from '../api/game.js';

export function Bar({ pct, color = 'var(--blue)', h = 6, w, label }) {
  return (
    <span className="bar" style={{ height: h, width: w }} role={label ? 'progressbar' : undefined}
      aria-label={label} aria-valuenow={label ? Math.round(pct) : undefined} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </span>
  );
}

export function RankBadge({ level, size = 72 }) {
  const r = rankOf(level);
  return (
    <div className="rank-box" style={{ width: size, height: size, fontSize: size * 0.55, borderColor: RANK_COLOR[r], color: RANK_COLOR[r] }}
      aria-label={`Rank ${r}`}>{r}</div>
  );
}

export function Avatar({ color = '#F2B84B', size = 64, locked = false }) {
  const fill = locked ? '#2A3345' : color;
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 40 44" aria-hidden="true">
      <circle cx="20" cy="12" r="8" fill={fill} />
      <path d="M6 44 L10 26 Q20 20 30 26 L34 44 Z" fill={fill} />
    </svg>
  );
}

export function MaterialIcon({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 20 9 12 22 4 9Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 9h16M12 2 9 9l3 13 3-13-3-7" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export const CoinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F2B84B" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" />
  </svg>
);

export const Check = ({ color = 'currentColor' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 5 5 9-10" />
  </svg>
);
