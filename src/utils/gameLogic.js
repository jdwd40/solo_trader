import {
  ACHIEVEMENTS,
  BASE_PRICES,
  BLACK_MARKET_PLANETS,
  COMMODITIES,
  CONTRABAND,
  CREW_ROLES,
  DAILY_SCORE_KEY,
  DIFFICULTIES,
  DEMAND_DURATION_MAX,
  DEMAND_DURATION_MIN,
  DEMAND_SPAWN_CHANCE,
  DEMAND_TEMPLATES,
  HIGH_SCORE_KEY,
  LEGAL_COMMODITIES,
  MAX_ACTIVE_DEMANDS,
  MAX_ACTIVE_QUESTS,
  MAX_HIGH_SCORES,
  MAX_REPUTATION,
  MIN_PRICE,
  MIN_REPUTATION,
  PLANETS,
  PRESTIGE_KEY,
  PRESTIGE_UPGRADES,
  PRICE_HISTORY_LEN,
  QUEST_SPAWN_CHANCE,
  RIVAL_NAMES,
  SAVE_KEY,
  SAVE_SLOTS_KEY,
  SAVE_SLOT_IDS,
  SAVE_VERSION,
  SEASON_CYCLE,
  SETTINGS_KEY,
  STOCK_INDICES,
  TRAVEL_FUEL_COST,
  TUTORIAL_MISSIONS,
  defaultSettings,
  emptyPrestige,
  getHull,
  getRating,
  getShipTitle,
  prestigePointsFromNetWorth,
} from '../data/gameData';
import { rng } from './rng';

/** Random float in [min, max) */
export function randRange(min, max) {
  return min + rng() * (max - min);
}

/** Random integer inclusive */
export function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

