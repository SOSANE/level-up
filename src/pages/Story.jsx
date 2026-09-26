import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SCENES = [
  { title: 'You were good. Really good.', body: 'Up before the sun. Top of every list. You had a plan, and you kept it.', system: '[STATUS] Discipline: high · Energy: high · Streak: unbroken', color: 'var(--blue)' },
  { title: 'Then you got comfortable.', body: 'The alarm became a suggestion. The gym bag became furniture. “Tomorrow” became your favorite word.', system: '[WARNING] Discipline falling. Quests ignored: too many to count.', color: 'var(--muted)' },
  { title: 'Everyone has a villain arc.', body: 'Yours didn’t wear a mask. It wore sweatpants, held a phone, and whispered “one more episode” at 3 a.m.', system: '[ALERT] Villain arc detected. Main character status: suspended.', color: 'var(--red)' },
  { title: 'I’ve seen this before.', body: 'Every hunter worth remembering started at Rank E. Weak. Ignored. Hungry. That isn’t the end of your story. It’s the setup.', system: '[NOTICE] Dormant potential found. It has been waiting for you.', color: 'var(--violet)' },
  { title: 'Welcome to your Second Awakening.', body: 'The System has chosen you. Your first quests start today. Don’t make me regret it.', system: '[SYSTEM] You have been selected as a Player. Accept?', color: 'var(--gold)' }
];
const HS = [10, 22, 16, 30, 12, 26, 34, 18, 24, 14, 32, 20, 28, 12, 22, 36, 16, 26, 10, 30, 18, 24, 14, 20];

export default function Story() {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(false);
  const s = SCENES[i];
  const last = i === SCENES.length - 1;

  // Narrator voice via the browser's speech synthesis.
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    if (!muted) speechSynthesis.speak(new SpeechSynthesisUtterance(`${s.title} ${s.body}`));
    return () => speechSynthesis.cancel();
  }, [i, muted, s]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 1280, margin: '0 auto' }}>
      <header className="row between story-pad" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="brand" style={{ fontSize: 18 }}>SECOND AWAKENING</div>
        <div className="row" style={{ gap: 28 }}>
          <span className="mono muted hide-sm" style={{ fontSize: 13 }}>CHAPTER 0{i + 1} / 05</span>
          <Link to="/login" style={{ fontSize: 15, color: 'var(--muted)', textDecoration: 'none', padding: '12px 4px' }}>Skip intro</Link>
        </div>
      </header>

      <main className="row wrap story-pad" style={{ flexGrow: 1, gap: 48 }}>
        <div className="col" style={{ flex: '1 1 520px', maxWidth: 640, gap: 28 }}>
          <div className="row mono" style={{ gap: 10, fontSize: 13, color: s.color }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />JINHO · NARRATOR
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1.05 }} aria-live="polite">{s.title}</h1>
          <p className="soft" style={{ fontSize: 22, lineHeight: 1.55, maxWidth: 580 }}>{s.body}</p>
          <div className="row" style={{ gap: 16, paddingTop: 8 }}>
            <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn narrator voice on' : 'Mute narrator voice'} className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4z" />
                {muted ? <path d="m16 9 6 6M22 9l-6 6" /> : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
              </svg>
            </button>
            <div className={`wave${muted ? ' muted' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36 }} aria-hidden="true">
              {HS.map((h, k) => <span key={k} style={{ height: h, animationDelay: `${(k * 0.07).toFixed(2)}s`, background: s.color }} />)}
            </div>
            <span className="mono muted" style={{ letterSpacing: '.06em' }}>{muted ? 'VOICE OFF' : 'JINHO IS SPEAKING'}</span>
          </div>
        </div>
        <div className="col" style={{ flex: '1 1 360px', alignItems: 'center', gap: 24 }}>
          <svg viewBox="0 0 420 440" style={{ width: '100%', maxWidth: 420 }} aria-hidden="true">
            <rect x="60" y="10" width="300" height="400" rx="150" fill="none" stroke={s.color} strokeWidth="1" opacity="0.18" />
            <rect x="95" y="45" width="230" height="345" rx="115" fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.32" />
            <rect x="130" y="80" width="160" height="290" rx="80" fill="none" stroke={s.color} strokeWidth="2" opacity="0.55" />
            <rect x="160" y="112" width="100" height="238" rx="50" fill={s.color} fillOpacity="0.10" stroke={s.color} strokeWidth="2.5" />
            <circle cx="210" cy="296" r="9" fill="var(--fg)" />
            <path d="M199 350 L203 312 L217 312 L221 350 Z" fill="var(--fg)" />
            <line x1="40" y1="410" x2="380" y2="410" stroke="var(--line2)" strokeWidth="1" />
          </svg>
          <div className="sys" style={{ width: '100%', maxWidth: 400, borderColor: s.color }}>{s.system}</div>
        </div>
      </main>

      <footer className="row between wrap story-pad" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="row" style={{ gap: 8 }}>
          {SCENES.map((x, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Go to chapter ${k + 1}`} aria-current={k === i ? 'step' : undefined}
              style={{ height: 44, width: k === i ? 44 : 20, padding: 0, border: 0, background: 'transparent', display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'block', width: '100%', height: 6, borderRadius: 3, background: k === i ? s.color : 'var(--line2)' }} />
            </button>
          ))}
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={() => setI(i - 1)} disabled={i === 0}>Back</button>
          {last
            ? <Link className="btn btn-gold" to="/login">Accept the call</Link>
            : <button className="btn btn-light" onClick={() => setI(i + 1)}>Continue</button>}
        </div>
      </footer>
    </div>
  );
}
