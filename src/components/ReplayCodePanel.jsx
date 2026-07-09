import { useState } from 'react';
import {
  formatVerifiedPayload,
  verifyReplayCode,
} from '../utils/replayCode';

export default function ReplayCodePanel({ code, onCopy }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  function verify() {
    setResult(verifyReplayCode(input));
  }

  return (
    <div className="replay-panel">
      <h3>Replay / verify code</h3>
      {code ? (
        <>
          <p className="muted" style={{ fontSize: '0.82rem' }}>
            Share this cloud-free code. Friends can verify the checksum without a
            server.
          </p>
          <code className="replay-code">{code}</code>
          <button
            type="button"
            className="btn btn-fuel btn-xs"
            style={{ marginTop: '0.45rem' }}
            onClick={() => {
              navigator.clipboard?.writeText(code);
              onCopy?.();
            }}
          >
            Copy code
          </button>
        </>
      ) : null}

      <div className="replay-verify">
        <input
          type="text"
          placeholder="Paste STS1… code to verify"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="btn btn-secondary btn-xs" onClick={verify}>
          Verify
        </button>
      </div>
      {result ? (
        <p className={result.ok ? 'control-message' : 'debt'} style={{ fontSize: '0.85rem' }}>
          {result.message}
          {result.ok && result.payload
            ? ` — ${formatVerifiedPayload(result.payload)}`
            : ''}
        </p>
      ) : null}
    </div>
  );
}
