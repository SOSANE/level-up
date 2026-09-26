// The player's mini self, drawn as anime-style SVG with 2.5D shading:
// one key light from the upper left, cylinder-style volume on every body part, soft shadows and a cyan rim light on the right.
// `look` = their customisation (body, skin, hair, eyes, outfit), `stage` = evolution (0–5, one per rank).
// crop="bust" frames head and shoulders (portraits); the default shows the whole outfit.
import { useId } from 'react';
import { DEFAULT_LOOK } from '../api/look.js';

const INK = '#221720'; // line-art colour
const RIM = '#BFE3FF'; // rim light from the right (cyan, matches the System windows)

// Mix a hex colour toward black (k < 0) or white (k > 0).
export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const t = k < 0 ? 0 : 255, a = Math.abs(k);
  const ch = (v) => Math.round(v + (t - v) * a).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

// ---------- hair ----------
const BACK = {
  long: 'M36,46 C30,72 32,104 38,120 L46,110 L52,121 L60,112 L68,121 L74,110 L82,120 C88,104 90,72 84,46 Z',
  bob: 'M35,46 C31,62 33,76 39,84 L46,79 L53,85 L60,80 L67,85 L74,79 L81,84 C87,76 89,62 85,46 Z',
  ponytail: 'M77,28 C95,32 99,58 92,86 C90,98 85,106 82,112 L80,98 L76,106 C80,86 84,66 76,44 Z',
  twintails: 'M43,32 C25,42 20,70 27,102 L32,94 L35,108 C37,82 38,58 47,40 Z M77,32 C95,42 100,70 93,102 L88,94 L85,108 C83,82 82,58 73,40 Z',
  nape: 'M38,48 C36,60 39,69 44,74 L50,70 L55,75 L60,70 L65,75 L70,70 L76,74 C81,69 84,60 82,48 Z'
};
const CAP = 'M36,56 C33,30 46,16 60,16 C75,16 87,30 84,56 C81,42 72,32 60,32 C48,32 39,42 36,56 Z';
const BANGS = {
  spiky: 'M39,47 L43,61 L46,44 L50,57 L53,40 L57,55 L60,38 L63,54 L67,40 L70,56 L74,43 L77,60 L81,46 C79,33 71,28 60,28 C49,28 41,33 39,47 Z',
  swept: 'M38,53 C37,34 48,26 62,26 C75,27 83,35 82,50 C80,46 77,43 73,42 L75,54 L67,41 L64,56 L58,39 L52,55 L50,40 L44,57 C41,51 40,49 38,53 Z',
  blunt: 'M38,50 C37,32 48,26 60,26 C72,26 83,32 82,50 L77,49 L74,53 L69,49 L65,53 L60,49 L55,53 L51,49 L46,53 L43,49 Z'
};
const TUFTS = 'M37,44 C31,38 27,35 21,35 C27,30 32,28 36,28 C32,21 33,15 37,10 C40,16 44,19 49,20 C49,13 53,8 59,5 C58,11 59,15 63,17 C67,11 73,9 80,9 C76,14 75,18 77,21 C82,19 87,20 93,23 C88,25 85,28 85,33 C89,34 92,37 95,42 C90,42 87,43 84,46 Z';
const FLICKS = 'M38,48 C35,56 31,61 26,64 C31,66 35,65 38,63 C36,69 36,73 39,77 L43,64 Z M82,48 C85,56 89,61 94,64 C89,66 85,65 82,63 C84,69 84,73 81,77 L77,64 Z';
const SIDE_SHORT = 'M37,46 C35,56 37,64 42,70 L45,57 Z M83,46 C85,56 83,64 78,70 L75,57 Z';
const SIDE_LONG = 'M37,46 C34,60 36,74 41,84 L45,62 Z M83,46 C86,60 84,74 79,84 L75,62 Z';

