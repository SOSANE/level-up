// Game days are "YYYY-MM-DD" strings in the server's time zone (set TZ=America/Toronto on the server).
export function todayStr(date = new Date()) {
  return date.toLocaleDateString('en-CA'); // en-CA formats as YYYY-MM-DD
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