/** Pick a random item from an array */
export function pickRandom(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function clampRep(n) {
  return Math.max(MIN_REPUTATION, Math.min(MAX_REPUTATION, Math.round(n)));
}

export function isBlackMarketPlanet(planet) {
  return BLACK_MARKET_PLANETS.includes(planet);
}

/**
 * Build initial prices for all planets from base prices
 * with a mild random jitter so every game feels fresh.
 */
export function generateInitialPrices() {
  const prices = {};
  for (const planet of PLANETS) {
    prices[planet] = {};
    for (const commodity of COMMODITIES) {
      const base = BASE_PRICES[planet][commodity];
      const factor = randRange(0.9, 1.1);
      prices[planet][commodity] = Math.max(
        MIN_PRICE,
        Math.round(base * factor)
      );
    }
  }
  return prices;
}

export function seedPriceHistory(prices) {
  const history = {};
  for (const planet of PLANETS) {
    history[planet] = {};
    for (const commodity of COMMODITIES) {
      history[planet][commodity] = [prices[planet][commodity]];
    }
  }
  return history;
}

export function appendPriceHistory(history, prices) {
  const next = {};
  for (const planet of PLANETS) {
    next[planet] = {};
    for (const commodity of COMMODITIES) {
      const prev = history?.[planet]?.[commodity] || [];
      next[planet][commodity] = [...prev, prices[planet][commodity]].slice(
        -PRICE_HISTORY_LEN
      );
    }
  }
  return next;
}

/**
 * Refresh prices after travel: each commodity shifts by -20% to +25%.
 */
export function refreshPrices(currentPrices) {
  const next = {};
  for (const planet of PLANETS) {
    next[planet] = {};
    for (const commodity of COMMODITIES) {
      const old = currentPrices[planet][commodity];
      const factor = randRange(0.8, 1.25);
      next[planet][commodity] = Math.max(MIN_PRICE, Math.round(old * factor));
    }
  }
  return next;
}

/** Apply demand event multipliers on top of a price snapshot */
export function applyDemandEvents(prices, demandEvents) {
  if (!demandEvents?.length) return prices;
  const next = structuredClone(prices);
  for (const ev of demandEvents) {
    if (!next[ev.planet] || next[ev.planet][ev.commodity] == null) continue;
    next[ev.planet][ev.commodity] = Math.max(
      MIN_PRICE,
      Math.round(next[ev.planet][ev.commodity] * ev.factor)
    );
  }
  return next;
}

/** Seasonal commodity-class modifiers (all planets) */
export function getSeasonForTurn(turn) {
  const total = SEASON_CYCLE.reduce((s, x) => s + x.duration, 0);
  let t = ((Math.max(1, turn) - 1) % total + total) % total;
  for (const season of SEASON_CYCLE) {
    if (t < season.duration) {
      return {
        ...season,
        turnsIntoSeason: t + 1,
        turnsLeftInSeason: season.duration - t,
      };
    }
    t -= season.duration;
  }
  return { ...SEASON_CYCLE[0], turnsIntoSeason: 1, turnsLeftInSeason: SEASON_CYCLE[0].duration };
}

export function applySeasonalModifiers(prices, season) {
  if (!season?.mods) return prices;
  const next = structuredClone(prices);
  for (const planet of PLANETS) {
    for (const [commodity, factor] of Object.entries(season.mods)) {
      if (next[planet]?.[commodity] == null) continue;
      next[planet][commodity] = Math.max(
        MIN_PRICE,
        Math.round(next[planet][commodity] * factor)
      );
    }
  }
  return next;
}

/** Full display prices: base → season → demand */
export function buildDisplayPrices(basePrices, demandEvents, turn) {
  const season = getSeasonForTurn(turn);
  let prices = applySeasonalModifiers(basePrices, season);
  prices = applyDemandEvents(prices, demandEvents);
  return { prices, season };
}

export function applyRumourDiscount(prices, planet, commodity, factor = 0.7) {
  const next = structuredClone(prices);
  next[planet][commodity] = Math.max(
    MIN_PRICE,
    Math.round(next[planet][commodity] * factor)
  );
  return next;
}

/** Sum of cargo quantity (all types) */
export function cargoUsed(cargo) {
  return COMMODITIES.reduce((sum, c) => sum + (cargo[c] || 0), 0);
}

export function cargoValue(cargo, planetPrices) {
  return COMMODITIES.reduce(
    (sum, c) => sum + (cargo[c] || 0) * (planetPrices?.[c] || 0),
    0
  );
}

export function warehouseValue(warehouses, allPrices) {
  let sum = 0;
  for (const [planet, cargo] of Object.entries(warehouses || {})) {
    if (!cargo || !allPrices?.[planet]) continue;
    sum += cargoValue(cargo, allPrices[planet]);
  }
  return sum;
}

/**
 * Net worth = credits + ship cargo + warehouse stock + stocks − debt.
 */
export function calcNetWorth(
  credits,
  cargo,
  planetPrices,
  debt = 0,
  warehouses = null,
  allPrices = null,
  portfolio = null,
  stockPrices = null
) {
  let nw = credits + cargoValue(cargo, planetPrices) - (debt || 0);
  if (warehouses && allPrices) {
    nw += warehouseValue(warehouses, allPrices);
  }
  if (portfolio && stockPrices) {
    nw += portfolioValue(portfolio, stockPrices);
  }
  return nw;
}

export function portfolioValue(portfolio, stockPrices) {
  let sum = 0;
  for (const [id, shares] of Object.entries(portfolio || {})) {
    sum += (shares || 0) * (stockPrices?.[id] || 0);
  }
  return sum;
}

/** Convenience: full net worth from game state */
export function calcNetWorthFromState(state) {
  const planetPrices = state.prices?.[state.currentPlanet] || {};
  return calcNetWorth(
    state.credits,
    state.cargo,
    planetPrices,
    state.debt || 0,
    state.warehouses,
    state.prices,
    state.portfolio,
    state.stockPrices
  );
}

export function initStockPrices() {
  const prices = {};
  for (const [id, def] of Object.entries(STOCK_INDICES)) {
    prices[id] = def.base;
  }
  return prices;
}

/**
 * Move stock indices with season + mild noise each jump.
 */
export function tickStockPrices(stockPrices, season) {
  const next = { ...stockPrices };
  for (const [id, def] of Object.entries(STOCK_INDICES)) {
    let factor = randRange(0.94, 1.08);
    // Season commodities pull the linked index
    if (season?.mods) {
      let pull = 0;
      let n = 0;
      for (const c of def.commodities) {
        if (season.mods[c] != null) {
          pull += season.mods[c];
          n += 1;
        }
      }
      if (n > 0) {
        const avg = pull / n;
        // Map season factor toward stock: 0.78 → slightly down, 1.3 → up
        factor *= 0.85 + avg * 0.15;
      }
    }
    next[id] = Math.max(20, Math.round((next[id] || def.base) * factor));
  }
  return next;
}

export function crewWageTotal(crew) {
  let sum = 0;
  for (const [id, hired] of Object.entries(crew || {})) {
    if (hired && CREW_ROLES[id]) sum += CREW_ROLES[id].wage;
  }
  return sum;
}

export function hasCrew(crew, roleId) {
  return Boolean(crew?.[roleId]);
}

/** Active insurance coverage for an event type */
export function hasInsuranceCoverage(insurance, eventType) {
  return (insurance || []).some(
    (p) => p.turnsLeft > 0 && (p.covers || []).includes(eventType)
  );
}

/**
 * Estimate a multi-planet route from current position.
 * hops = destinations in order (not including current unless first equals current).
 */
export function estimateRoute(
  currentPlanet,
  hops,
  fuel,
  maxFuel,
  fuelPerJump = TRAVEL_FUEL_COST
) {
  const stops = (hops || []).filter(Boolean);
  let from = currentPlanet;
  let jumps = 0;
  let fuelNeeded = 0;
  const path = [];
  for (const dest of stops) {
    if (dest === from) continue;
    jumps += 1;
    fuelNeeded += fuelPerJump;
    path.push(dest);
    from = dest;
  }
  const turns = jumps;
  const fuelOk = fuel >= fuelNeeded;
  const refuelStops = fuelOk
    ? 0
    : Math.max(
        0,
        Math.ceil(
          (fuelNeeded - fuel) / Math.max(1, maxFuel - fuelPerJump)
        )
      );
  return {
    path,
    jumps,
    turns,
    fuelNeeded,
    fuelOk,
    refuelStops,
    summary: jumps
      ? `${jumps} jump${jumps === 1 ? '' : 's'} · ${fuelNeeded} fuel · ~${turns} turn${turns === 1 ? '' : 's'}`
      : 'Add destinations to plan a route',
  };
}

/** Evaluate achievements; returns newly unlocked ids + full unlocked list */
export function evaluateAchievements(state) {
  const unlocked = new Set(state.achievements || []);
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (unlocked.has(a.id)) continue;
    try {
      if (a.check(state)) {
        unlocked.add(a.id);
        newly.push(a);
      }
    } catch {
      /* ignore bad checks */
    }
  }
  return {
    achievements: [...unlocked],
    newly,
    title: getShipTitle([...unlocked]),
  };
}

