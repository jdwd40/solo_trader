import {
  CREW_ROLES,
  PLANET_ICONS,
  getHull,
} from '../data/gameData';
import {
  cargoUsed,
  crewWageTotal,
  fmt,
  travelFuelForState,
} from '../utils/gameLogic';

function StatBar({ label, value, max, colorClass, detail }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const warn = pct <= 20;
  return (
    <div className={`ship-stat-bar ${warn ? 'is-low' : ''}`}>
      <div className="ship-stat-top">
        <span>{label}</span>
        <strong>
          {detail ?? `${fmt(value)} / ${fmt(max)}`}
        </strong>
      </div>
      <div className="ship-stat-track" aria-hidden="true">
        <div
          className={`ship-stat-fill ${colorClass || ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * At-a-glance bridge panel: hull render, fuel/cargo bars, crew avatars, key stats.
 */
export default function ShipStatus({ state }) {
  const hull = getHull(state.hullId);
  const used = cargoUsed(state.cargo);
  const free = Math.max(0, state.cargoCapacity - used);
  const fuelPct = state.maxFuel
    ? Math.round((state.fuel / state.maxFuel) * 100)
    : 0;
  const cargoPct = state.cargoCapacity
    ? Math.round((used / state.cargoCapacity) * 100)
    : 0;
  const jumpCost = travelFuelForState(state);
  const jumpsLeft = jumpCost > 0 ? Math.floor(state.fuel / jumpCost) : 0;
  const wages = crewWageTotal(state.crew);
  const planetIcon = PLANET_ICONS[state.currentPlanet] || '🪐';
  const upgrades = state.upgrades || {};
  const hired = Object.values(CREW_ROLES).filter((r) => state.crew?.[r.id]);

  const noHull = !state.hullId || state.needsHullSelect;

  return (
    <section className="panel ship-status" aria-label="Ship status">
      <div className="panel-header">
        <h2>Ship status</h2>
        <span className="badge">{noHull ? 'No hull' : hull.name}</span>
      </div>

      <div className="ship-status-layout">
        <div className="ship-status-visual">
          <div className="ship-frame">
            {noHull ? (
              <div className="ship-placeholder muted">
                Select a hull in the launch bay to register your vessel.
              </div>
            ) : (
              <img
                key={hull.id}
                className="ship-img"
                src={hull.image || '/ships/freighter.jpg'}
                alt={hull.name}
                loading="lazy"
              />
            )}
            {!noHull ? (
              <div className="ship-frame-label">
                <strong>{hull.name}</strong>
                <span>{hull.blurb}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="ship-status-stats">
          <StatBar
            label="Fuel"
            value={state.fuel}
            max={state.maxFuel}
            colorClass="fill-fuel"
            detail={`${state.fuel} / ${state.maxFuel} · ${fuelPct}%`}
          />
          <StatBar
            label="Cargo hold"
            value={used}
            max={state.cargoCapacity}
            colorClass="fill-cargo"
            detail={`${used} used · ${free} free · ${cargoPct}%`}
          />

          <dl className="ship-kv">
            <div>
              <dt>Docked</dt>
              <dd>
                <span aria-hidden="true">{planetIcon}</span> {state.currentPlanet}
              </dd>
            </div>
            <div>
              <dt>Jump cost</dt>
              <dd>
                {jumpCost} fuel · ~{jumpsLeft} jump
                {jumpsLeft === 1 ? '' : 's'} left
              </dd>
            </div>
            <div>
              <dt>Credits / debt</dt>
              <dd>
                <span className="credits">{fmt(state.credits)}</span>
                {state.debt > 0 ? (
                  <span className="debt"> · −{fmt(state.debt)}</span>
                ) : (
                  ' · clear'
                )}
              </dd>
            </div>
            <div>
              <dt>Upgrades</dt>
              <dd>
                Hold Lv {upgrades.cargo || 0} · Tanks Lv {upgrades.fuel || 0}
              </dd>
            </div>
            <div>
              <dt>Crew wages</dt>
              <dd>{wages > 0 ? `${fmt(wages)} cr / jump` : 'None aboard'}</dd>
            </div>
            <div>
              <dt>Risk profile</dt>
              <dd>
                Pirates ×{hull.pirateRiskMod} · Customs ×{hull.contrabandRiskMod}
              </dd>
            </div>
          </dl>

          <div className="ship-crew-row">
            <span className="ship-crew-label">Crew roster</span>
            <ul className="ship-crew-avatars">
              {Object.values(CREW_ROLES).map((role) => {
                const onBoard = Boolean(state.crew?.[role.id]);
                return (
                  <li
                    key={role.id}
                    className={onBoard ? 'aboard' : 'empty'}
                    title={
                      onBoard
                        ? `${role.name} — ${role.blurb}`
                        : `${role.name} vacant`
                    }
                  >
                    <img src={role.avatar} alt="" />
                    <span>{onBoard ? role.name : '—'}</span>
                  </li>
                );
              })}
            </ul>
            {hired.length === 0 ? (
              <p className="muted ship-crew-hint">No specialists hired yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