const STYLE = {
  messy: { back: 'nape', bangs: 'spiky', tufts: true, side: FLICKS },
  short: { back: 'nape', bangs: 'swept', side: SIDE_SHORT },
  bob: { back: 'bob', bangs: 'blunt', side: SIDE_LONG },
  long: { back: 'long', bangs: 'swept', side: SIDE_LONG },
  ponytail: { back: 'ponytail', bangs: 'swept', side: SIDE_SHORT, tie: [78, 31] },
  twintails: { back: 'twintails', bangs: 'blunt', side: SIDE_SHORT, tie: [[44, 34], [76, 34]] },
  curly: { back: 'nape', curls: true },
  buzz: { buzz: true }
};

function HairBack({ style, fx }) {
  const s = STYLE[style] || STYLE.messy;
  if (!s.back) return null;
  return <path d={BACK[s.back]} fill={fx.hairBack} stroke={INK} strokeWidth="1" strokeLinejoin="round" />;
}

function HairFront({ style, color, accent, fx }) {
  const s = STYLE[style] || STYLE.messy;
  const line = { stroke: INK, strokeWidth: 1, strokeLinejoin: 'round' };
  const shine = shade(color, 0.4);
  if (s.buzz) {
    return (
      <g>
        <path d="M39,52 C36,24 84,24 81,52 C79,44 76,39 71,37 C64,34.5 56,34.5 49,37 C44,39 41,44 39,52 Z" fill={fx.hair} {...line} />
        <path d="M44,30 L40,40 M50,27 L47,36 M60,26 L60,34 M70,27 L73,36 M76,30 L80,40" stroke={shade(color, -0.4)} strokeWidth=".7" strokeLinecap="round" />
      </g>
    );
  }
  if (s.curls) {
    const puffs = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * 1.02 + (i / 10) * Math.PI * 0.96;
      puffs.push([60 + Math.cos(a) * 23, 46 + Math.sin(a) * 26, 8]);
    }
    puffs.push([47, 36, 7.5], [56, 32, 8], [65, 32, 8], [73, 37, 7.5], [43, 46, 6.5], [77, 46, 6.5]);
    return (
      <g>
        {puffs.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={fx.curl} {...line} />)}
        {puffs.slice(11, 15).map(([x, y], i) => <path key={`h${i}`} d={`M${x - 3},${y - 2} q3,-3 6,0`} stroke={shine} strokeWidth="1.4" fill="none" strokeLinecap="round" />)}
      </g>
    );
  }
  const ties = s.tie ? (Array.isArray(s.tie[0]) ? s.tie : [s.tie]) : [];
  return (
    <g>
      {s.tufts && <path d={TUFTS} fill={fx.hairBack} {...line} />}
      <path d={CAP} fill={fx.hair} {...line} />
      <path d={s.side} fill={fx.hair} {...line} />
      <path d={BANGS[s.bangs]} fill={fx.hair} {...line} />
      {/* rim light catching the right edge of the hair */}
      <path d={s.tufts ? 'M77,21 C82,19 87,20 93,23 C88,25 85,28 85,33 C89,34 92,37 95,42' : 'M64,16.5 C77,18 87,30 84,56'}
        fill="none" stroke={RIM} strokeWidth="1.3" strokeLinecap="round" opacity=".6" />
      {/* strand lines + the glossy "angel ring" */}
      <path d="M50,30 L48,42 M60,29 L60,40 M70,30 L72,42" stroke={shade(color, -0.45)} strokeWidth=".8" strokeLinecap="round" />
      <path d="M45,31.5 L50,27.2 L52,28.2 L47,32.6 Z M53.5,26.4 L58.5,24.4 L59.6,25.8 L54.6,27.8 Z M61.5,24.2 L65,23.8 L65.4,25.2 L62,25.8 Z" fill={shine} opacity=".9" />
      {ties.map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.6" fill={accent} stroke={INK} strokeWidth=".8" />)}
    </g>
  );
}

