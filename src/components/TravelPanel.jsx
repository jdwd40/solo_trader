import { PLANET_ICONS, PLANETS } from '../data/gameData';
import { fmt, pressureLabel, travelFuelForState } from '../utils/gameLogic';

export default function TravelPanel({ state, onTravel, onBuyFuel }) {
  const fuelPrice = state.prices[state.currentPlanet]['Fuel Cells'];
  const fuelCost = travelFuelForState(state);
  const canTravel = !state.gameOver && !state.needsHullSelect && state.fuel >= fuelCost;
  const fuelRoom = state.maxFuel - state.fuel;
  const canRefuel =
    !state.gameOver &&
    !state.needsHullSelect &&
    fuelRoom > 0 &&
    state.credits >= fuelPrice;

  return (
    <section className="panel travel-panel" data-tutorial="travel">
      <div className="panel-header">
        <h2>Travel</h2>
        <span className="badge muted-badge">
          Cost: {fuelCost} fuel · 1 turn
        </span>
      </div>

      <div className="planet-grid">
        {PLANETS.map((planet) => {
          const isHere = planet === state.currentPlanet;
          const disabled = isHere || !canTravel;
          const hasDemand = (state.demandEvents || []).some(
            (e) => e.planet === planet
          );
          const press = Math.round(state.lanePressure?.[planet] ?? 0);
          return (
            <button
              key={planet}
              type="button"
              className={`btn planet-btn ${isHere ? 'is-here' : ''} ${hasDemand ? 'has-demand' : ''} ${press >= 65 ? 'is-hot' : ''}`}
              disabled={disabled}
              title={
                isHere
                  ? 'You are here'
                  : !canTravel
                    ? `Need ${fuelCost} fuel to travel`
                    : `Travel to ${planet} · pressure ${press} (${pressureLabel(press)})`
              }
              onClick={() => onTravel(planet)}
            >
              <span className="icon-label" aria-hidden="true">
                {PLANET_ICONS[planet] || '🪐'}
              </span>{' '}
              {planet}
              {isHere ? ' · Here' : ''}
              {hasDemand && !isHere ? ' · !' : ''}
              {!isHere && press >= 65 ? ' · ☠' : ''}
            </button>
          );
        })}
      </div>

      <div className="refuel-row">
        <div className="refuel-info">
          <span>Fuel Cells price: {fmt(fuelPrice)} cr/unit</span>
          <span>
            Tank: {state.fuel}/{state.maxFuel}
          </span>
        </div>
        <div className="refuel-actions">
          <button
            type="button"
            className="btn btn-fuel"
            disabled={!canRefuel}
            onClick={() => onBuyFuel(10)}
          >
            +10 Fuel
          </button>
          <button
            type="button"
            className="btn btn-fuel"
            disabled={!canRefuel}
            onClick={() => onBuyFuel(fuelRoom)}
          >
            Fill Tank
          </button>
        </div>
      </div>
    </section>
  );
}
