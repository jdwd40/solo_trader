/**
 * Optional seeded PRNG (mulberry32) for daily / challenge runs.
 * When no seed is set, falls back to Math.random.
 */

let _seedLabel = null;
let _state = 0;
let _seeded = false;

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 1;
}

export function setRngSeed(seedLabel) {
  if (seedLabel == null || seedLabel === '') {
    _seedLabel = null;
    _seeded = false;
    _state = 0;
    return;
  }
  _seedLabel = String(seedLabel);
  _state = hashString(_seedLabel);
  _seeded = true;
}

export function getRngSeed() {
  return _seedLabel;
}

export function isSeeded() {
  return _seeded;
}

/** Mulberry32 */
export function rng() {
  if (!_seeded) return Math.random();
  let t = (_state += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** UTC calendar day key for shared daily runs */
export function dailySeedKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `daily-${y}-${m}-${d}`;
}