// ---------- face ----------
function Eye({ look, glow, sharp, girl, gid, clip }) {
  const iris = glow ? '#4FB8FF' : look.eyes;
  const lid = sharp ? 'M45,52.5 Q51,49 57.5,51.2' : 'M45,52.5 Q51,47.6 57.5,51';
  return (
    <g filter={glow ? `url(#glow${gid})` : undefined}>
      <clipPath id={clip}><path d="M45.5,52.5 Q51,49 57,51.5 L56.6,57.3 Q51,60 46,57 Z" /></clipPath>
      <path d="M45.5,52.5 Q51,49 57,51.5 L56.6,57.3 Q51,60 46,57 Z" fill={glow ? '#E6FDFF' : '#FFFFFF'} />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="51.6" cy="55.2" rx="4" ry="4.9" fill={`url(#iris${gid})`} />
        <ellipse cx="51.6" cy="55.2" rx="4" ry="4.9" fill="none" stroke={shade(iris, -0.6)} strokeWidth=".6" />
        <ellipse cx="51.6" cy="55.6" rx="1.9" ry="2.7" fill={glow ? '#FFFFFF' : shade(iris, -0.7)} />
        <path d="M45,51.5 Q51,49.5 57.5,51.5 L57.5,53.4 Q51,51.3 45,53.4 Z" fill="#000" opacity=".18" />
      </g>
      <circle cx="53" cy="53.4" r="1.35" fill="#fff" />
      <circle cx="50.3" cy="57.3" r=".6" fill="#fff" opacity=".9" />
      <path d={lid} stroke={INK} strokeWidth={girl ? 2.4 : 2} strokeLinecap="round" fill="none" />
      {girl && <path d="M57,51 L60,49.3 M57.3,52.4 L60.2,51.8" stroke={INK} strokeWidth="1" strokeLinecap="round" />}
      <path d="M47.2,58.4 Q51.5,59.9 55.6,58.5" stroke={INK} strokeWidth=".7" strokeLinecap="round" fill="none" opacity=".7" />
    </g>
  );
}

