// Presage vitals adapter.
// ponytail: simulated heart-rate stream until the Presage SmartSpectra SDK is wired up —
// replace the body of subscribeHeartRate with the SDK's camera-based reading and keep the same callback shape.
export const VITALS_LIVE = false;

export function subscribeHeartRate(onReading) {
  let bpm = 74;
  const id = setInterval(() => {
    bpm = Math.round(Math.min(165, Math.max(58, bpm + (Math.random() - 0.4) * 6)));
    onReading({ bpm, at: Date.now(), simulated: !VITALS_LIVE });
  }, 1000);
  return () => clearInterval(id);
}
