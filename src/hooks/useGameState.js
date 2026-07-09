import { useCallback, useReducer } from 'react';
import {
  CARGO_CAPACITY,
  CONTRABAND,
  CREW_ROLES,
  DEFAULT_COMPANY_NAME,
  DIFFICULTIES,
  FUTURES_DURATION,
  FUTURES_FEE_RATE,
  FUTURES_PENALTY_RATE,
  HULL_SWITCH_COST,
  INSURANCE_PLANS,
  INTEL_COST,
  LEGAL_COMMODITIES,
  LOAN_OPTIONS,
  MAX_ACTIVE_QUESTS,
  MAX_DEBT,
  MAX_FUEL,
  MAX_FUTURES,
  MAX_TURNS,
  PLANETS,
  PRESTIGE_UPGRADES,
  SAVE_KEY,
  STARTING_CREDITS,
  STARTING_REPUTATION,
  STOCK_INDICES,
  TUTORIAL_MISSIONS,
  UPGRADES,
  WAREHOUSE_CAPACITY,
  WAREHOUSE_UNLOCK_COST,
  WAREHOUSE_UPKEEP,
  emptyCrew,
  emptyPortfolio,
  emptyStats,
  emptyStockQuotes,
  getHull,
  upgradeCost,
} from '../data/gameData';
import {
  appendPriceHistory,
  applyRumourDiscount,
  applyTradeImpact,
  buildDisplayPrices,
  calcNetWorthFromState,
  cargoUsed,
  clampRep,
  crewWageTotal,
  emptyCargo,
  evaluateAchievements,
  generateInitialPrices,
  hasInsuranceCoverage,
  initLanePressure,
  initStockPrices,
  isBlackMarketPlanet,
  legalSaleRevenue,
  loadPrestige,
  marketBook,
  pushNews,
  refreshPrices,
  rollCustomsCheck,
  rollTravelEvent,
  scaledInsurancePremium,
  seedPriceHistory,
  settleStockQuotes,
  tickDemandEvents,
  createRival,
  evaluateAutoTradeRules,
  getDifficulty,
  loadFromSlot,
  saveToSlot,
  tickLanePressure,
  tickQuests,
  tickRival,
  tickStockPrices,
  travelFuelForState,
} from '../utils/gameLogic';
import { dailySeedKey, setRngSeed } from '../utils/rng';

let futuresIdSeq = 1;

function withMarket(state, basePrices, demandEvents, turn = state.turn) {
  const { prices, season } = buildDisplayPrices(
    basePrices,
    demandEvents,
    turn
  );
  return {
    ...state,
    basePrices,
    demandEvents,
    prices,
    season,
  };
}

function effectiveInterestRate(state) {
  const hull = getHull(state.hullId);
  const p = loadPrestige();
  const cut = (p.levels?.interestCut || 0) * (PRESTIGE_UPGRADES.interestCut.perLevel || 0.01);
  const diff = getDifficulty(state.difficulty);
  const base = 0.05 * (hull.interestMod ?? 1) * (diff.interestMult || 1);
  return Math.max(0.01, base - cut);
}

function applyHullAndPrestigeBonuses(state, hullId) {
  const hull = getHull(hullId);
  const p = loadPrestige();
  const diff = getDifficulty(state.difficulty);
  const cargoCap =
    CARGO_CAPACITY +
    hull.cargoBonus +
    (p.levels?.startCargo || 0) * PRESTIGE_UPGRADES.startCargo.perLevel;
  const maxFuel =
    MAX_FUEL +
    hull.fuelBonus +
    (p.levels?.startFuel || 0) * PRESTIGE_UPGRADES.startFuel.perLevel;
  const credits = Math.round(
    (STARTING_CREDITS +
      (p.levels?.startCredits || 0) * PRESTIGE_UPGRADES.startCredits.perLevel) *
      (diff.creditMult || 1)
  );
  const intelActive = (p.levels?.startIntel || 0) > 0;

  return {
    ...state,
    hullId: hull.id,
    needsHullSelect: false,
    cargoCapacity: Math.max(20, cargoCap),
    maxFuel: Math.max(40, maxFuel),
    fuel: Math.max(40, maxFuel),
    credits,
    intelActive: intelActive || state.intelActive,
    stats: {
      ...state.stats,
      startCredits: credits,
      maxNetWorth: Math.max(state.stats?.maxNetWorth || 0, credits),
    },
  };
}

/**
 * @param {string} companyName
 * @param {{ mode?: 'classic'|'daily', seed?: string|null, difficulty?: string }} opts
 */
function createInitialState(companyName = DEFAULT_COMPANY_NAME, opts = {}) {
  const mode = opts.mode === 'daily' ? 'daily' : 'classic';
  const seed =
    mode === 'daily' ? opts.seed || dailySeedKey() : opts.seed || null;
  const difficulty = DIFFICULTIES[opts.difficulty] ? opts.difficulty : 'normal';
  const diff = getDifficulty(difficulty);
  setRngSeed(seed);

  const basePrices = generateInitialPrices();
  const demandEvents = [];
  const { prices, season } = buildDisplayPrices(basePrices, demandEvents, 1);
  const p = loadPrestige();
  const stockPrices = initStockPrices();
  const modeLabel =
    mode === 'daily' ? `Daily run (${seed})` : 'Classic run';

  return {
    companyName,
    credits: STARTING_CREDITS,
    cargoCapacity: CARGO_CAPACITY,
    fuel: MAX_FUEL,
    maxFuel: MAX_FUEL,
    currentPlanet: PLANETS[0],
    turn: 1,
    maxTurns: MAX_TURNS,
    cargo: emptyCargo(),
    basePrices,
    prices,
    season,
    priceHistory: seedPriceHistory(prices),
    eventLog: [
      {
        id: 1,
        turn: 1,
        message: `Welcome to Star Trader Solo! ${modeLabel} · ${diff.name}. Season: ${season.name}. Choose a hull to begin.`,
      },
    ],
    lastEventId: 1,
    gameOver: false,
    pendingRumour: null,
    upgrades: { cargo: 0, fuel: 0 },
    intelActive: false,
    scoreRecorded: false,
    debt: 0,
    reputation: STARTING_REPUTATION,
    futures: [],
    demandEvents,
    tutorialStep: 0,
    insurance: [],
    warehouses: {},
    route: [],
    routeCursor: 0,
    stats: emptyStats(),
    achievements: [],
    shipTitle: 'Rookie Hauler',
    hullId: null,
    needsHullSelect: true,
    lanePressure: initLanePressure(diff.pressureMult || 1),
    quests: [],
    questBoard: [],
    news: [
      `Season: ${season.name}`,
      mode === 'daily' ? `Daily seed ${seed}` : 'Classic unseeded run',
      `Difficulty: ${diff.name}`,
      p.totalEarned
        ? `Prestige ready: ${p.points} pts (lifetime ${p.totalEarned})`
        : 'New captain — earn prestige by finishing strong runs',
    ],
    prestigeAwarded: false,
    runMode: mode,
    rngSeed: seed,
    crew: emptyCrew(),
    portfolio: emptyPortfolio(),
    stockPrices,
    stockQuotes: emptyStockQuotes(),
    rival: createRival(),
    // v1.7
    difficulty,
    missionsClaimed: [],
    missionsEnabled: true,
    autoTradeRules: [],
    autoTradeOnArrive: true,
  };
}

