/**
 * Cloud-free daily replay / verification codes.
 * Encodes claimed score + seed so friends can verify integrity without a server.
 */

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function toBase64Url(str) {
  try {
    const b64 =
      typeof btoa === 'function'
        ? btoa(unescape(encodeURIComponent(str)))
        : Buffer.from(str, 'utf8').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

function fromBase64Url(str) {
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const raw = b64 + pad;
    if (typeof atob === 'function') {
      return decodeURIComponent(escape(atob(raw)));
    }
    return Buffer.from(raw, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Build a shareable code from a finished run.
 */
export function encodeReplayCode({
  seed,
  companyName,
  netWorth,
  turn,
  epilogueId,
  rating,
  difficulty = 'normal',
}) {
  const payload = {
    v: 1,
    s: seed || '',
    n: (companyName || 'Unknown').slice(0, 32),
    w: Math.round(netWorth || 0),
    t: turn || 100,
    e: epilogueId || '',
    r: rating || '',
    d: difficulty || 'normal',
  };
  const body = JSON.stringify(payload);
  const sig = hashStr(body + '|sts-v1');
  return `STS1.${toBase64Url(body)}.${sig}`;
}

/**
 * Verify a replay code. Returns { ok, payload, message }.
 */
export function verifyReplayCode(code) {
  if (!code || typeof code !== 'string') {
    return { ok: false, message: 'Empty code.', payload: null };
  }
  const trimmed = code.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3 || parts[0] !== 'STS1') {
    return { ok: false, message: 'Invalid code format.', payload: null };
  }
  const body = fromBase64Url(parts[1]);
  if (!body) {
    return { ok: false, message: 'Could not decode payload.', payload: null };
  }
  const expect = hashStr(body + '|sts-v1');
  if (expect !== parts[2]) {
    return { ok: false, message: 'Checksum failed — code was altered.', payload: null };
  }
  try {
    const payload = JSON.parse(body);
    if (typeof payload.w !== 'number' || !payload.n) {
      return { ok: false, message: 'Malformed payload.', payload: null };
    }
    return {
      ok: true,
      message: 'Code verified.',
      payload,
    };
  } catch {
    return { ok: false, message: 'Malformed JSON payload.', payload: null };
  }
}

export function formatVerifiedPayload(p) {
  if (!p) return '';
  return [
    `${p.n}`,
    p.s ? `seed ${p.s}` : 'classic',
    `${Math.round(p.w).toLocaleString()} cr NW`,
    `T${p.t}`,
    p.d || 'normal',
    p.r || '',
    p.e || '',
  ]
    .filter(Boolean)
    .join(' · ');
}
