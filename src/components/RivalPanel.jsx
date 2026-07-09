import { fmt } from '../utils/gameLogic';

export default function RivalPanel({ rival }) {
  if (!rival) return null;

  return (
    <section className="panel rival-panel">
      <div className="panel-header">
        <h2>Sector Rival</h2>
        <span className="badge muted-badge">NPC</span>
      </div>
      <p className="rival-name">
        <strong>{rival.name}</strong>
      </p>
      <ul className="rival-stats">
        <li>
          <span className="muted">Last seen</span>
          <strong>{rival.planet}</strong>
        </li>
        <li>
          <span className="muted">Est. capital</span>
          <strong>{fmt(rival.credits)} cr</strong>
        </li>
      </ul>
      <p className="muted intel-blurb">
        Rivals jump toward shortages and steal juicy runs. Watch the news ticker.
      </p>
    </section>
  );
}