function normalizeState(raw) {
  const base = createInitialState(raw.companyName);
  let basePrices = raw.basePrices || raw.prices || base.basePrices;
  for (const planet of PLANETS) {
    if (basePrices[planet] && basePrices[planet][CONTRABAND] == null) {
      basePrices[planet][CONTRABAND] = base.basePrices[planet][CONTRABAND];
    }
  }
  const demandEvents = Array.isArray(raw.demandEvents) ? raw.demandEvents : [];
  const turn = raw.turn || 1;
  const { prices, season } = buildDisplayPrices(basePrices, demandEvents, turn);
  let priceHistory = raw.priceHistory;
  if (!priceHistory) priceHistory = seedPriceHistory(prices);

  const warehouses = {};
  for (const [planet, cargo] of Object.entries(raw.warehouses || {})) {
    warehouses[planet] = { ...emptyCargo(), ...cargo };
  }

  return {
    ...base,
    ...raw,
    basePrices,
    prices,
    season,
    priceHistory,
    demandEvents,
    upgrades: {
      cargo: raw.upgrades?.cargo ?? 0,
      fuel: raw.upgrades?.fuel ?? 0,
    },
    intelActive: Boolean(raw.intelActive),
    scoreRecorded: Boolean(raw.scoreRecorded),
    cargo: { ...emptyCargo(), ...(raw.cargo || {}) },
    debt: Math.max(0, raw.debt || 0),
    reputation: clampRep(raw.reputation ?? STARTING_REPUTATION),
    futures: Array.isArray(raw.futures) ? raw.futures : [],
    tutorialStep: raw.tutorialStep ?? 0,
    insurance: Array.isArray(raw.insurance) ? raw.insurance : [],
    warehouses,
    route: Array.isArray(raw.route) ? raw.route : [],
    routeCursor: raw.routeCursor || 0,
    stats: { ...emptyStats(), ...(raw.stats || {}) },
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    shipTitle: raw.shipTitle || base.shipTitle,
    hullId: raw.hullId || null,
    needsHullSelect: raw.hullId ? false : Boolean(raw.needsHullSelect ?? !raw.hullId),
    lanePressure: raw.lanePressure || initLanePressure(),
    quests: Array.isArray(raw.quests) ? raw.quests : [],
    questBoard: Array.isArray(raw.questBoard) ? raw.questBoard : [],
    news: Array.isArray(raw.news) ? raw.news : [],
    prestigeAwarded: Boolean(raw.prestigeAwarded),
    runMode: raw.runMode === 'daily' ? 'daily' : 'classic',
    rngSeed: raw.rngSeed ?? null,
    crew: { ...emptyCrew(), ...(raw.crew || {}) },
    portfolio: { ...emptyPortfolio(), ...(raw.portfolio || {}) },
    stockPrices: raw.stockPrices || initStockPrices(),
    stockQuotes: { ...emptyStockQuotes(), ...(raw.stockQuotes || {}) },
    rival: raw.rival || createRival(),
    difficulty: DIFFICULTIES[raw.difficulty] ? raw.difficulty : 'normal',
    missionsClaimed: Array.isArray(raw.missionsClaimed)
      ? raw.missionsClaimed
      : [],
    missionsEnabled: raw.missionsEnabled !== false,
    autoTradeRules: Array.isArray(raw.autoTradeRules)
      ? raw.autoTradeRules
      : [],
    autoTradeOnArrive: raw.autoTradeOnArrive !== false,
  };
}

function tickCrewWages(state) {
  const wageMult = getDifficulty(state.difficulty).wageMult || 1;
  const wages = Math.round(crewWageTotal(state.crew) * wageMult);
  if (wages <= 0) return state;
  let credits = state.credits;
  let debt = state.debt;
  if (credits >= wages) {
    credits -= wages;
  } else {
    debt += wages - credits;
    credits = 0;
  }
  return pushLog(
    {
      ...state,
      credits,
      debt,
      stats: {
        ...state.stats,
        crewWagePaid: (state.stats?.crewWagePaid || 0) + wages,
      },
    },
    `👥 Crew wages −${wages.toLocaleString()} cr.`
  );
}

/** Apply a list of buy/sell actions (auto-trade) */
function applyTradeActions(state, actions) {
  let next = state;
  for (const a of actions) {
    next = reducer(next, {
      type: a.type,
      commodity: a.commodity,
      qty: a.qty,
    });
  }
  return next;
}

function bumpStatMap(map, key, amount) {
  return { ...(map || {}), [key]: ((map || {})[key] || 0) + amount };
}

function pushLog(state, message) {
  const id = state.lastEventId + 1;
  const entry = { id, turn: state.turn, message };
  const eventLog = [entry, ...state.eventLog].slice(0, 14);
  return { ...state, eventLog, lastEventId: id };
}

function addNews(state, message) {
  return { ...state, news: pushNews(state.news, message) };
}

function syncAchievements(state) {
  const result = evaluateAchievements(state);
  let next = {
    ...state,
    achievements: result.achievements,
    shipTitle: result.title.name,
  };
  for (const a of result.newly) {
    next = pushLog(next, `🏅 Achievement: ${a.name} — ${a.desc}`);
    next = addNews(next, `Achievement: ${a.name}`);
  }
  return next;
}

function trackNetWorth(state) {
  const nw = calcNetWorthFromState(state);
  const stats = {
    ...state.stats,
    maxNetWorth: Math.max(state.stats?.maxNetWorth || 0, nw),
  };
  return syncAchievements({ ...state, stats });
}

function applyEffects(state, effects = {}, eventType = null) {
  let next = { ...state };
  const covered =
    eventType && hasInsuranceCoverage(next.insurance, eventType);
  let claim = false;

  if (effects.creditDelta) {
    if (covered && eventType === 'customs' && effects.creditDelta < 0) {
      claim = true;
    } else {
      next.credits = Math.max(0, next.credits + effects.creditDelta);
    }
  }
  if (effects.fuelDelta) {
    if (covered && eventType === 'fuelLeak' && effects.fuelDelta < 0) {
      claim = true;
    } else {
      next.fuel = Math.max(
        0,
        Math.min(next.maxFuel, next.fuel + effects.fuelDelta)
      );
    }
  }
  if (effects.cargoLosses) {
    if (covered && eventType === 'spoilage') {
      claim = true;
    } else {
      const cargo = { ...next.cargo };
      for (const [c, amount] of Object.entries(effects.cargoLosses)) {
        cargo[c] = Math.max(0, (cargo[c] || 0) - amount);
      }
      next.cargo = cargo;
    }
  }
  if (effects.seizeContraband) {
    if (covered && eventType === 'customs') {
      claim = true;
    } else {
      next.cargo = { ...next.cargo, [CONTRABAND]: 0 };
    }
  }
  if (effects.reputationDelta) {
    const repDelta =
      covered && eventType === 'customs'
        ? Math.ceil(effects.reputationDelta / 2)
        : effects.reputationDelta;
    next.reputation = clampRep(
      (next.reputation ?? STARTING_REPUTATION) + repDelta
    );
  }
  if (effects.rumour) {
    const { commodity, factor } = effects.rumour;
    const basePrices = applyRumourDiscount(
      next.basePrices || next.prices,
      next.currentPlanet,
      commodity,
      factor
    );
    next = withMarket(next, basePrices, next.demandEvents || [], next.turn);
    const hist = structuredClone(next.priceHistory);
    const series = hist[next.currentPlanet][commodity] || [];
    if (series.length > 0) {
      series[series.length - 1] = next.prices[next.currentPlanet][commodity];
    } else {
      series.push(next.prices[next.currentPlanet][commodity]);
    }
    hist[next.currentPlanet][commodity] = series;
    next.priceHistory = hist;
  }

  if (claim) {
    next.stats = {
      ...next.stats,
      insuranceClaims: (next.stats?.insuranceClaims || 0) + 1,
    };
    next = pushLog(
      next,
      `🛡️ Insurance claim paid out — covered ${eventType} losses.`
    );
  }

  return next;
}

function accrueInterest(state) {
  if (state.debt <= 0) return state;
  const rate = effectiveInterestRate(state);
  const interest = Math.max(1, Math.ceil(state.debt * rate));
  const debt = state.debt + interest;
  return pushLog(
    { ...state, debt },
    `💳 Loan interest +${interest.toLocaleString()} cr @ ${(rate * 100).toFixed(1)}% (debt ${debt.toLocaleString()}).`
  );
}

