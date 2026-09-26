// Player state: one object in localStorage, shared through context.
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { checkMissedDays, today } from './game.js';

const KEY = 'second-awakening';

const fresh = () => ({
  name: 'Player', character: null, onboarded: false, level: 1, xp: 0, coins: 50,
  chosen: [], answers: {}, bars: {}, materials: {}, history: {}, items: {}, questsDone: 0,
  started: today(), lastCheck: today(), day: null, rift: null
});

function load() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch { /* private mode: start fresh */ }
  const p = { ...fresh(), ...saved };
  if (!p.day || p.day.date !== today()) p.day = { date: today(), status: {}, cleared: false };
  checkMissedDays(p);
  return p;
}

const Ctx = createContext(null);

export function PlayerProvider({ children }) {
  const ref = useRef(null);
  if (!ref.current) ref.current = load();
  const [player, setPlayer] = useState(ref.current);

  // update(fn): fn mutates a clone; its return value is passed back (e.g. a quest reward).
  const update = useCallback((fn) => {
    const next = structuredClone(ref.current);
    const out = fn(next);
    ref.current = next;
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* not persisted */ }
    setPlayer(next);
    return out;
  }, []);

  const reset = useCallback(() => update((p) => { Object.assign(p, fresh(), { day: { date: today(), status: {}, cleared: false } }); }), [update]);

  return <Ctx.Provider value={{ player, update, reset }}>{children}</Ctx.Provider>;
}

export const usePlayer = () => useContext(Ctx);