// ---------- outfit (evolves by stage) ----------
function Outfit({ stage, color, sw, skin, glow, girl, fx }) {
  const L = 60 - sw, R = 60 + sw;
  const waist = girl ? 4 : -3; // girls: gentle waist curve
  const torso = `M${L},90 Q${L + waist},120 ${L + 3},150 L${R - 3},150 Q${R - waist},120 ${R},90 Q${R - 6},84 66,84 L54,84 Q${L + 6},84 ${L},90 Z`;
  const armL = `M${L},92 Q${L - 9},114 ${L - 8},150 L${L + 2},150 Q${L + 1},116 ${L + 6},98 Z`;
  const armR = `M${R},92 Q${R + 9},114 ${R + 8},150 L${R - 2},150 Q${R - 1},116 ${R - 6},98 Z`;
  const dark = shade(color, -0.45);
  const ink = { stroke: INK, strokeWidth: 0.9, strokeLinejoin: 'round' };
  // round every limb and the torso: light on the left, falling into shadow on the right
  const vol = (d) => <path d={d} fill={fx.vol} />;
  const rim = <path d={torso} fill="none" stroke={RIM} strokeWidth="1.2" opacity=".45" clipPath={fx.rimClip} />;

  if (stage <= 1) { // hoodie (stage 0 adds backpack straps)
    const main = stage === 0 ? shade(color, -0.12) : color;
    return (
      <g>
        <path d={armL} fill={shade(main, -0.15)} {...ink} /><path d={armR} fill={shade(main, -0.15)} {...ink} />
        {vol(armL)}{vol(armR)}
        <path d={torso} fill={main} {...ink} />
        {vol(torso)}{rim}
        <path d={`M${L + 4},98 Q${L + 10},120 ${L + 6},150 L${L + 3},150 Q${L + waist},120 ${L},90 Z`} fill="#000" opacity=".14" />
        <path d="M45,84 Q60,97 75,84 Q73,77 60,77 Q47,77 45,84 Z" fill={dark} {...ink} />
        <path d="M56,88 L55,102 M64,88 L65,102" stroke="#EDF4F9" strokeWidth="1.2" strokeLinecap="round" />
        {stage === 1 && <path d="M60,92 L60,150" stroke="#EDF4F9" strokeWidth="1" opacity=".5" />}
        <rect x="46" y="127" width="28" height="13" rx="4" fill={shade(main, -0.22)} {...ink} />
        {stage === 0 && (
          <g stroke="#2E4436" strokeWidth="5" strokeLinecap="round">
            <path d={`M${L + 7},88 L${L + 11},150`} /><path d={`M${R - 7},88 L${R - 11},150`} />
          </g>
        )}
      </g>
    );
  }
  if (stage === 2) { // athletic tee, bare arms
    return (
      <g>
        <path d={armL} fill={skin} {...ink} /><path d={armR} fill={skin} {...ink} />
        {vol(armL)}{vol(armR)}
        <path d={`M${L},90 Q${L - 5},98 ${L - 5},108 L${L + 6},108 L${L + 6},94 Z`} fill={color} {...ink} />
        <path d={`M${R},90 Q${R + 5},98 ${R + 5},108 L${R - 6},108 L${R - 6},94 Z`} fill={color} {...ink} />
        <path d={torso} fill={color} {...ink} />
        {vol(torso)}{rim}
        <path d="M54,84 L60,95 L66,84 Z" fill={skin} {...ink} />
        <path d="M52,114 Q60,118 68,114 M53,126 Q60,129 67,126" stroke={dark} strokeWidth="1.1" fill="none" opacity=".6" />
      </g>
    );
  }
  if (stage === 3) { // open field jacket over a black turtleneck, dagger
    return (
      <g>
        <path d={armL} fill={shade(color, -0.12)} {...ink} /><path d={armR} fill={shade(color, -0.12)} {...ink} />
        {vol(armL)}{vol(armR)}
        <path d={torso} fill={color} {...ink} />
        {vol(torso)}{rim}
        <path d="M51,80 L69,80 L68,150 L52,150 Z" fill="#141318" {...ink} />
        {vol('M51,80 L69,80 L68,150 L52,150 Z')}
        <path d="M44,86 L52,82 L56,104 L51,150 M76,86 L68,82 L64,104 L69,150" fill="none" stroke={INK} strokeWidth=".9" />
        <path d="M43,86 L52,80 L49,94 Z M77,86 L68,80 L71,94 Z" fill="#6E9CC8" {...ink} />
        <g transform={`translate(${R + 2} 128) rotate(28)`}>
          <rect x="-3" y="-4" width="6" height="12" rx="2" fill="#2A1A10" {...ink} />
          <path d="M-4,8 L4,8 L2,34 L0,40 L-2,34 Z" fill="#B9C9D6" stroke="#E0304F" strokeWidth="1" />
        </g>
      </g>
    );
  }
  // stage 4: rune coat, stage 5: fur-collared long coat
  const coat = stage === 4 ? '#0E1A30' : shade(color, -0.55);
  return (
    <g>
      <path d={`M${L - 4},94 Q${L - 10},126 ${L - 6},150 L${R + 6},150 Q${R + 10},126 ${R + 4},94 Z`} fill={shade(coat, -0.2)} {...ink} />
      <path d={armL} fill={coat} {...ink} /><path d={armR} fill={coat} {...ink} />
      {vol(armL)}{vol(armR)}
      <path d={torso} fill={coat} {...ink} />
      {vol(torso)}{rim}
      <path d="M53,80 L67,80 L66,150 L54,150 Z" fill="#070D18" {...ink} />
      {stage === 4 ? (
        <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" filter={glow}>
          <path d={`M53,84 L53,150 M67,84 L67,150 M${L + 4},102 L${L + 12},110 M${R - 4},102 L${R - 12},110`} />
          <path d="M46,82 Q60,72 74,82" />
        </g>
      ) : (
        <g fill={fx.fur} stroke={INK} strokeWidth=".8">
          {[[40, 94, 7], [80, 94, 7], [44, 86, 9], [76, 86, 9], [52, 82, 8], [68, 82, 8], [60, 81, 8]].map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} />)}
        </g>
      )}
    </g>
  );
}