export function maxBuyQty(credits, freeSpace, price) {
  if (price <= 0 || freeSpace <= 0 || credits < price) return 0;
  return Math.min(freeSpace, Math.floor(credits / price));
}

export function comparePlanetPrices(prices, currentPlanet, commodity) {
  const here = prices[currentPlanet][commodity];
  return PLANETS.filter((p) => p !== currentPlanet)
    .map((planet) => {
      const price = prices[planet][commodity];
      const delta = price - here;
      const pct = here > 0 ? delta / here : 0;
      let label = 'similar';
      if (pct <= -0.08) label = 'cheaper';
      else if (pct >= 0.08) label = 'dearer';
      return { planet, price, delta, pct, label };
    })
    .sort((a, b) => a.price - b.price);
}

/* ── Demand events ────────────────────────────────────────────── */

/**
 * Tick existing demand events and maybe spawn a new one.
 * Returns { demandEvents, messages }.
 */
export function tickDemandEvents(demandEvents, turn) {
  const messages = [];
  let next = (demandEvents || [])
    .map((ev) => ({ ...ev, turnsLeft: ev.turnsLeft - 1 }))
    .filter((ev) => {
      if (ev.turnsLeft <= 0) {
        messages.push(
          `📢 Demand event ended: ${ev.commodity} on ${ev.planet} returns to normal.`
        );
        return false;
      }
      return true;
    });

  if (next.length < MAX_ACTIVE_DEMANDS && rng() < DEMAND_SPAWN_CHANCE) {
    const type = rng() < 0.55 ? 'shortage' : 'surplus';
    const planet = pickRandom(PLANETS);
    const commodity = pickRandom(LEGAL_COMMODITIES);
    // Avoid duplicate planet+commodity
    if (!next.some((e) => e.planet === planet && e.commodity === commodity)) {
      const factor =
        type === 'shortage' ? randRange(1.45, 1.9) : randRange(0.5, 0.72);
      const turnsLeft = randInt(DEMAND_DURATION_MIN, DEMAND_DURATION_MAX);
      const template = pickRandom(DEMAND_TEMPLATES[type]);
      const message = template
        .replace('{planet}', planet)
        .replace('{commodity}', commodity);
      const event = {
        id: `d-${turn}-${Math.floor(rng() * 1e9).toString(36)}`,
        type,
        planet,
        commodity,
        factor: Math.round(factor * 100) / 100,
        turnsLeft,
      };
      next = [...next, event];
      messages.push(
        `${type === 'shortage' ? '📈' : '📉'} ${message} (${turnsLeft} turns)`
      );
    }
  }

  return { demandEvents: next, messages };
}

