/**
 * Lightweight Web Audio beeps — no asset files required.
 * Respects mute / volume from settings and reduced-motion (still allows short ticks).
 */

let ctx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/**
 * @param {'buy'|'sell'|'travel'|'error'|'ui'|'pirate'|'quest'|'success'} kind
 * @param {{ enabled?: boolean, volume?: number }} settings
 */
export function playSfx(kind, settings = {}) {
  if (settings.enabled === false) return;
  const volume = Math.max(0, Math.min(1, settings.volume ?? 0.35));
  if (volume <= 0) return;

  try {
    const ac = getCtx();
    if (!ac) return;
    if (ac.state === 'suspended') ac.resume();

    const now = ac.currentTime;
    const gain = ac.createGain();
    gain.connect(ac.destination);
    gain.gain.setValueAtTime(0.0001, now);

    const osc = ac.createOscillator();
    osc.connect(gain);

    const patterns = {
      buy: { freq: 520, type: 'sine', dur: 0.08, peak: 0.12 },
      sell: { freq: 380, type: 'triangle', dur: 0.1, peak: 0.12 },
      travel: { freq: 180, type: 'sawtooth', dur: 0.22, peak: 0.08 },
      error: { freq: 140, type: 'square', dur: 0.14, peak: 0.1 },
      ui: { freq: 640, type: 'sine', dur: 0.05, peak: 0.07 },
      pirate: { freq: 90, type: 'square', dur: 0.2, peak: 0.11 },
      quest: { freq: 720, type: 'triangle', dur: 0.12, peak: 0.1 },
      success: { freq: 880, type: 'sine', dur: 0.16, peak: 0.1 },
    };
    const p = patterns[kind] || patterns.ui;

    osc.type = p.type;
    osc.frequency.setValueAtTime(p.freq, now);
    if (kind === 'travel') {
      osc.frequency.exponentialRampToValueAtTime(p.freq * 2.2, now + p.dur);
    }
    if (kind === 'success') {
      osc.frequency.setValueAtTime(p.freq, now);
      osc.frequency.setValueAtTime(p.freq * 1.25, now + 0.06);
    }

    const peak = p.peak * volume;
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

    osc.start(now);
    osc.stop(now + p.dur + 0.02);
  } catch {
    /* ignore audio errors */
  }
}
