import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePlayer } from '../api/player.jsx';

const SCENES = [
{ img: 'scene-1', label: 'THE PLAN', alt: 'Jinwoo, calm and confident in a grey jacket', title: 'You were built different.', body: 'Up before the sun. First on every list. No excuses, no days off  just the grind, on repeat.', system: '[STATUS] Discipline: high · Energy: high · Streak: unbroken', color: 'var(--blue)' },
{ img: 'scene-2', label: 'COMFORT', alt: 'Jinwoo in a worn hoodie, looking drained', title: 'Then the grind stopped.', body: 'The alarm became a suggestion. The gym bag became furniture. Tomorrow became the whole plan.', system: '[WARNING] Discipline falling. Quests ignored: too many to count.', color: 'var(--muted)' },
{ img: 'scene-3', label: 'VILLAIN ARC', alt: 'Jinwoo with glowing eyes, in the middle of a fight', title: 'Everyone has a villain arc.', body: 'Yours didn\'t wear a mask. It looked like snoozed alarms and nights that blurred into nothing.', system: '[ALERT] Villain arc detected. Main character status: suspended.', color: 'var(--red)' },
{ img: 'scene-4', label: 'RANK E', alt: 'Jinwoo at Rank E, bandaged and carrying a backpack', title: 'Every legend starts at zero.', body: 'Rank E. Weak. Overlooked. Underestimated. That\'s not your ceiling  that\'s your origin story.', system: '[NOTICE] Dormant potential found. It has been waiting for you.', color: 'var(--sapphire-light)' },
{ img: 'scene-5', label: 'AWAKENING', alt: 'Jinwoo at Rank E in his blue hoodie, his future self standing behind him as a shadow with glowing eyes', title: 'This is your Awakening.', body: 'The System has chosen you. Every rep counts. Every quest matters. Let\u2019s see what you\u2019re really made of.', system: '[SYSTEM] You have been selected as a Player. Accept?', color: 'var(--gold)' },
  ];
const EMBERS = Array.from({ length: 22 }, (_, k) => ({
  left: `${(k * 37) % 100}%`, bottom: `${(k * 23) % 40}%`,
  animationDelay: `${((k * 0.61) % 6).toFixed(2)}s`, animationDuration: `${6 + (k % 5)}s`
}));
const HS = [10, 22, 16, 30, 12, 26, 34, 18, 24, 14, 32, 20, 28, 12, 22, 36, 16, 26, 10, 30, 18, 24, 14, 20];

export default function Story() {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(false);
  const { enterDemo } = usePlayer();
  const navigate = useNavigate();
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
    <div className="story-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 1280, margin: '0 auto', '--story-c': s.color }}>
      <header className="row between story-pad" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="brand" style={{ fontSize: 18 }}>SECOND AWAKENING</div>
        <div className="row" style={{ gap: 28 }}>
          <span className="mono muted hide-sm" style={{ fontSize: 13 }}>CHAPTER 0{i + 1} / 05</span>
          <button className="pill demo-pill" onClick={() => { enterDemo(); navigate('/dashboard'); }}>★ Judge demo (Rank S)</button>
          <Link to="/login" style={{ fontSize: 15, color: 'var(--muted)', textDecoration: 'none', padding: '12px 4px' }}>Skip intro</Link>
        </div>
      </header>

      <main className="story-pad" style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <section className="story-card" style={{ '--story-c': s.color }} aria-label={`Chapter ${i + 1}: ${s.label}`}>
          <span className="story-embers" aria-hidden="true">{EMBERS.map((e, k) => <i key={k} style={e} />)}</span>

          <div className="col story-text">
            <div className="story-badge"><b>{String(i + 1).padStart(2, '0')}</b><span>CHAPTER</span></div>
            <span className="mono story-kicker">JINWOO · NARRATOR</span>
            <h1 key={`t${i}`} className="story-heading" aria-live="polite">{s.title}</h1>
            <p key={`b${i}`} className="story-copy">{s.body}</p>
            <div className="sys story-sys">{s.system}</div>
            <div className="row" style={{ gap: 16 }}>
              <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn narrator voice on' : 'Mute narrator voice'} className="icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 5 6 9H3v6h3l5 4z" />
                  {muted ? <path d="m16 9 6 6M22 9l-6 6" /> : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
                </svg>
              </button>
              <div className={`wave${muted ? ' muted' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36 }} aria-hidden="true">
                {HS.map((h, k) => <span key={k} style={{ height: h, animationDelay: `${(k * 0.07).toFixed(2)}s`, background: 'var(--story-c)' }} />)}
              </div>
              <span className="mono muted" style={{ letterSpacing: '.06em' }}>{muted ? 'VOICE OFF' : 'JINWOO IS SPEAKING'}</span>
            </div>
          </div>

          <div className="story-figure">
            {SCENES.map((x, k) => ( // all mounted: switching chapters crossfades instead of reloading an image
              <img key={x.img} className={`story-portrait${k === i ? ' on' : ''}`} src={`/story/${x.img}.jpg`}
                alt={k === i ? x.alt : ''} aria-hidden={k !== i} />
            ))}
          </div>

          <nav className="story-index" aria-label="Chapters">
            {SCENES.map((x, k) => (
              <button key={x.img} onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined}>{x.label}</button>
            ))}
          </nav>
        </section>
      </main>
      <p className="story-credit story-pad">Images: Solo Leveling © Chugong, DUBU (REDICE Studio), D&amp;C Media · anime by A-1 Pictures; chapter 5 is fan art. Fan project, not affiliated.</p>

      <footer className="row between wrap story-pad" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="row" style={{ gap: 8 }}>
          {SCENES.map((x, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Go to chapter ${k + 1}`} aria-current={k === i ? 'step' : undefined}
              style={{ height: 44, width: k === i ? 44 : 20, padding: 0, border: 0, background: 'transparent', display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'block', width: '100%', height: 6, borderRadius: 3, background: k === i ? 'var(--story-c)' : 'var(--line2)', transition: 'background .6s' }} />
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
