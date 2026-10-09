// Launch date interpreted as midnight in India, VeriPeers' home market.
export const LAUNCH_AT = Date.parse('2026-10-20T00:00:00+05:30');
export function getCountdown(now: number) {
  const seconds = Math.max(0, Math.floor((LAUNCH_AT - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}