export default function MiniSelf({ look = DEFAULT_LOOK, stage = 0, size = 160, locked = false, crop, x, y, title }) {
  const gid = useId().replace(/:/g, '');
  const glow = `url(#glow${gid})`;
  const girl = look.body === 'girl';
  const sw = [23, 25, 29, 30, 32, 33][stage] - (girl ? 3 : 0);
  const glowEyes = stage >= 4;
  const sharp = stage >= 3;
  const skinShade = shade(look.skin, -0.14);
  const u = (n) => `url(#${n}${gid})`;
  const fx = { vol: u('vol'), hair: u('hair'), hairBack: u('hairBack'), curl: u('curl'), fur: u('fur'), rimClip: u('rim') };
  const facePath = girl
    ? 'M41,46 C41,32 50,25 60,25 C70,25 79,32 79,46 C79,58 76,65 71,70.5 C67,75 63,77 60,77 C57,77 53,75 49,70.5 C44,65 41,58 41,46 Z'
    : 'M41,46 C41,32 50,25 60,25 C70,25 79,32 79,46 C79,58 76.5,66 71,71.5 C67,76 63,78.5 60,78.5 C57,78.5 53,76 49,71.5 C43.5,66 41,58 41,46 Z';
  const neckPath = girl ? 'M55,70 L55,86 Q60,89 65,86 L65,70 Z' : 'M53.5,70 L53.5,86 Q60,90 66.5,86 L66.5,70 Z';
  const bust = crop === 'bust';
  const [vx, vy, vw, vh] = bust ? [22, 4, 76, 92] : [0, 0, 120, 150];

  return (
    <svg x={x} y={y} width={size} height={size * (vh / vw)} viewBox={`${vx} ${vy} ${vw} ${vh}`}
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}
      style={locked ? { filter: 'brightness(0) opacity(.55)' } : undefined}>
      <defs>
        <radialGradient id={`aura${gid}`}>
          <stop offset="0%" stopColor={stage === 5 ? '#E0304F' : look.outfit} stopOpacity=".55" />
          <stop offset="100%" stopColor={look.outfit} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`iris${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(glowEyes ? '#4FB8FF' : look.eyes, -0.55)} />
          <stop offset="55%" stopColor={glowEyes ? '#4FB8FF' : look.eyes} />
          <stop offset="100%" stopColor={shade(glowEyes ? '#4FB8FF' : look.eyes, 0.45)} />
        </linearGradient>
        {/* 2.5D shading kit */}
        <linearGradient id={`vol${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset=".32" stopColor="#fff" stopOpacity="0" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".36" />
        </linearGradient>
        <radialGradient id={`face${gid}`} cx=".36" cy=".3" r=".85">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".42" stopColor="#fff" stopOpacity="0" />
          <stop offset=".75" stopColor="#000" stopOpacity=".06" /><stop offset="1" stopColor="#000" stopOpacity=".26" />
        </radialGradient>
        <linearGradient id={`hair${gid}`} x1=".2" y1="0" x2=".7" y2="1">
          <stop offset="0" stopColor={shade(look.hair, 0.3)} /><stop offset=".45" stopColor={look.hair} /><stop offset="1" stopColor={shade(look.hair, -0.35)} />
        </linearGradient>
        <linearGradient id={`hairBack${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(look.hair, -0.12)} /><stop offset="1" stopColor={shade(look.hair, -0.5)} />
        </linearGradient>
        <radialGradient id={`curl${gid}`} cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor={shade(look.hair, 0.38)} /><stop offset=".5" stopColor={look.hair} /><stop offset="1" stopColor={shade(look.hair, -0.4)} />
        </radialGradient>
        <radialGradient id={`fur${gid}`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset=".6" stopColor="#DCE6EE" /><stop offset="1" stopColor="#9FB3C2" />
        </radialGradient>
        <clipPath id={`rim${gid}`}><rect x="63" y="0" width="60" height="150" /></clipPath>
        <filter id={`soft${gid}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1" /></filter>
        <filter id={`glow${gid}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {stage >= 4 && <circle cx="60" cy="84" r={stage === 5 ? 62 : 54} fill={`url(#aura${gid})`} />}
      {stage === 5 && (
        <g stroke="#4FB8FF" strokeWidth="1.2" fill="none" opacity=".7">
          <path d="M18,40 L26,52 L20,58 L30,72" /><path d="M102,36 L94,50 L100,56 L90,70" />
        </g>
      )}

      <HairBack style={look.hairStyle} fx={fx} />
      <Outfit stage={stage} color={look.outfit} sw={sw} skin={look.skin} glow={glow} girl={girl} fx={fx} />

      {/* neck + head */}
      <path d={neckPath} fill={look.skin} stroke={INK} strokeWidth=".9" />
      <path d={neckPath} fill={fx.vol} />
      {/* soft shadow the chin casts on the neck */}
      <path d="M53.5,74 Q60,81 66.5,74 L66.5,70 L53.5,70 Z" fill={shade(look.skin, -0.3)} opacity=".75" filter={u('soft')} />
      <path d="M40.5,52 C37,52 37,60 41.5,62 Z M79.5,52 C83,52 83,60 78.5,62 Z" fill={skinShade} stroke={INK} strokeWidth=".9" />
      <path d={facePath} fill={look.skin} stroke={INK} strokeWidth="1" />
      <path d={facePath} fill={u('face')} />
      {/* soft shadow cast by the bangs, a cheek highlight, and the rim light on the jaw */}
      {look.hairStyle !== 'buzz' && <path d="M41,44 Q60,55 79,44 L79,39 Q60,48 41,39 Z" fill={shade(look.skin, -0.25)} opacity=".8" filter={u('soft')} />}
      <ellipse cx="47.5" cy="60.5" rx="3.2" ry="2" fill="#fff" opacity=".22" filter={u('soft')} />
      <path d={facePath} fill="none" stroke={RIM} strokeWidth="1.2" opacity=".5" clipPath={fx.rimClip} />

      {!locked && (
        <g>
          <path d={sharp ? 'M45,47.2 L56.5,45.6 M63.5,45.6 L75,47.2' : 'M45.5,46.8 Q51,44.6 56.5,46 M63.5,46 Q69,44.6 74.5,46.8'}
            stroke={shade(look.hair, -0.3)} strokeWidth={sharp ? 1.6 : 1.3} strokeLinecap="round" fill="none" />
          <Eye look={look} glow={glowEyes} sharp={sharp} girl={girl} gid={gid} clip={`eyeL${gid}`} />
          <g transform="translate(120 0) scale(-1 1)">
            <Eye look={look} glow={glowEyes} sharp={sharp} girl={girl} gid={gid} clip={`eyeR${gid}`} />
          </g>
          {glowEyes && <path d="M74,55 L88,51" stroke="#4FB8FF" strokeWidth="1.2" strokeLinecap="round" opacity=".8" filter={glow} />}
          <ellipse cx="46.5" cy="63.5" rx="3.6" ry="1.6" fill="#FF7A8A" opacity=".22" />
          <ellipse cx="73.5" cy="63.5" rx="3.6" ry="1.6" fill="#FF7A8A" opacity=".22" />
          <path d="M59.3,58.5 L58.6,62.2" stroke="#fff" strokeWidth=".8" strokeLinecap="round" opacity=".35" />
          <path d="M60.6,60.5 L59.4,64.2 L61,64.4" stroke={shade(look.skin, -0.35)} strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={sharp ? 'M56.5,69.4 Q60,70.2 63.5,69.2' : girl ? 'M56.8,68.6 Q60,71.2 63.2,68.6' : 'M55.8,68.4 Q60,71.6 64.2,68.2'}
            stroke={INK} strokeWidth="1.1" strokeLinecap="round" fill="none" />
          {girl && !sharp && <path d="M57.8,70.1 Q60,71.3 62.2,70.1" stroke="#E0707A" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".7" />}
          {stage === 0 && (
            <g transform="translate(73 66.5) rotate(-18)">
              <rect x="-5" y="-2.5" width="10" height="5" rx="1.5" fill="#F3E3C8" stroke={INK} strokeWidth=".5" />
              <path d="M-1,-2.5 L-1,2.5 M1,-2.5 L1,2.5" stroke="#D8C2A0" strokeWidth=".6" />
            </g>
          )}
        </g>
      )}

      <HairFront style={look.hairStyle} color={look.hair} accent={look.outfit} fx={fx} />
    </svg>
  );
}
