import { ACHIEVEMENTS } from '../data/gameData';
import { fmt } from '../utils/gameLogic';

export default function StatsAchievements({ state }) {
  const stats = state.stats || {};
  const unlocked = new Set(state.achievements || []);

  return (
    <section className="panel stats-panel">
      <div className="panel-header">
        <h2>Stats & Badges</h2>
        <span className="badge">{state.shipTitle || 'Rookie Hauler'}</span>
      </div>

      <dl className="stats-grid">
        <div>
          <dt>Jumps</dt>
          <dd>{stats.jumps || 0}</dd>
        </div>
        <div>
          <dt>Best sale</dt>
          <dd>{fmt(stats.bestSale || 0)}</dd>
        </div>
        <div>
          <dt>Peak NW</dt>
          <dd>{fmt(stats.maxNetWorth || 0)}</dd>
        </div>
        <div>
          <dt>Smuggled</dt>
          <dd>{stats.contrabandSmuggled || 0}</dd>
        </div>
        <div>
          <dt>Claims</dt>
          <dd>{stats.insuranceClaims || 0}</dd>
        </div>
        <div>
          <dt>Bought / sold</dt>
          <dd>
            {stats.unitsBought || 0} / {stats.unitsSold || 0}
          </dd>
        </div>
      </dl>

      <ul className="achieve-list">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id);
          return (
            <li key={a.id} className={done ? 'done' : 'locked'}>
              <span className="ach-icon">{done ? '🏅' : '🔒'}</span>
              <div>
                <strong>{a.name}</strong>
                <span className="muted">{a.desc}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