function tickFutures(state) {
  if (!state.futures?.length) return state;
  const messages = [];
  let credits = state.credits;
  let debt = state.debt;
  const remaining = [];

  for (const f of state.futures) {
    const turnsLeft = f.turnsLeft - 1;
    if (turnsLeft <= 0) {
      const unsettled = f.qty;
      if (unsettled > 0) {
        const penalty = Math.max(
          1,
          Math.round(unsettled * f.lockedPrice * FUTURES_PENALTY_RATE)
        );
        if (credits >= penalty) credits -= penalty;
        else {
          debt += penalty - credits;
          credits = 0;
        }
        messages.push(
          `📉 Futures expired: ${unsettled} ${f.commodity} @ ${f.lockedPrice}. Penalty ${penalty.toLocaleString()} cr.`
        );
      }
    } else {
      remaining.push({ ...f, turnsLeft });
    }
  }

  let next = { ...state, futures: remaining, credits, debt };
  for (const m of messages) next = pushLog(next, m);
  return next;
}

function tickInsurance(state) {
  if (!state.insurance?.length) return state;
  const expired = [];
  const insurance = state.insurance
    .map((p) => ({ ...p, turnsLeft: p.turnsLeft - 1 }))
    .filter((p) => {
      if (p.turnsLeft <= 0) {
        expired.push(p.name);
        return false;
      }
      return true;
    });
  let next = { ...state, insurance };
  for (const name of expired) {
    next = pushLog(next, `🛡️ Policy expired: ${name}.`);
  }
  return next;
}

function tickWarehouseUpkeep(state) {
  let cost = 0;
  for (const cargo of Object.values(state.warehouses || {})) {
    if (cargoUsed(cargo) > 0) cost += WAREHOUSE_UPKEEP;
  }
  if (cost <= 0) return state;
  let credits = state.credits;
  let debt = state.debt;
  if (credits >= cost) credits -= cost;
  else {
    debt += cost - credits;
    credits = 0;
  }
  return pushLog(
    { ...state, credits, debt },
    `🏭 Warehouse upkeep −${cost.toLocaleString()} cr.`
  );
}

function COMMODITY_OK(c) {
  return LEGAL_COMMODITIES.includes(c) || c === CONTRABAND;
}

function blockedWithoutHull(state) {
  return state.needsHullSelect || !state.hullId;
}

function reducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialState(action.companyName ?? state.companyName, {
        mode: action.mode || 'classic',
        seed: action.seed,
        difficulty: action.difficulty || state.difficulty || 'normal',
      });

    case 'SET_DIFFICULTY': {
      if (!state.needsHullSelect) {
        return pushLog(
          state,
          'Difficulty is locked after launch. Start a new game to change it.'
        );
      }
      if (!DIFFICULTIES[action.difficulty]) return state;
      const diff = getDifficulty(action.difficulty);
      let next = {
        ...state,
        difficulty: action.difficulty,
        lanePressure: initLanePressure(diff.pressureMult || 1),
      };
      return pushLog(next, `Difficulty set to ${diff.name}.`);
    }

    case 'SELECT_HULL': {
      if (state.gameOver) return state;
      const hull = getHull(action.hullId);
      if (!hull || !action.hullId) return state;
      let next = applyHullAndPrestigeBonuses(state, action.hullId);
      next = pushLog(
        next,
        `🚀 Hull registered: ${hull.name}. Cargo ${next.cargoCapacity}, tanks ${next.maxFuel}, jump cost ${hull.travelFuelCost} fuel.`
      );
      next = addNews(next, `Flying ${hull.name}`);
      return next;
    }

    case 'SWITCH_HULL': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const hull = getHull(action.hullId);
      if (!hull || action.hullId === state.hullId) return state;
      if (state.credits < HULL_SWITCH_COST) {
        return pushLog(
          state,
          `Need ${HULL_SWITCH_COST.toLocaleString()} cr to re-register a hull.`
        );
      }
      // Keep cargo capacity upgrades: base hull cargo + upgrade levels + prestige
      const cargoUp = (state.upgrades?.cargo || 0) * UPGRADES.cargo.perLevel;
      const fuelUp = (state.upgrades?.fuel || 0) * UPGRADES.fuel.perLevel;
      const p = loadPrestige();
      const cargoCap =
        CARGO_CAPACITY +
        hull.cargoBonus +
        cargoUp +
        (p.levels?.startCargo || 0) * PRESTIGE_UPGRADES.startCargo.perLevel;
      const maxFuel =
        MAX_FUEL +
        hull.fuelBonus +
        fuelUp +
        (p.levels?.startFuel || 0) * PRESTIGE_UPGRADES.startFuel.perLevel;

      if (cargoUsed(state.cargo) > cargoCap) {
        return pushLog(
          state,
          `Cannot switch: cargo ${cargoUsed(state.cargo)} exceeds new hold ${cargoCap}.`
        );
      }

      let next = {
        ...state,
        credits: state.credits - HULL_SWITCH_COST,
        hullId: hull.id,
        cargoCapacity: Math.max(20, cargoCap),
        maxFuel: Math.max(40, maxFuel),
        fuel: Math.min(state.fuel, Math.max(40, maxFuel)),
      };
      next = pushLog(
        next,
        `🔄 Switched hull to ${hull.name} (−${HULL_SWITCH_COST.toLocaleString()} cr).`
      );
      return next;
    }

    case 'SET_COMPANY_NAME':
      return { ...state, companyName: action.name.slice(0, 40) };

    case 'SET_TUTORIAL_STEP':
      return { ...state, tutorialStep: action.step };

    case 'BUY': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const { commodity, qty } = action;
      if (!Number.isInteger(qty) || qty <= 0) return state;
      if (commodity === CONTRABAND) {
        return pushLog(state, 'Use the Black Market panel to trade Contraband.');
      }

      const price = state.prices[state.currentPlanet][commodity];
      const cost = price * qty;
      const free = state.cargoCapacity - cargoUsed(state.cargo);

      if (qty > free) {
        return pushLog(
          state,
          `Cannot buy ${qty} ${commodity}: only ${free} cargo space free.`
        );
      }
      if (cost > state.credits) {
        return pushLog(
          state,
          `Cannot buy ${qty} ${commodity}: need ${cost.toLocaleString()} credits.`
        );
      }

      const cargo = {
        ...state.cargo,
        [commodity]: (state.cargo[commodity] || 0) + qty,
      };
      let next = {
        ...state,
        credits: state.credits - cost,
        cargo,
        stats: {
          ...state.stats,
          unitsBought: (state.stats?.unitsBought || 0) + qty,
          spendByCommodity: bumpStatMap(
            state.stats?.spendByCommodity,
            commodity,
            cost
          ),
        },
      };
      if (qty >= 10) {
        next.reputation = clampRep((next.reputation || STARTING_REPUTATION) + 1);
      }
      next = pushLog(
        next,
        `Bought ${qty} ${commodity} for ${cost.toLocaleString()} credits (${price}/unit).`
      );
      return trackNetWorth(next);
    }

    case 'SELL': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const { commodity, qty } = action;
      if (!Number.isInteger(qty) || qty <= 0) return state;
      if (commodity === CONTRABAND) {
        return pushLog(state, 'Use the Black Market panel to trade Contraband.');
      }

      const owned = state.cargo[commodity] || 0;
      if (qty > owned) {
        return pushLog(
          state,
          `Cannot sell ${qty} ${commodity}: you only own ${owned}.`
        );
      }

      const price = state.prices[state.currentPlanet][commodity];
      const revenue = legalSaleRevenue(state, commodity, qty, price);
      const brokerNote =
        revenue > price * qty ? ' (broker bonus)' : '';
      const cargo = {
        ...state.cargo,
        [commodity]: owned - qty,
      };
      let next = {
        ...state,
        credits: state.credits + revenue,
        cargo,
        stats: {
          ...state.stats,
          unitsSold: (state.stats?.unitsSold || 0) + qty,
          bestSale: Math.max(state.stats?.bestSale || 0, revenue),
          profitByCommodity: bumpStatMap(
            state.stats?.profitByCommodity,
            commodity,
            revenue
          ),
        },
      };
      next = pushLog(
        next,
        `Sold ${qty} ${commodity} for ${revenue.toLocaleString()} credits (${price}/unit)${brokerNote}.`
      );
      return trackNetWorth(next);
    }

    case 'BUY_FUEL': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const fuelPrice = state.prices[state.currentPlanet]['Fuel Cells'];
      const room = state.maxFuel - state.fuel;
      if (room <= 0) return pushLog(state, 'Fuel tanks are already full.');

      let qty = action.qty;
      if (!Number.isInteger(qty) || qty <= 0) qty = room;
      qty = Math.min(qty, room);

      const affordable = Math.floor(state.credits / fuelPrice);
      if (affordable <= 0) {
        return pushLog(
          state,
          `Cannot buy fuel: need ${fuelPrice} credits per unit.`
        );
      }
      qty = Math.min(qty, affordable);
      const cost = qty * fuelPrice;

      return pushLog(
        {
          ...state,
          credits: state.credits - cost,
          fuel: Math.min(state.maxFuel, state.fuel + qty),
        },
        `Refueled +${qty} fuel for ${cost.toLocaleString()} credits (${fuelPrice}/unit).`
      );
    }

    case 'TRAVEL': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const { destination } = action;
      if (!PLANETS.includes(destination)) return state;
      if (destination === state.currentPlanet) return state;

      const fuelCost = travelFuelForState(state);
      if (state.fuel < fuelCost) {
        return pushLog(
          state,
          `Cannot travel: need ${fuelCost} fuel, have ${state.fuel}.`
        );
      }

      const nextTurn = state.turn + 1;
      const prevSeasonId = state.season?.id;
      let next = {
        ...state,
        fuel: state.fuel - fuelCost,
        currentPlanet: destination,
        turn: nextTurn,
        pendingRumour: null,
        intelActive: false,
        lanePressure: tickLanePressure(state.lanePressure, destination),
        stats: {
          ...state.stats,
          jumps: (state.stats?.jumps || 0) + 1,
          planetsVisited: bumpStatMap(
            state.stats?.planetsVisited,
            destination,
            1
          ),
        },
      };

      if (next.route?.length) {
        const expected = next.route[next.routeCursor];
        if (expected === destination) {
          next.routeCursor = Math.min(next.routeCursor + 1, next.route.length);
        }
      }

      next = accrueInterest(next);
      next = tickFutures(next);
      next = tickInsurance(next);
      next = tickWarehouseUpkeep(next);
      next = tickCrewWages(next);

      const rivalTick = tickRival(next);
      next.rival = rivalTick.rival;
      if (rivalTick.rivalWin) {
        next.stats = {
          ...next.stats,
          rivalWins: (next.stats?.rivalWins || 0) + rivalTick.rivalWin,
        };
      }
      for (const m of rivalTick.messages) next = pushLog(next, m);
      for (const n of rivalTick.news) next = addNews(next, n);

      const questTick = tickQuests(next);
      next.quests = questTick.quests;
      next.questBoard = questTick.questBoard;
      for (const m of questTick.messages) next = pushLog(next, m);
      for (const n of questTick.news) next = addNews(next, n);

      const demandResult = tickDemandEvents(next.demandEvents, nextTurn);
      const baseSrc = next.basePrices || next.prices;
      const refreshedBase = refreshPrices(baseSrc);
      next = withMarket(
        next,
        refreshedBase,
        demandResult.demandEvents,
        nextTurn
      );
      const prevStockMids = { ...(next.stockPrices || initStockPrices()) };
      next.stockPrices = tickStockPrices(prevStockMids, next.season);
      const mm = settleStockQuotes(next, prevStockMids, next.stockPrices);
      next = mm.state;
      for (const m of mm.messages) next = pushLog(next, m);
      next.priceHistory = appendPriceHistory(state.priceHistory, next.prices);

      next = pushLog(
        next,
        `Travelled to ${destination}. Turn ${nextTurn}. (−${fuelCost} fuel)`
      );

      if (next.season && next.season.id !== prevSeasonId) {
        next = pushLog(
          next,
          `🌀 Sector season: ${next.season.name} — ${next.season.blurb}`
        );
        next = addNews(next, `Season: ${next.season.name}`);
      }

      for (const m of demandResult.messages) {
        next = pushLog(next, m);
        next = addNews(next, m.replace(/^[^\s]+\s/, '').slice(0, 80));
      }

      const pressure = next.lanePressure?.[destination] ?? 0;
      if (pressure >= 70) {
        next = addNews(
          next,
          `⚠️ High pirate pressure at ${destination} (${Math.round(pressure)})`
        );
      }

      const customs = rollCustomsCheck(next);
      if (customs) {
        if (customs.type === 'smuggle_ok') {
          const qty = next.cargo[CONTRABAND] || 0;
          next.stats = {
            ...next.stats,
            contrabandSmuggled: (next.stats?.contrabandSmuggled || 0) + qty,
          };
        }
        if (customs.type === 'customs') {
          next.stats = {
            ...next.stats,
            customsCaught: (next.stats?.customsCaught || 0) + 1,
          };
        }
        next = applyEffects(
          next,
          customs.effects,
          customs.type === 'customs' ? 'customs' : null
        );
        next = pushLog(next, customs.message);
      }

      const event = rollTravelEvent(next);
      if (event) {
        if (event.type === 'pirate') {
          next.stats = {
            ...next.stats,
            pirateEncounters: (next.stats?.pirateEncounters || 0) + 1,
          };
        }
        next = applyEffects(next, event.effects, event.type);
        next = pushLog(next, event.message);
        if (event.type === 'pirate') {
          next = addNews(next, `Pirates hit near ${destination}`);
        }
      }

      // Auto-trade on arrival
      if (next.autoTradeOnArrive && !next.gameOver) {
        const autoActions = evaluateAutoTradeRules(next);
        if (autoActions.length) {
          next = applyTradeActions(next, autoActions);
          next = pushLog(
            next,
            `🤖 Auto-trade ran ${autoActions.length} action(s) at ${destination}.`
          );
        }
      }

      if (nextTurn >= MAX_TURNS) {
        next = { ...next, gameOver: true, turn: MAX_TURNS };
        next = pushLog(
          next,
          `🏁 Journey complete! Turn ${MAX_TURNS} reached. Check your final score.`
        );
      }

      return trackNetWorth(next);
    }

    case 'BUY_UPGRADE': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const { upgradeKey } = action;
      const def = UPGRADES[upgradeKey];
      if (!def) return state;
      const level = state.upgrades[upgradeKey] || 0;
      if (level >= def.maxLevel) {
        return pushLog(state, `${def.name} is already maxed.`);
      }
      const cost = upgradeCost(upgradeKey, level);
      if (cost == null || cost > state.credits) {
        return pushLog(
          state,
          `Cannot buy ${def.name}: need ${cost?.toLocaleString() ?? '?'} credits.`
        );
      }
      const nextLevel = level + 1;
      const upgrades = { ...state.upgrades, [upgradeKey]: nextLevel };
      let next = { ...state, credits: state.credits - cost, upgrades };

      const hull = getHull(state.hullId);
      const p = loadPrestige();
      if (upgradeKey === 'cargo') {
        next.cargoCapacity =
          CARGO_CAPACITY +
          hull.cargoBonus +
          nextLevel * def.perLevel +
          (p.levels?.startCargo || 0) * PRESTIGE_UPGRADES.startCargo.perLevel;
      } else if (upgradeKey === 'fuel') {
        const newMax =
          MAX_FUEL +
          hull.fuelBonus +
          nextLevel * def.perLevel +
          (p.levels?.startFuel || 0) * PRESTIGE_UPGRADES.startFuel.perLevel;
        const gained = newMax - state.maxFuel;
        next.maxFuel = newMax;
        next.fuel = Math.min(newMax, state.fuel + Math.max(0, gained));
      }

      return pushLog(
        next,
        `⚙️ Upgraded ${def.name} to level ${nextLevel} (−${cost.toLocaleString()} cr).`
      );
    }

    case 'BUY_INTEL': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      if (state.intelActive) {
        return pushLog(state, 'Market intel is already active at this port.');
      }
      if (state.credits < INTEL_COST) {
        return pushLog(
          state,
          `Cannot buy intel: need ${INTEL_COST.toLocaleString()} credits.`
        );
      }
      return pushLog(
        {
          ...state,
          credits: state.credits - INTEL_COST,
          intelActive: true,
        },
        `📡 Purchased market intel (−${INTEL_COST.toLocaleString()} cr). Valid until next jump.`
      );
    }

    case 'BORROW': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const amount = action.amount;
      if (!LOAN_OPTIONS.includes(amount)) {
        return pushLog(state, 'Invalid loan amount.');
      }
      if (state.debt + amount > MAX_DEBT) {
        return pushLog(
          state,
          `Cannot borrow: max debt is ${MAX_DEBT.toLocaleString()} cr.`
        );
      }
      if ((state.reputation ?? STARTING_REPUTATION) < 15) {
        return pushLog(state, 'Lenders refuse — reputation too low.');
      }
      const rate = effectiveInterestRate(state);
      return pushLog(
        {
          ...state,
          credits: state.credits + amount,
          debt: state.debt + amount,
        },
        `💳 Borrowed ${amount.toLocaleString()} cr (${(rate * 100).toFixed(1)}% interest per jump).`
      );
    }

    case 'REPAY': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      if (state.debt <= 0) return pushLog(state, 'No outstanding debt.');
      let amount = action.amount;
      if (amount === 'all' || amount == null) {
        amount = Math.min(state.credits, state.debt);
      }
      if (!Number.isInteger(amount) || amount <= 0) return state;
      amount = Math.min(amount, state.credits, state.debt);
      if (amount <= 0) return pushLog(state, 'Not enough credits to repay.');
      const debt = state.debt - amount;
      let next = {
        ...state,
        credits: state.credits - amount,
        debt,
      };
      if (debt === 0) {
        next.reputation = clampRep((next.reputation || STARTING_REPUTATION) + 3);
        next.stats = {
          ...next.stats,
          loansCleared: (next.stats?.loansCleared || 0) + 1,
        };
      }
      next = pushLog(
        next,
        `💳 Repaid ${amount.toLocaleString()} cr. Debt remaining: ${debt.toLocaleString()}.`
      );
      return debt === 0 ? syncAchievements(next) : next;
    }

    case 'OPEN_FUTURES': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const { commodity, qty } = action;
      if (!LEGAL_COMMODITIES.includes(commodity)) {
        return pushLog(state, 'Futures only available for legal commodities.');
      }
      if (!Number.isInteger(qty) || qty <= 0) return state;
      if ((state.futures || []).length >= MAX_FUTURES) {
        return pushLog(state, `Max ${MAX_FUTURES} open futures contracts.`);
      }
      const lockedPrice = state.prices[state.currentPlanet][commodity];
      const fee = Math.max(1, Math.round(lockedPrice * qty * FUTURES_FEE_RATE));
      if (fee > state.credits) {
        return pushLog(
          state,
          `Cannot open futures: fee is ${fee.toLocaleString()} credits.`
        );
      }
      const contract = {
        id: futuresIdSeq++,
        commodity,
        qty,
        lockedPrice,
        turnsLeft: FUTURES_DURATION,
        openedAt: state.currentPlanet,
      };
      return pushLog(
        {
          ...state,
          credits: state.credits - fee,
          futures: [...(state.futures || []), contract],
        },
        `📑 Futures opened: sell ${qty} ${commodity} @ ${lockedPrice} within ${FUTURES_DURATION} jumps (fee ${fee.toLocaleString()}).`
      );
    }

    case 'SETTLE_FUTURES': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const contract = (state.futures || []).find((f) => f.id === action.id);
      if (!contract) return pushLog(state, 'Futures contract not found.');
      const owned = state.cargo[contract.commodity] || 0;
      if (owned <= 0) {
        return pushLog(
          state,
          `Need ${contract.commodity} in cargo to settle this contract.`
        );
      }
      const settleQty = Math.min(owned, contract.qty);
      const revenue = settleQty * contract.lockedPrice;
      const cargo = {
        ...state.cargo,
        [contract.commodity]: owned - settleQty,
      };
      const remainingQty = contract.qty - settleQty;
      const futures =
        remainingQty <= 0
          ? state.futures.filter((f) => f.id !== contract.id)
          : state.futures.map((f) =>
              f.id === contract.id ? { ...f, qty: remainingQty } : f
            );
      let next = {
        ...state,
        credits: state.credits + revenue,
        cargo,
        futures,
        stats: {
          ...state.stats,
          unitsSold: (state.stats?.unitsSold || 0) + settleQty,
          bestSale: Math.max(state.stats?.bestSale || 0, revenue),
        },
      };
      next = pushLog(
        next,
        `📑 Settled ${settleQty} ${contract.commodity} @ locked ${contract.lockedPrice} (+${revenue.toLocaleString()} cr).`
      );
      return trackNetWorth(next);
    }

    case 'BUY_CONTRABAND': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      if (!isBlackMarketPlanet(state.currentPlanet)) {
        return pushLog(state, 'No black market on this planet.');
      }
      const qty = action.qty;
      if (!Number.isInteger(qty) || qty <= 0) return state;
      const price = state.prices[state.currentPlanet][CONTRABAND];
      const cost = price * qty;
      const free = state.cargoCapacity - cargoUsed(state.cargo);
      if (qty > free) {
        return pushLog(state, `Not enough cargo space for ${qty} Contraband.`);
      }
      if (cost > state.credits) {
        return pushLog(state, 'Not enough credits for Contraband.');
      }
      return pushLog(
        {
          ...state,
          credits: state.credits - cost,
          cargo: {
            ...state.cargo,
            [CONTRABAND]: (state.cargo[CONTRABAND] || 0) + qty,
          },
          reputation: clampRep((state.reputation || STARTING_REPUTATION) - 2),
        },
        `🕶️ Bought ${qty} Contraband for ${cost.toLocaleString()} cr. Watch the patrols.`
      );
    }

    case 'SELL_CONTRABAND': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      if (!isBlackMarketPlanet(state.currentPlanet)) {
        return pushLog(state, 'No black market on this planet.');
      }
      const qty = action.qty;
      if (!Number.isInteger(qty) || qty <= 0) return state;
      const owned = state.cargo[CONTRABAND] || 0;
      if (qty > owned) {
        return pushLog(state, `You only have ${owned} Contraband.`);
      }
      const price = state.prices[state.currentPlanet][CONTRABAND];
      const revenue = price * qty;
      let next = {
        ...state,
        credits: state.credits + revenue,
        cargo: {
          ...state.cargo,
          [CONTRABAND]: owned - qty,
        },
        reputation: clampRep((state.reputation || STARTING_REPUTATION) - 3),
        stats: {
          ...state.stats,
          bestSale: Math.max(state.stats?.bestSale || 0, revenue),
        },
      };
      next = pushLog(
        next,
        `🕶️ Sold ${qty} Contraband for ${revenue.toLocaleString()} cr. Reputation suffers.`
      );
      return trackNetWorth(next);
    }

    case 'BUY_INSURANCE': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const plan = INSURANCE_PLANS[action.planKey];
      if (!plan) return state;
      const premium = scaledInsurancePremium(plan.premium, state);
      if (state.credits < premium) {
        return pushLog(
          state,
          `Cannot buy ${plan.name}: need ${premium.toLocaleString()} cr (sector heat adjusted).`
        );
      }
      const insurance = [
        ...(state.insurance || []).filter((p) => p.id !== plan.id),
        {
          id: plan.id,
          name: plan.name,
          covers: [...plan.covers],
          turnsLeft: plan.duration,
        },
      ];
      return pushLog(
        {
          ...state,
          credits: state.credits - premium,
          insurance,
        },
        `🛡️ Bought ${plan.name} for ${premium.toLocaleString()} cr (${plan.duration} jumps, heat-adjusted).`
      );
    }

    case 'UNLOCK_WAREHOUSE': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const planet = state.currentPlanet;
      if (state.warehouses[planet]) {
        return pushLog(state, `Warehouse already unlocked on ${planet}.`);
      }
      if (state.credits < WAREHOUSE_UNLOCK_COST) {
        return pushLog(
          state,
          `Need ${WAREHOUSE_UNLOCK_COST.toLocaleString()} cr to unlock a warehouse.`
        );
      }
      return pushLog(
        {
          ...state,
          credits: state.credits - WAREHOUSE_UNLOCK_COST,
          warehouses: {
            ...state.warehouses,
            [planet]: emptyCargo(),
          },
        },
        `🏭 Unlocked warehouse on ${planet} (−${WAREHOUSE_UNLOCK_COST.toLocaleString()} cr, cap ${WAREHOUSE_CAPACITY}).`
      );
    }

    case 'WAREHOUSE_DEPOSIT': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const planet = state.currentPlanet;
      const wh = state.warehouses[planet];
      if (!wh) return pushLog(state, 'Unlock a warehouse here first.');
      const { commodity, qty } = action;
      if (!COMMODITY_OK(commodity) || !Number.isInteger(qty) || qty <= 0) {
        return state;
      }
      const owned = state.cargo[commodity] || 0;
      if (qty > owned) {
        return pushLog(state, `Only ${owned} ${commodity} on ship.`);
      }
      const free = WAREHOUSE_CAPACITY - cargoUsed(wh);
      if (qty > free) {
        return pushLog(state, `Warehouse only has ${free} free slots.`);
      }
      const cargo = {
        ...state.cargo,
        [commodity]: owned - qty,
      };
      const warehouseCargo = {
        ...wh,
        [commodity]: (wh[commodity] || 0) + qty,
      };
      let next = {
        ...state,
        cargo,
        warehouses: { ...state.warehouses, [planet]: warehouseCargo },
        stats: {
          ...state.stats,
          warehouseDeposits: (state.stats?.warehouseDeposits || 0) + 1,
        },
      };
      next = pushLog(
        next,
        `🏭 Deposited ${qty} ${commodity} into ${planet} warehouse.`
      );
      return trackNetWorth(syncAchievements(next));
    }

    case 'WAREHOUSE_WITHDRAW': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const planet = state.currentPlanet;
      const wh = state.warehouses[planet];
      if (!wh) return pushLog(state, 'No warehouse on this planet.');
      const { commodity, qty } = action;
      if (!COMMODITY_OK(commodity) || !Number.isInteger(qty) || qty <= 0) {
        return state;
      }
      const stored = wh[commodity] || 0;
      if (qty > stored) {
        return pushLog(state, `Only ${stored} ${commodity} in warehouse.`);
      }
      const free = state.cargoCapacity - cargoUsed(state.cargo);
      if (qty > free) {
        return pushLog(state, `Ship only has ${free} free cargo space.`);
      }
      const cargo = {
        ...state.cargo,
        [commodity]: (state.cargo[commodity] || 0) + qty,
      };
      const warehouseCargo = {
        ...wh,
        [commodity]: stored - qty,
      };
      let next = {
        ...state,
        cargo,
        warehouses: { ...state.warehouses, [planet]: warehouseCargo },
      };
      next = pushLog(
        next,
        `🏭 Withdrew ${qty} ${commodity} from ${planet} warehouse.`
      );
      return trackNetWorth(next);
    }

    case 'SET_ROUTE': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const route = (action.route || []).filter((p) => PLANETS.includes(p));
      if (route.length < 1) {
        return pushLog(
          { ...state, route: [], routeCursor: 0 },
          'Route cleared.'
        );
      }
      let next = {
        ...state,
        route,
        routeCursor: 0,
        stats: {
          ...state.stats,
          routesSaved: (state.stats?.routesSaved || 0) + 1,
        },
      };
      next = pushLog(
        next,
        `🗺️ Route saved: ${route.join(' → ')} (${route.length} stop${route.length === 1 ? '' : 's'}).`
      );
      return syncAchievements(next);
    }

    case 'ROUTE_NEXT': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const route = state.route || [];
      if (!route.length) return pushLog(state, 'No saved route.');
      let idx = state.routeCursor || 0;
      while (idx < route.length && route[idx] === state.currentPlanet) idx += 1;
      if (idx >= route.length) {
        return pushLog(
          { ...state, routeCursor: 0 },
          'Route complete — cursor reset. Press Next hop again to restart.'
        );
      }
      return reducer(
        { ...state, routeCursor: idx },
        { type: 'TRAVEL', destination: route[idx] }
      );
    }

    /* ── Quests ────────────────────────────────────────────────── */
    case 'ACCEPT_QUEST': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const q = (state.questBoard || []).find((x) => x.id === action.id);
      if (!q) return pushLog(state, 'Contract not found on the board.');
      if ((state.quests || []).length >= MAX_ACTIVE_QUESTS) {
        return pushLog(state, `Max ${MAX_ACTIVE_QUESTS} active contracts.`);
      }
      const quests = [...(state.quests || []), { ...q, accepted: true }];
      const questBoard = state.questBoard.filter((x) => x.id !== action.id);
      let next = { ...state, quests, questBoard };
      next = pushLog(
        next,
        `📋 Accepted: ${q.title} → ${q.toPlanet} (+${q.reward.toLocaleString()} cr, ${q.turnsLeft} jumps).`
      );
      next = addNews(next, `Accepted contract → ${q.toPlanet}`);
      return next;
    }

    case 'COMPLETE_QUEST': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const q = (state.quests || []).find((x) => x.id === action.id);
      if (!q) return pushLog(state, 'Active contract not found.');
      if (state.currentPlanet !== q.toPlanet) {
        return pushLog(state, `Deliver at ${q.toPlanet}.`);
      }
      const owned = state.cargo[q.commodity] || 0;
      if (owned < q.qty) {
        return pushLog(
          state,
          `Need ${q.qty} ${q.commodity} (have ${owned}).`
        );
      }
      const cargo = {
        ...state.cargo,
        [q.commodity]: owned - q.qty,
      };
      let next = {
        ...state,
        cargo,
        credits: state.credits + q.reward,
        reputation: clampRep(
          (state.reputation || STARTING_REPUTATION) + (q.repReward || 0)
        ),
        quests: state.quests.filter((x) => x.id !== q.id),
        stats: {
          ...state.stats,
          questsCompleted: (state.stats?.questsCompleted || 0) + 1,
          unitsSold: (state.stats?.unitsSold || 0) + q.qty,
        },
      };
      next = pushLog(
        next,
        `📋 Contract complete: ${q.title}. +${q.reward.toLocaleString()} cr, +${q.repReward || 0} rep.`
      );
      next = addNews(next, `Contract paid: +${q.reward} cr`);
      return trackNetWorth(syncAchievements(next));
    }

    case 'ABANDON_QUEST': {
      if (state.gameOver) return state;
      const q = (state.quests || []).find((x) => x.id === action.id);
      if (!q) return state;
      let next = {
        ...state,
        quests: state.quests.filter((x) => x.id !== q.id),
        reputation: clampRep((state.reputation || STARTING_REPUTATION) - 2),
      };
      return pushLog(next, `📋 Abandoned contract: ${q.title}. (−2 rep)`);
    }

    /* ── Crew ──────────────────────────────────────────────────── */
    case 'HIRE_CREW': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const role = CREW_ROLES[action.roleId];
      if (!role) return state;
      if (state.crew?.[action.roleId]) {
        return pushLog(state, `${role.name} is already on the roster.`);
      }
      if (state.credits < role.hireCost) {
        return pushLog(
          state,
          `Need ${role.hireCost.toLocaleString()} cr to hire ${role.name}.`
        );
      }
      let next = {
        ...state,
        credits: state.credits - role.hireCost,
        crew: { ...state.crew, [action.roleId]: true },
        stats: {
          ...state.stats,
          crewHired: (state.stats?.crewHired || 0) + 1,
        },
      };
      next = pushLog(
        next,
        `👥 Hired ${role.name} (−${role.hireCost.toLocaleString()} cr, wage ${role.wage}/jump).`
      );
      return next;
    }

    case 'FIRE_CREW': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const role = CREW_ROLES[action.roleId];
      if (!role || !state.crew?.[action.roleId]) {
        return pushLog(state, 'That specialist is not on board.');
      }
      let next = {
        ...state,
        crew: { ...state.crew, [action.roleId]: false },
      };
      return pushLog(next, `👥 Released ${role.name} from the crew.`);
    }

    /* ── Stocks (bid/ask microstructure) ───────────────────────── */
    /* BUY = take the market ask. SELL = hit the market bid.        */
    case 'BUY_STOCK': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const id = action.indexId;
      if (!STOCK_INDICES[id]) return state;
      let shares = action.shares;
      if (!Number.isInteger(shares) || shares <= 0) return state;
      const mid = state.stockPrices?.[id] || STOCK_INDICES[id].base;
      const book = marketBook(mid, state.season, id);
      const unit = book.ask;
      const cost = unit * shares;
      if (cost > state.credits) {
        return pushLog(
          state,
          `Need ${cost.toLocaleString()} cr to take the ask on ${shares} ${STOCK_INDICES[id].name} @ ${unit}.`
        );
      }
      const nextMid = applyTradeImpact(mid, 'buy', shares);
      let next = {
        ...state,
        credits: state.credits - cost,
        portfolio: {
          ...state.portfolio,
          [id]: (state.portfolio?.[id] || 0) + shares,
        },
        stockPrices: { ...state.stockPrices, [id]: nextMid },
        stats: {
          ...state.stats,
          stockTrades: (state.stats?.stockTrades || 0) + 1,
          stockSpent: (state.stats?.stockSpent || 0) + cost,
        },
      };
      next = pushLog(
        next,
        `📈 Took ask: ${shares} ${STOCK_INDICES[id].name} @ ${unit} (−${cost.toLocaleString()} cr). Mid → ${nextMid}.`
      );
      return trackNetWorth(next);
    }

    case 'SELL_STOCK': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const id = action.indexId;
      if (!STOCK_INDICES[id]) return state;
      let shares = action.shares;
      if (!Number.isInteger(shares) || shares <= 0) return state;
      const owned = state.portfolio?.[id] || 0;
      if (shares > owned) {
        return pushLog(state, `You only hold ${owned} shares.`);
      }
      const mid = state.stockPrices?.[id] || STOCK_INDICES[id].base;
      const book = marketBook(mid, state.season, id);
      const unit = book.bid;
      const revenue = unit * shares;
      const nextMid = applyTradeImpact(mid, 'sell', shares);
      let next = {
        ...state,
        credits: state.credits + revenue,
        portfolio: {
          ...state.portfolio,
          [id]: owned - shares,
        },
        stockPrices: { ...state.stockPrices, [id]: nextMid },
        stats: {
          ...state.stats,
          stockTrades: (state.stats?.stockTrades || 0) + 1,
          stockEarned: (state.stats?.stockEarned || 0) + revenue,
        },
      };
      next = pushLog(
        next,
        `📉 Hit bid: ${shares} ${STOCK_INDICES[id].name} @ ${unit} (+${revenue.toLocaleString()} cr). Mid → ${nextMid}.`
      );
      return trackNetWorth(next);
    }

    case 'POST_STOCK_QUOTE': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const id = action.indexId;
      if (!STOCK_INDICES[id]) return state;
      const bidSize = Math.max(0, Math.min(99, Math.floor(Number(action.bidSize) || 0)));
      const askSize = Math.max(0, Math.min(99, Math.floor(Number(action.askSize) || 0)));
      if (bidSize <= 0 && askSize <= 0) {
        return pushLog(state, 'Post a bid size, ask size, or both to make a market.');
      }
      const mid = state.stockPrices?.[id] || STOCK_INDICES[id].base;
      const book = marketBook(mid, state.season, id);
      const owned = state.portfolio?.[id] || 0;
      if (askSize > owned) {
        return pushLog(
          state,
          `Need ${askSize} shares to offer that ask (hold ${owned}). Buy first or lower ask size.`
        );
      }
      const bidReserve = book.bid * bidSize;
      if (bidSize > 0 && bidReserve > state.credits) {
        return pushLog(
          state,
          `Need ~${bidReserve.toLocaleString()} cr to stand for ${bidSize} on the bid @ ${book.bid}.`
        );
      }
      let next = {
        ...state,
        stockQuotes: {
          ...(state.stockQuotes || emptyStockQuotes()),
          [id]: { bidSize, askSize },
        },
        stats: {
          ...state.stats,
          mmQuotes: (state.stats?.mmQuotes || 0) + 1,
        },
      };
      next = pushLog(
        next,
        `🏦 2-way quote on ${STOCK_INDICES[id].name}: bid ${bidSize}@${book.bid} · ask ${askSize}@${book.ask}. Flow fills on jumps.`
      );
      return next;
    }

    case 'PULL_STOCK_QUOTE': {
      if (state.gameOver) return state;
      const id = action.indexId;
      if (!STOCK_INDICES[id]) return state;
      if (!state.stockQuotes?.[id]) {
        return pushLog(state, 'No resting quote on that index.');
      }
      let next = {
        ...state,
        stockQuotes: {
          ...(state.stockQuotes || emptyStockQuotes()),
          [id]: null,
        },
      };
      next = pushLog(
        next,
        `🏦 Pulled quotes on ${STOCK_INDICES[id].name}.`
      );
      return next;
    }

    case 'CLAIM_MISSION': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      if (!state.missionsEnabled) return state;
      const mission = TUTORIAL_MISSIONS.find((m) => m.id === action.id);
      if (!mission) return state;
      if ((state.missionsClaimed || []).includes(mission.id)) {
        return pushLog(state, 'Mission reward already claimed.');
      }
      if (!mission.check(state)) {
        return pushLog(state, 'Mission not complete yet.');
      }
      let next = {
        ...state,
        credits: state.credits + mission.reward,
        missionsClaimed: [...(state.missionsClaimed || []), mission.id],
      };
      next = pushLog(
        next,
        `🎯 Mission complete: ${mission.title} (+${mission.reward.toLocaleString()} cr).`
      );
      next = addNews(next, `Mission: ${mission.title}`);
      return trackNetWorth(next);
    }

    case 'SET_AUTO_TRADE_RULES':
      return {
        ...state,
        autoTradeRules: Array.isArray(action.rules) ? action.rules : [],
      };

    case 'SET_AUTO_TRADE_ON_ARRIVE':
      return { ...state, autoTradeOnArrive: Boolean(action.value) };

    case 'RUN_AUTO_TRADE': {
      if (state.gameOver || blockedWithoutHull(state)) return state;
      const actions = evaluateAutoTradeRules(state);
      if (!actions.length) {
        return pushLog(state, 'No auto-trade rules matched here.');
      }
      let next = applyTradeActions(state, actions);
      next = pushLog(
        next,
        `🤖 Manual auto-trade: ${actions.length} action(s).`
      );
      return trackNetWorth(next);
    }

    case 'MARK_SCORE_RECORDED':
      return { ...state, scoreRecorded: true, prestigeAwarded: true };

    case 'LOAD_STATE': {
      const normalized = normalizeState(action.state);
      // Restore RNG seed for continuing seeded runs (doesn't rewind stream)
      setRngSeed(normalized.rngSeed);
      return {
        ...normalized,
        gameOver: normalized.turn >= MAX_TURNS || Boolean(normalized.gameOver),
        needsHullSelect: !normalized.hullId,
      };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState()
  );

  const dispatchAction = useCallback((type, payload = {}) => {
    dispatch({ type, ...payload });
  }, []);

  const newGame = useCallback((companyName, opts = {}) => {
    dispatch({
      type: 'NEW_GAME',
      companyName,
      mode: opts.mode,
      seed: opts.seed,
      difficulty: opts.difficulty,
    });
  }, []);

  const setDifficulty = useCallback((difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  const claimMission = useCallback((id) => {
    dispatch({ type: 'CLAIM_MISSION', id });
  }, []);

  const setAutoTradeRules = useCallback((rules) => {
    dispatch({ type: 'SET_AUTO_TRADE_RULES', rules });
  }, []);

  const setAutoTradeOnArrive = useCallback((value) => {
    dispatch({ type: 'SET_AUTO_TRADE_ON_ARRIVE', value });
  }, []);

  const runAutoTrade = useCallback(() => {
    dispatch({ type: 'RUN_AUTO_TRADE' });
  }, []);

  const hireCrew = useCallback((roleId) => {
    dispatch({ type: 'HIRE_CREW', roleId });
  }, []);

  const fireCrew = useCallback((roleId) => {
    dispatch({ type: 'FIRE_CREW', roleId });
  }, []);

  const buyStock = useCallback((indexId, shares) => {
    dispatch({ type: 'BUY_STOCK', indexId, shares });
  }, []);

  const sellStock = useCallback((indexId, shares) => {
    dispatch({ type: 'SELL_STOCK', indexId, shares });
  }, []);

  const postStockQuote = useCallback((indexId, bidSize, askSize) => {
    dispatch({ type: 'POST_STOCK_QUOTE', indexId, bidSize, askSize });
  }, []);

  const pullStockQuote = useCallback((indexId) => {
    dispatch({ type: 'PULL_STOCK_QUOTE', indexId });
  }, []);

  const selectHull = useCallback((hullId) => {
    dispatch({ type: 'SELECT_HULL', hullId });
  }, []);

  const switchHull = useCallback((hullId) => {
    dispatch({ type: 'SWITCH_HULL', hullId });
  }, []);

  const setCompanyName = useCallback((name) => {
    dispatch({ type: 'SET_COMPANY_NAME', name });
  }, []);

  const buy = useCallback((commodity, qty) => {
    dispatch({ type: 'BUY', commodity, qty });
  }, []);

  const sell = useCallback((commodity, qty) => {
    dispatch({ type: 'SELL', commodity, qty });
  }, []);

  const buyFuel = useCallback((qty) => {
    dispatch({ type: 'BUY_FUEL', qty });
  }, []);

  const travel = useCallback((destination) => {
    dispatch({ type: 'TRAVEL', destination });
  }, []);

  const buyUpgrade = useCallback((upgradeKey) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeKey });
  }, []);

  const buyIntel = useCallback(() => {
    dispatch({ type: 'BUY_INTEL' });
  }, []);

  const borrow = useCallback((amount) => {
    dispatch({ type: 'BORROW', amount });
  }, []);

  const repay = useCallback((amount) => {
    dispatch({ type: 'REPAY', amount });
  }, []);

  const openFutures = useCallback((commodity, qty) => {
    dispatch({ type: 'OPEN_FUTURES', commodity, qty });
  }, []);

  const settleFutures = useCallback((id) => {
    dispatch({ type: 'SETTLE_FUTURES', id });
  }, []);

  const buyContraband = useCallback((qty) => {
    dispatch({ type: 'BUY_CONTRABAND', qty });
  }, []);

  const sellContraband = useCallback((qty) => {
    dispatch({ type: 'SELL_CONTRABAND', qty });
  }, []);

  const buyInsurance = useCallback((planKey) => {
    dispatch({ type: 'BUY_INSURANCE', planKey });
  }, []);

  const unlockWarehouse = useCallback(() => {
    dispatch({ type: 'UNLOCK_WAREHOUSE' });
  }, []);

  const warehouseDeposit = useCallback((commodity, qty) => {
    dispatch({ type: 'WAREHOUSE_DEPOSIT', commodity, qty });
  }, []);

  const warehouseWithdraw = useCallback((commodity, qty) => {
    dispatch({ type: 'WAREHOUSE_WITHDRAW', commodity, qty });
  }, []);

  const setRoute = useCallback((route) => {
    dispatch({ type: 'SET_ROUTE', route });
  }, []);

  const routeNext = useCallback(() => {
    dispatch({ type: 'ROUTE_NEXT' });
  }, []);

  const acceptQuest = useCallback((id) => {
    dispatch({ type: 'ACCEPT_QUEST', id });
  }, []);

  const completeQuest = useCallback((id) => {
    dispatch({ type: 'COMPLETE_QUEST', id });
  }, []);

  const abandonQuest = useCallback((id) => {
    dispatch({ type: 'ABANDON_QUEST', id });
  }, []);

  const markScoreRecorded = useCallback(() => {
    dispatch({ type: 'MARK_SCORE_RECORDED' });
  }, []);

  const saveGame = useCallback(
    (slotId, label) => {
      try {
        if (slotId) {
          return saveToSlot(slotId, state, label);
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        return { ok: true, message: 'Quick-saved.' };
      } catch {
        return { ok: false, message: 'Save failed (storage full or blocked).' };
      }
    },
    [state]
  );

  const loadGame = useCallback((slotId) => {
    try {
      if (slotId) {
        const result = loadFromSlot(slotId);
        if (!result.ok || !result.game) return result;
        dispatch({ type: 'LOAD_STATE', state: result.game });
        return result;
      }
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ok: false, message: 'No quick-save found.' };
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.credits !== 'number' ||
        !parsed.prices ||
        !parsed.cargo
      ) {
        return { ok: false, message: 'Save data is corrupted.' };
      }
      dispatch({ type: 'LOAD_STATE', state: parsed });
      return { ok: true, message: 'Quick-save loaded.' };
    } catch {
      return { ok: false, message: 'Failed to load save data.' };
    }
  }, []);

  const importGame = useCallback((gameState) => {
    try {
      if (
        typeof gameState.credits !== 'number' ||
        !gameState.prices ||
        !gameState.cargo
      ) {
        return { ok: false, message: 'Import failed: invalid save.' };
      }
      dispatch({ type: 'LOAD_STATE', state: gameState });
      return { ok: true, message: 'Save imported.' };
    } catch {
      return { ok: false, message: 'Import failed.' };
    }
  }, []);

  return {
    state,
    newGame,
    setDifficulty,
    selectHull,
    switchHull,
    setCompanyName,
    claimMission,
    setAutoTradeRules,
    setAutoTradeOnArrive,
    runAutoTrade,
    buy,
    sell,
    buyFuel,
    travel,
    buyUpgrade,
    buyIntel,
    borrow,
    repay,
    openFutures,
    settleFutures,
    buyContraband,
    sellContraband,
    buyInsurance,
    unlockWarehouse,
    warehouseDeposit,
    warehouseWithdraw,
    setRoute,
    routeNext,
    acceptQuest,
    completeQuest,
    abandonQuest,
    hireCrew,
    fireCrew,
    buyStock,
    sellStock,
    postStockQuote,
    pullStockQuote,
    markScoreRecorded,
    saveGame,
    loadGame,
    importGame,
    dispatchAction,
  };
}
