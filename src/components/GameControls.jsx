import { useRef } from 'react';
import { dailySeedKey } from '../utils/rng';

export default function GameControls({
  onNewGame,
  onNewDaily,
  onSave,
  onLoad,
  onExport,
  onImportFile,
  onReplayTutorial,
  onSwitchHull,
  message,
  runMode,
  rngSeed,
}) {
  const fileRef = useRef(null);

  return (
    <section className="panel controls-panel">
      <div className="panel-header">
        <h2>Game</h2>
        <span className="badge muted-badge">
          {runMode === 'daily' ? `Daily ${rngSeed || dailySeedKey()}` : 'Classic'}
        </span>
      </div>
      <div className="controls-row">
        <button type="button" className="btn btn-secondary" onClick={onNewGame}>
          New Classic
        </button>
        <button type="button" className="btn btn-fuel" onClick={onNewDaily}>
          New Daily
        </button>
        <button type="button" className="btn btn-secondary" onClick={onSave}>
          Save
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLoad}>
          Load
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExport}>
          Export
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile?.(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSwitchHull}
        >
          Hull
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReplayTutorial}
        >
          Tutorial
        </button>
      </div>
      {message ? <p className="control-message">{message}</p> : null}
    </section>
  );
}
