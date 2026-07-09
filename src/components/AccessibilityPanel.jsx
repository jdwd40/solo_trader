export default function AccessibilityPanel({ settings, onChange }) {
  return (
    <section className="panel a11y-panel">
      <div className="panel-header">
        <h2>Accessibility</h2>
      </div>
      <ul className="a11y-list">
        <li>
          <label>
            <input
              type="checkbox"
              checked={Boolean(settings.highContrast)}
              onChange={(e) =>
                onChange({ ...settings, highContrast: e.target.checked })
              }
            />
            High contrast
          </label>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              checked={Boolean(settings.reducedMotion)}
              onChange={(e) =>
                onChange({ ...settings, reducedMotion: e.target.checked })
              }
            />
            Reduced motion
          </label>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              checked={settings.showShortcuts !== false}
              onChange={(e) =>
                onChange({ ...settings, showShortcuts: e.target.checked })
              }
            />
            Show shortcut hints
          </label>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              checked={settings.soundEnabled !== false}
              onChange={(e) =>
                onChange({ ...settings, soundEnabled: e.target.checked })
              }
            />
            Sound effects
          </label>
        </li>
      </ul>
      {settings.soundEnabled !== false ? (
        <label className="volume-row muted">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.soundVolume ?? 0.35}
            onChange={(e) =>
              onChange({
                ...settings,
                soundVolume: Number(e.target.value),
              })
            }
          />
        </label>
      ) : null}
      {settings.showShortcuts !== false ? (
        <p className="shortcut-help muted">
          <kbd>1</kbd>–<kbd>6</kbd> travel · <kbd>F</kbd> fill fuel ·{' '}
          <kbd>I</kbd> intel · <kbd>?</kbd> toggle this panel · <kbd>S</kbd>{' '}
          save · <kbd>L</kbd> load
        </p>
      ) : null}
    </section>
  );
}