/* ── Pirate pressure map ──────────────────────────────────────── */

export function initLanePressure(pressureMult = 1) {
  const map = {};
  for (const p of PLANETS) {
    map[p] = Math.round(randInt(12, 38) * pressureMult);
  }
  // Rim is rougher by default
  map['Outer Rim Depot'] = Math.round(randInt(35, 55) * pressureMult);
  map['Vega Station'] = Math.round(randInt(25, 45) * pressureMult);
  for (const p of PLANETS) {
    map[p] = Math.max(5, Math.min(95, map[p]));
  }
  return map;
}

export function getDifficulty(id) {
  return DIFFICULTIES[id] || DIFFICULTIES.normal;
}

/** Random-walk pressure; destination gets a bump (heat follows trade). */
export function tickLanePressure(pressure, destination) {
  const next = { ...pressure };
  for (const p of PLANETS) {
    let v = (next[p] ?? 25) + randInt(-6, 6);
    if (p === destination) v += randInt(2, 8);
    next[p] = Math.max(5, Math.min(95, v));
  }
  return next;
}

export function avgLanePressure(pressure) {
  const vals = PLANETS.map((p) => pressure?.[p] ?? 25);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function pressureLabel(n) {
  if (n < 25) return 'Quiet';
  if (n < 45) return 'Watchful';
  if (n < 65) return 'Hot';
  if (n < 80) return 'Warzone';
  return 'Infested';
}

/** Insurance premium multiplier from sector heat */
export function insurancePremiumMultiplier(state) {
  const avg = avgLanePressure(state.lanePressure);
  return 1 + avg / 180; // ~1.0–1.5
}

export function scaledInsurancePremium(basePremium, state) {
  return Math.round(basePremium * insurancePremiumMultiplier(state));
}

/* ── Contraband inspection ────────────────────────────────────── */

/**
 * Chance of customs inspection when travelling with contraband.
 * Higher cargo + lower reputation + hull + pressure = riskier.
 */
export function contrabandInspectionChance(state) {
  const qty = state.cargo[CONTRABAND] || 0;
  if (qty <= 0) return 0;
  const rep = state.reputation ?? 55;
  const hull = getHull(state.hullId);
  const pressure = (state.lanePressure?.[state.currentPlanet] ?? 30) / 100;
  let base = 0.12 + qty * 0.012 + Math.max(0, 55 - rep) * 0.004;
  base *= hull.contrabandRiskMod ?? 1;
  base += pressure * 0.08;
  return Math.min(0.7, base);
}

/**
 * Roll customs check. Returns event or null.
 */
export function rollCustomsCheck(state) {
  const qty = state.cargo[CONTRABAND] || 0;
  if (qty <= 0) return null;
  const chance = contrabandInspectionChance(state);
  if (rng() >= chance) {
    return {
      type: 'smuggle_ok',
      message: `🕶️ Smuggled ${qty} Contraband past patrols. Reputation takes a small hit.`,
      effects: { reputationDelta: -1 },
    };
  }
  const fine = randInt(800, 2500) + qty * 40;
  return {
    type: 'customs',
    message: `🚨 Customs bust! Seized ${qty} Contraband and fined ${fine.toLocaleString()} credits.`,
    effects: {
      seizeContraband: true,
      creditDelta: -fine,
      reputationDelta: -12,
    },
  };
}

/* ── Travel random events ─────────────────────────────────────── */

export function rollTravelEvent(state) {
  const dest = state.currentPlanet;
  const pressure = (state.lanePressure?.[dest] ?? 30) / 100;
  const hull = getHull(state.hullId);
  // Base 25% event; hotter lanes more events
  const eventChance = Math.min(0.55, 0.22 + pressure * 0.25);
  if (rng() >= eventChance) return null;

  // Weight pirates higher when pressure is high
  const weights = {
    pirate: 1 + pressure * 3 * (hull.pirateRiskMod ?? 1),
    rumour: 1,
    spoilage: 1,
    fuelLeak: 1,
    bonus: 0.9,
  };
  const pool = [];
  for (const [k, w] of Object.entries(weights)) {
    const n = Math.max(1, Math.round(w * 10));
    for (let i = 0; i < n; i++) pool.push(k);
  }
  const type = pickRandom(pool);

  switch (type) {
    case 'pirate': {
      const diff = getDifficulty(state.difficulty);
      const pct =
        randRange(0.05, 0.12 + pressure * 0.08) * (diff.pirateMult || 1);
      let loss = Math.max(1, Math.round(state.credits * pct));
      if (hasCrew(state.crew, 'gunner')) {
        loss = Math.max(1, Math.round(loss * CREW_ROLES.gunner.pirateLossMod));
      }
      return {
        type: 'pirate',
        message: `🏴‍☠️ Pirate Toll near ${dest}! Raiders demand ${loss.toLocaleString()} credits (pressure ${Math.round(pressure * 100)})${hasCrew(state.crew, 'gunner') ? ' — gunner cut the loss' : ''}.`,
        effects: { creditDelta: -loss },
      };
    }
    case 'rumour': {
      const commodity = pickRandom(LEGAL_COMMODITIES);
      return {
        type: 'rumour',
        message: `📡 Lucky Trade Rumour! ${commodity} is cheaper at this port.`,
        effects: { rumour: { commodity, factor: 0.7 } },
      };
    }
    case 'spoilage': {
      const candidates = ['Food', 'Medicine'].filter(
        (c) => (state.cargo[c] || 0) > 0
      );
      if (candidates.length === 0) {
        return {
          type: 'spoilage',
          message:
            '🦠 Cargo Spoilage risked — but you carried no Food or Medicine. Lucky you.',
          effects: {},
        };
      }
      const commodity = pickRandom(candidates);
      const owned = state.cargo[commodity];
      const loss = Math.min(owned, randInt(1, 5));
      return {
        type: 'spoilage',
        message: `🦠 Cargo Spoilage! Lost ${loss} unit${loss === 1 ? '' : 's'} of ${commodity}.`,
        effects: { cargoLosses: { [commodity]: loss } },
      };
    }
    case 'fuelLeak': {
      const loss = randInt(5, 15);
      return {
        type: 'fuelLeak',
        message: `⛽ Fuel Leak! Lost ${loss} extra fuel units during transit.`,
        effects: { fuelDelta: -loss },
      };
    }
    case 'bonus': {
      const gain = randInt(500, 1500);
      return {
        type: 'bonus',
        message: `📜 Bonus Contract! A courier job pays ${gain.toLocaleString()} credits.`,
        effects: { creditDelta: gain, reputationDelta: 1 },
      };
    }
    default:
      return null;
  }
}

export function emptyCargo() {
  return Object.fromEntries(COMMODITIES.map((c) => [c, 0]));
}

export function fmt(n) {
  return Math.round(n).toLocaleString();
}

/* ── High scores ──────────────────────────────────────────────── */

export function loadHighScores() {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHighScore(entry) {
  const scores = loadHighScores();
  const next = [
    {
      companyName: entry.companyName || 'Unknown',
      netWorth: Math.round(entry.netWorth),
      rating: entry.rating || getRating(entry.netWorth),
      date: entry.date || new Date().toISOString(),
      turn: entry.turn ?? 100,
    },
    ...scores,
  ]
    .sort((a, b) => b.netWorth - a.netWorth)
    .slice(0, MAX_HIGH_SCORES);

  try {
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function sparklinePath(values, width = 48, height = 16) {
  if (!values || values.length === 0) {
    return { path: '', last: 0, first: 0, rising: false };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = n === 1 ? width / 2 : (i / (n - 1)) * width;
    const y = height - ((v - min) / span) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return {
    path: `M ${pts.join(' L ')}`,
    last: values[values.length - 1],
    first: values[0],
    rising: values[values.length - 1] >= values[0],
  };
}

/* ── Quests ───────────────────────────────────────────────────── */

let questSeq = 1;

export function generateQuest(state) {
  const commodity = pickRandom(LEGAL_COMMODITIES);
  const dest = pickRandom(
    PLANETS.filter((p) => p !== state.currentPlanet)
  );
  const qty = randInt(4, 12);
  const unit = state.prices?.[dest]?.[commodity] || 80;
  const reward = Math.round(qty * unit * randRange(0.35, 0.55) + randInt(200, 600));
  const repReward = randInt(2, 5);
  return {
    id: `q-${questSeq++}-${Date.now().toString(36)}`,
    type: 'deliver',
    title: `Deliver ${qty} ${commodity}`,
    commodity,
    qty,
    toPlanet: dest,
    reward,
    repReward,
    turnsLeft: randInt(6, 10),
    accepted: false,
  };
}

/**
 * Tick quest timers; optionally spawn a board offer.
 * Returns { quests, board, messages, news }
 */
export function tickQuests(state) {
  const messages = [];
  const news = [];
  let quests = (state.quests || [])
    .map((q) => ({ ...q, turnsLeft: q.turnsLeft - 1 }))
    .filter((q) => {
      if (q.turnsLeft <= 0) {
        messages.push(`📋 Contract expired: ${q.title} → ${q.toPlanet}.`);
        news.push(`Contract expired: ${q.title}`);
        return false;
      }
      return true;
    });

  let board = (state.questBoard || [])
    .map((q) => ({ ...q, turnsLeft: q.turnsLeft - 1 }))
    .filter((q) => q.turnsLeft > 0);

  const openSlots =
    MAX_ACTIVE_QUESTS - quests.length + Math.max(0, 3 - board.length);
  if (board.length < 3 && rng() < QUEST_SPAWN_CHANCE && openSlots > 0) {
    const q = generateQuest(state);
    board = [...board, q].slice(0, 3);
    news.push(`New contract: ${q.title} → ${q.toPlanet} (+${q.reward} cr)`);
  }

  return { quests, questBoard: board, messages, news };
}

/* ── Prestige meta ────────────────────────────────────────────── */

export function loadPrestige() {
  try {
    const raw = localStorage.getItem(PRESTIGE_KEY);
    if (!raw) return emptyPrestige();
    const parsed = JSON.parse(raw);
    const base = emptyPrestige();
    return {
      ...base,
      ...parsed,
      levels: { ...base.levels, ...(parsed.levels || {}) },
    };
  } catch {
    return emptyPrestige();
  }
}

export function savePrestige(meta) {
  try {
    localStorage.setItem(PRESTIGE_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
  return meta;
}

export function prestigeUpgradeCost(upgradeId, currentLevel) {
  const def = PRESTIGE_UPGRADES[upgradeId];
  if (!def || currentLevel >= def.maxLevel) return null;
  return def.costs[currentLevel] ?? null;
}

export function awardPrestigePoints(netWorth) {
  const meta = loadPrestige();
  const gained = prestigePointsFromNetWorth(netWorth);
  if (gained <= 0) return { meta, gained: 0 };
  const next = {
    ...meta,
    points: meta.points + gained,
    totalEarned: (meta.totalEarned || 0) + gained,
  };
  savePrestige(next);
  return { meta: next, gained };
}

export function buyPrestigeUpgrade(upgradeId) {
  const meta = loadPrestige();
  const def = PRESTIGE_UPGRADES[upgradeId];
  if (!def) return { ok: false, message: 'Unknown upgrade.', meta };
  const level = meta.levels[upgradeId] || 0;
  const cost = prestigeUpgradeCost(upgradeId, level);
  if (cost == null) return { ok: false, message: 'Max level.', meta };
  if (meta.points < cost) {
    return { ok: false, message: 'Not enough prestige points.', meta };
  }
  const next = {
    ...meta,
    points: meta.points - cost,
    levels: { ...meta.levels, [upgradeId]: level + 1 },
  };
  savePrestige(next);
  return { ok: true, message: `Unlocked ${def.name} Lv ${level + 1}.`, meta: next };
}

/* ── Save export / import ─────────────────────────────────────── */

export function exportSavePayload(state) {
  return {
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    game: state,
  };
}

export function parseImportSave(text) {
  const parsed = JSON.parse(text);
  const game = parsed.game || parsed;
  if (typeof game.credits !== 'number' || !game.prices || !game.cargo) {
    throw new Error('Invalid save shape');
  }
  return game;
}

export function downloadSaveFile(state) {
  const payload = exportSavePayload(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `star-trader-solo-turn-${state.turn || 0}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function pushNews(newsList, message, max = 8) {
  return [message, ...(newsList || [])].slice(0, max);
}

export function travelFuelForState(state) {
  let cost = getHull(state.hullId).travelFuelCost ?? TRAVEL_FUEL_COST;
  if (hasCrew(state.crew, 'navigator')) {
    cost = Math.max(6, cost - CREW_ROLES.navigator.fuelDiscount);
  }
  return cost;
}

/* ── Settings (accessibility) ─────────────────────────────────── */

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  return settings;
}

/* ── Daily high scores ────────────────────────────────────────── */

export function loadDailyScores(seedKey) {
  try {
    const raw = localStorage.getItem(DAILY_SCORE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    const list = all?.[seedKey];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveDailyScore(seedKey, entry) {
  try {
    const raw = localStorage.getItem(DAILY_SCORE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const list = Array.isArray(all[seedKey]) ? all[seedKey] : [];
    const next = [
      {
        companyName: entry.companyName || 'Unknown',
        netWorth: Math.round(entry.netWorth),
        rating: entry.rating || getRating(entry.netWorth),
        date: entry.date || new Date().toISOString(),
        epilogue: entry.epilogue || '',
      },
      ...list,
    ]
      .sort((a, b) => b.netWorth - a.netWorth)
      .slice(0, MAX_HIGH_SCORES);
    all[seedKey] = next;
    localStorage.setItem(DAILY_SCORE_KEY, JSON.stringify(all));
    return next;
  } catch {
    return [];
  }
}

export function legalSaleRevenue(state, commodity, qty, unitPrice) {
  let revenue = unitPrice * qty;
  if (hasCrew(state.crew, 'broker') && commodity !== CONTRABAND) {
    revenue = Math.round(revenue * (1 + CREW_ROLES.broker.saleBonus));
  }
  return revenue;
}

/* ── Multi-save slots ─────────────────────────────────────────── */

export function listSaveSlots() {
  try {
    const raw = localStorage.getItem(SAVE_SLOTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return SAVE_SLOT_IDS.map((id) => {
      const slot = all[id];
      if (!slot?.game) {
        return { id, empty: true, label: `Slot ${id}`, meta: null };
      }
      const g = slot.game;
      return {
        id,
        empty: false,
        label: slot.label || `Slot ${id}`,
        meta: {
          companyName: g.companyName,
          turn: g.turn,
          credits: g.credits,
          planet: g.currentPlanet,
          runMode: g.runMode,
          savedAt: slot.savedAt,
        },
        game: g,
      };
    });
  } catch {
    return SAVE_SLOT_IDS.map((id) => ({
      id,
      empty: true,
      label: `Slot ${id}`,
      meta: null,
    }));
  }
}

export function saveToSlot(slotId, state, label) {
  if (!SAVE_SLOT_IDS.includes(slotId)) {
    return { ok: false, message: 'Invalid slot.' };
  }
  try {
    const raw = localStorage.getItem(SAVE_SLOTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[slotId] = {
      label: label || `Slot ${slotId}`,
      savedAt: new Date().toISOString(),
      game: state,
    };
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(all));
    // Keep quick-save in sync with last write
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return { ok: true, message: `Saved to slot ${slotId}.` };
  } catch {
    return { ok: false, message: 'Slot save failed.' };
  }
}

export function loadFromSlot(slotId) {
  try {
    const slots = listSaveSlots();
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.empty || !slot.game) {
      return { ok: false, message: `Slot ${slotId} is empty.`, game: null };
    }
    return { ok: true, message: `Loaded slot ${slotId}.`, game: slot.game };
  } catch {
    return { ok: false, message: 'Slot load failed.', game: null };
  }
}

export function deleteSlot(slotId) {
  try {
    const raw = localStorage.getItem(SAVE_SLOTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    delete all[slotId];
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(all));
    return { ok: true, message: `Cleared slot ${slotId}.` };
  } catch {
    return { ok: false, message: 'Could not clear slot.' };
  }
}

/* ── Rival NPC ────────────────────────────────────────────────── */

export function createRival() {
  return {
    name: pickRandom(RIVAL_NAMES),
    planet: pickRandom(PLANETS),
    credits: randInt(8_000, 18_000),
    netWorthHint: randInt(12_000, 25_000),
  };
}

/**
 * Rival moves each jump; may "claim" a demand spike and gain wealth.
 * Returns { rival, messages, news, rivalWin }
 */
export function tickRival(state) {
  const rival = state.rival || createRival();
  const messages = [];
  const news = [];
  let rivalWin = 0;

  // Move toward a random planet (or demand planet)
  const demands = state.demandEvents || [];
  let dest;
  if (demands.length && rng() < 0.55) {
    dest = pickRandom(demands).planet;
  } else {
    dest = pickRandom(PLANETS.filter((p) => p !== rival.planet) || PLANETS);
  }
  const nextRival = {
    ...rival,
    planet: dest,
    credits: rival.credits + randInt(-400, 1200),
  };

  // Chance to scoop a shortage demand
  const shortage = demands.find(
    (d) => d.type === 'shortage' && d.planet === dest
  );
  const aggro =
    DIFFICULTIES[state.difficulty]?.rivalAggro ??
    DIFFICULTIES.normal.rivalAggro;
  if (shortage && rng() < aggro) {
    const profit = randInt(800, 3500);
    nextRival.credits += profit;
    nextRival.netWorthHint = (nextRival.netWorthHint || 0) + profit;
    rivalWin = 1;
    const msg = `🛰️ Rival ${nextRival.name} undercut the ${shortage.commodity} run at ${dest} (+${profit.toLocaleString()} cr).`;
    messages.push(msg);
    news.push(`Rival scoops ${shortage.commodity} at ${dest}`);
  } else if (rng() < 0.25) {
    news.push(`${nextRival.name} docked at ${dest}`);
  }

  nextRival.credits = Math.max(500, nextRival.credits);
  return { rival: nextRival, messages, news, rivalWin };
}

/* ── Post-run analytics ───────────────────────────────────────── */

export function buildRunAnalytics(state) {
  const stats = state.stats || {};
  const profitBy = stats.profitByCommodity || {};
  const spendBy = stats.spendByCommodity || {};
  const commodities = new Set([
    ...Object.keys(profitBy),
    ...Object.keys(spendBy),
  ]);

  const byCommodity = [...commodities]
    .map((c) => {
      const sold = profitBy[c] || 0;
      const spent = spendBy[c] || 0;
      return { commodity: c, sold, spent, net: sold - spent };
    })
    .sort((a, b) => b.net - a.net);

  const visits = stats.planetsVisited || {};
  const bestRoute = Object.entries(visits).sort((a, b) => b[1] - a[1])[0];

  const stockSpent = stats.stockSpent || 0;
  const stockEarned = stats.stockEarned || 0;
  const stockPnL = stockEarned - stockSpent + portfolioValue(state.portfolio, state.stockPrices);

  const wages = stats.crewWagePaid || 0;
  const crewRoles = Object.entries(state.crew || {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  // Rough ROI: broker sales bonus isn't tracked separately — show wages vs activity
  const crewRoi =
    wages <= 0
      ? 'No crew hired'
      : `Paid ${wages.toLocaleString()} cr in wages · ${crewRoles.length} specialist(s) · ${stats.jumps || 0} jumps`;

  const start = stats.startCredits || 10000;
  const end = calcNetWorthFromState(state);
  const totalGain = end - start;

  return {
    byCommodity,
    bestPlanet: bestRoute
      ? { planet: bestRoute[0], visits: bestRoute[1] }
      : null,
    stockPnL,
    stockSpent,
    stockEarned,
    crewRoi,
    crewWages: wages,
    totalGain,
    jumps: stats.jumps || 0,
    rivalWins: stats.rivalWins || 0,
    bestSale: stats.bestSale || 0,
  };
}

/* ── Auto-trade rules ─────────────────────────────────────────── */

/**
 * Evaluate enabled auto-trade rules at current planet.
 * Returns list of { type: 'BUY'|'SELL', commodity, qty } actions.
 */
export function evaluateAutoTradeRules(state) {
  const rules = (state.autoTradeRules || []).filter((r) => r.enabled);
  if (!rules.length || state.gameOver) return [];

  const planet = state.currentPlanet;
  const prices = state.prices[planet];
  let free = state.cargoCapacity - cargoUsed(state.cargo);
  let credits = state.credits;
  const cargo = { ...state.cargo };
  const actions = [];

  for (const rule of rules) {
    if (rule.planet && rule.planet !== planet) continue;
    if (!LEGAL_COMMODITIES.includes(rule.commodity) && rule.commodity !== CONTRABAND) {
      continue;
    }
    // Contraband only via black market path — skip in auto-trade
    if (rule.commodity === CONTRABAND) continue;

    const price = prices[rule.commodity];
    if (price == null) continue;

    if (rule.action === 'buy') {
      const maxP = Number(rule.maxPrice) || 0;
      if (maxP > 0 && price > maxP) continue;
      const qty = maxBuyQty(credits, free, price);
      if (qty <= 0) continue;
      actions.push({ type: 'BUY', commodity: rule.commodity, qty });
      free -= qty;
      credits -= qty * price;
      cargo[rule.commodity] = (cargo[rule.commodity] || 0) + qty;
    } else if (rule.action === 'sell') {
      const minP = Number(rule.minPrice) || 0;
      if (minP > 0 && price < minP) continue;
      const owned = cargo[rule.commodity] || 0;
      if (owned <= 0) continue;
      actions.push({ type: 'SELL', commodity: rule.commodity, qty: owned });
      cargo[rule.commodity] = 0;
      free += owned;
      credits += owned * price;
    }
  }
  return actions;
}

/** Mission progress helper */
export function getMissionProgress(state) {
  const claimed = new Set(state.missionsClaimed || []);
  return TUTORIAL_MISSIONS.map((m) => {
    const done = m.check(state);
    const claimedAlready = claimed.has(m.id);
    return {
      ...m,
      done,
      claimed: claimedAlready,
      claimable: done && !claimedAlready,
    };
  });
}

export { TUTORIAL_MISSIONS };
