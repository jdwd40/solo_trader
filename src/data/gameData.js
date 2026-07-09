/** Planets and commodities for Star Trader Solo */

export const PLANETS = [
  'Earthport',
  'Mars Exchange',
  'Titan Yard',
  'Nova Prime',
  'Vega Station',
  'Outer Rim Depot',
];

export const LEGAL_COMMODITIES = [
  'Food',
  'Ore',
  'Medicine',
  'Electronics',
  'Fuel Cells',
  'Luxury Goods',
];

export const CONTRABAND = 'Contraband';
export const COMMODITIES = [...LEGAL_COMMODITIES, CONTRABAND];
export const BLACK_MARKET_PLANETS = ['Outer Rim Depot', 'Vega Station'];

export const STARTING_CREDITS = 10_000;
export const CARGO_CAPACITY = 50;
export const MAX_FUEL = 100;
export const STARTING_FUEL = 100;
export const TRAVEL_FUEL_COST = 10;
export const MAX_TURNS = 100;
export const MIN_PRICE = 10;
export const SAVE_KEY = 'star-trader-solo-save';
export const SAVE_SLOTS_KEY = 'star-trader-solo-slots';
export const HIGH_SCORE_KEY = 'star-trader-solo-high-scores';
export const DAILY_SCORE_KEY = 'star-trader-solo-daily-scores';
export const SETTINGS_KEY = 'star-trader-solo-settings';
export const TUTORIAL_KEY = 'star-trader-solo-tutorial-done';
export const WELCOME_KEY = 'star-trader-solo-welcome-seen';
export const PRESTIGE_KEY = 'star-trader-solo-prestige';
export const MAX_HIGH_SCORES = 10;
export const MAX_SAVE_SLOTS = 6;
export const PRICE_HISTORY_LEN = 8;
export const INTEL_COST = 750;
export const HULL_SWITCH_COST = 5_000;
export const MAX_ACTIVE_QUESTS = 2;
export const QUEST_SPAWN_CHANCE = 0.35;
export const SAVE_VERSION = 5;
export const MISSIONS_KEY = 'star-trader-solo-missions-seen';

/** Named save slot IDs */
export const SAVE_SLOT_IDS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ── Icons (emoji — crisp on mobile, zero assets) ─────────────── */
export const COMMODITY_ICONS = {
  Food: '🍞',
  Ore: '⛏️',
  Medicine: '💊',
  Electronics: '🔌',
  'Fuel Cells': '🔋',
  'Luxury Goods': '💎',
  Contraband: '🕶️',
};

export const PLANET_ICONS = {
  Earthport: '🌍',
  'Mars Exchange': '🔴',
  'Titan Yard': '🛠️',
  'Nova Prime': '✨',
  'Vega Station': '🟣',
  'Outer Rim Depot': '☄️',
};

/** Photoreal dock vistas (public/locations/) shown when player is docked */
export const LOCATION_IMAGES = {
  Earthport: {
    src: '/locations/earthport.jpg',
    blurb: 'Orbital rings above a living Earth — the sector’s busiest freeport.',
  },
  'Mars Exchange': {
    src: '/locations/mars-exchange.jpg',
    blurb: 'Dust markets and freighter ramps on the red plains of Mars.',
  },
  'Titan Yard': {
    src: '/locations/titan-yard.jpg',
    blurb: 'Shipyard gantries glowing over Titan’s haze and Saturn’s rings.',
  },
  'Nova Prime': {
    src: '/locations/nova-prime.jpg',
    blurb: 'Neon landing pads under aurora — high-tech capital of the belt.',
  },
  'Vega Station': {
    src: '/locations/vega-station.jpg',
    blurb: 'Luxury atriums and violet markets under a jeweled starfield.',
  },
  'Outer Rim Depot': {
    src: '/locations/outer-rim-depot.jpg',
    blurb: 'A hardscrabble asteroid stop where fuel is cheap and questions cost extra.',
  },
};

/* ── Difficulty presets ───────────────────────────────────────── */
export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    name: 'Easy',
    blurb: 'More capital, gentler interest & pirates.',
    creditMult: 1.3,
    interestMult: 0.65,
    pirateMult: 0.65,
    rivalAggro: 0.22,
    pressureMult: 0.8,
    wageMult: 0.85,
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    blurb: 'Balanced sector economics.',
    creditMult: 1,
    interestMult: 1,
    pirateMult: 1,
    rivalAggro: 0.4,
    pressureMult: 1,
    wageMult: 1,
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    blurb: 'Thin margins, hot lanes, aggressive rivals.',
    creditMult: 0.8,
    interestMult: 1.4,
    pirateMult: 1.45,
    rivalAggro: 0.62,
    pressureMult: 1.25,
    wageMult: 1.15,
  },
};

/* ── Tutorial mission track ───────────────────────────────────── */
export const TUTORIAL_MISSIONS = [
  {
    id: 'first_trade',
    title: 'Open the books',
    desc: 'Buy any legal commodity on the market.',
    reward: 400,
    check: (s) => (s.stats?.unitsBought || 0) >= 1,
  },
  {
    id: 'first_jump',
    title: 'Clear for jump',
    desc: 'Travel to another planet.',
    reward: 400,
    check: (s) => (s.stats?.jumps || 0) >= 1,
  },
  {
    id: 'hire_crew',
    title: 'Assemble a crew',
    desc: 'Hire any specialist (Navigator, Broker, or Gunner).',
    reward: 600,
    check: (s) => (s.stats?.crewHired || 0) >= 1,
  },
  {
    id: 'stock_trade',
    title: 'Play the indices',
    desc: 'Buy or sell sector stock shares.',
    reward: 500,
    check: (s) => (s.stats?.stockTrades || 0) >= 1,
  },
  {
    id: 'contract',
    title: 'Guild courier',
    desc: 'Complete one delivery contract.',
    reward: 800,
    check: (s) => (s.stats?.questsCompleted || 0) >= 1,
  },
  {
    id: 'rival_aware',
    title: 'Watch the competition',
    desc: 'Survive a jump after a rival scoops a demand run (or make 5 jumps).',
    reward: 700,
    check: (s) =>
      (s.stats?.rivalWins || 0) >= 1 || (s.stats?.jumps || 0) >= 5,
  },
];

/* ── Rival NPC freighters ─────────────────────────────────────── */
export const RIVAL_NAMES = [
  'Captain Vex of the Dust Hauler',
  'Madam Korr’s Express',
  'Iron Quill Trading Co.',
  'Neon Moth Logistics',
  'Rim Rat Couriers',
];

/* ── Crew specialists ─────────────────────────────────────────── */
export const CREW_ROLES = {
  navigator: {
    id: 'navigator',
    name: 'Navigator',
    blurb: '−1 fuel per jump (min 6).',
    hireCost: 2_000,
    wage: 80,
    fuelDiscount: 1,
    avatar: '/crew/navigator.jpg',
  },
  broker: {
    id: 'broker',
    name: 'Broker',
    blurb: '+8% credits on legal market sales.',
    hireCost: 2_500,
    wage: 100,
    saleBonus: 0.08,
    avatar: '/crew/broker.jpg',
  },
  gunner: {
    id: 'gunner',
    name: 'Gunner',
    blurb: 'Halves pirate toll losses.',
    hireCost: 2_200,
    wage: 90,
    pirateLossMod: 0.5,
    avatar: '/crew/gunner.jpg',
  },
};

/* ── Sector stock indices ─────────────────────────────────────── */
export const STOCK_INDICES = {
  agri: {
    id: 'agri',
    name: 'Agri Index',
    blurb: 'Food & Medicine basket',
    commodities: ['Food', 'Medicine'],
    base: 100,
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Index',
    blurb: 'Ore & Electronics',
    commodities: ['Ore', 'Electronics'],
    base: 100,
  },
  energy: {
    id: 'energy',
    name: 'Energy Index',
    blurb: 'Fuel Cells',
    commodities: ['Fuel Cells'],
    base: 100,
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Index',
    blurb: 'Luxury Goods',
    commodities: ['Luxury Goods'],
    base: 110,
  },
};

/* ── Accessibility defaults ───────────────────────────────────── */
export function defaultSettings() {
  return {
    highContrast: false,
    reducedMotion: false,
    showShortcuts: true,
    soundEnabled: true,
    soundVolume: 0.35,
  };
}

/* ── Ship hulls ───────────────────────────────────────────────── */
export const SHIP_HULLS = {
  freighter: {
    id: 'freighter',
    name: 'Bulk Freighter',
    blurb: 'Extra hold for honest bulk trade.',
    cargoBonus: 20,
    fuelBonus: 0,
    travelFuelCost: 10,
    contrabandRiskMod: 1.0,
    pirateRiskMod: 0.9,
    interestMod: 1.0,
    image: '/ships/freighter.jpg',
  },
  smuggler: {
    id: 'smuggler',
    name: 'Shadow Runner',
    blurb: 'Harder to catch with Contraband; pirates notice you.',
    cargoBonus: -5,
    fuelBonus: 15,
    travelFuelCost: 9,
    contrabandRiskMod: 0.55,
    pirateRiskMod: 1.2,
    interestMod: 1.08,
    image: '/ships/smuggler.jpg',
  },
  tanker: {
    id: 'tanker',
    name: 'Fuel Tanker',
    blurb: 'Huge tanks and cheaper jumps.',
    cargoBonus: 5,
    fuelBonus: 55,
    travelFuelCost: 8,
    contrabandRiskMod: 1.1,
    pirateRiskMod: 0.85,
    interestMod: 0.95,
    image: '/ships/tanker.jpg',
  },
};

/* ── Prestige (meta progression across runs) ──────────────────── */
export const PRESTIGE_UPGRADES = {
  startCargo: {
    id: 'startCargo',
    name: 'Expanded Keel',
    desc: '+8 starting cargo per level',
    maxLevel: 4,
    costs: [1, 2, 3, 4],
    perLevel: 8,
  },
  startFuel: {
    id: 'startFuel',
    name: 'Reserve Tanks',
    desc: '+20 starting max fuel per level',
    maxLevel: 3,
    costs: [1, 2, 3],
    perLevel: 20,
  },
  startCredits: {
    id: 'startCredits',
    name: 'Seed Capital',
    desc: '+2,500 starting credits per level',
    maxLevel: 4,
    costs: [1, 2, 3, 4],
    perLevel: 2500,
  },
  interestCut: {
    id: 'interestCut',
    name: 'Preferred Lender',
    desc: '−1% loan interest per level',
    maxLevel: 3,
    costs: [2, 3, 4],
    perLevel: 0.01,
  },
  startIntel: {
    id: 'startIntel',
    name: 'Briefing Dossier',
    desc: 'Start each run with market intel active',
    maxLevel: 1,
    costs: [2],
    perLevel: 1,
  },
};

/** Prestige points earned from final net worth */
export function prestigePointsFromNetWorth(netWorth) {
  return Math.max(0, Math.floor(Math.max(0, netWorth) / 20_000));
}

export function emptyPrestige() {
  return {
    points: 0,
    totalEarned: 0,
    levels: {
      startCargo: 0,
      startFuel: 0,
      startCredits: 0,
      interestCut: 0,
      startIntel: 0,
    },
  };
}

/* ── Loans ────────────────────────────────────────────────────── */
export const LOAN_OPTIONS = [2_000, 5_000, 10_000];
export const MAX_DEBT = 25_000;
export const LOAN_INTEREST_RATE = 0.05;

/* ── Futures ──────────────────────────────────────────────────── */
export const FUTURES_FEE_RATE = 0.08;
export const FUTURES_DURATION = 5;
export const FUTURES_PENALTY_RATE = 0.12;
export const MAX_FUTURES = 3;

/* ── Demand events ────────────────────────────────────────────── */
export const DEMAND_SPAWN_CHANCE = 0.22;
export const MAX_ACTIVE_DEMANDS = 2;
export const DEMAND_DURATION_MIN = 3;
export const DEMAND_DURATION_MAX = 6;

/* ── Reputation ───────────────────────────────────────────────── */
export const STARTING_REPUTATION = 55;
export const MIN_REPUTATION = 0;
export const MAX_REPUTATION = 100;

/* ── Insurance ────────────────────────────────────────────────── */
export const INSURANCE_PLANS = {
  cargo: {
    id: 'cargo',
    name: 'Cargo Shield',
    description: 'Covers Food/Medicine spoilage',
    premium: 800,
    duration: 5,
    covers: ['spoilage'],
  },
  hull: {
    id: 'hull',
    name: 'Hull & Tank',
    description: 'Covers fuel leak losses',
    premium: 600,
    duration: 5,
    covers: ['fuelLeak'],
  },
  customs: {
    id: 'customs',
    name: 'Customs Bond',
    description: 'Covers fines & seizures on busts',
    premium: 1400,
    duration: 4,
    covers: ['customs'],
  },
  full: {
    id: 'full',
    name: 'Full Voyage Cover',
    description: 'Spoilage + fuel leak + customs',
    premium: 2400,
    duration: 6,
    covers: ['spoilage', 'fuelLeak', 'customs'],
  },
};

/* ── Warehouse ────────────────────────────────────────────────── */
export const WAREHOUSE_UNLOCK_COST = 1_500;
export const WAREHOUSE_CAPACITY = 30;
/** Small upkeep charged each jump if that warehouse holds goods */
export const WAREHOUSE_UPKEEP = 40;

/* ── Seasonal economy (predictable multi-jump cycles) ─────────── */
export const SEASON_CYCLE = [
  {
    id: 'harvest',
    name: 'Harvest Cycle',
    duration: 10,
    blurb: 'Farms dump Food & Medicine into the sector.',
    mods: { Food: 0.78, Medicine: 0.9 },
  },
  {
    id: 'festival',
    name: 'Festival Season',
    duration: 10,
    blurb: 'Luxury demand soars; parties need Electronics.',
    mods: { 'Luxury Goods': 1.28, Electronics: 1.12, Food: 1.08 },
  },
  {
    id: 'blockade',
    name: 'Industrial Blockade',
    duration: 10,
    blurb: 'Ore lanes are choked; raw materials spike.',
    mods: { Ore: 1.38, Electronics: 1.18 },
  },
  {
    id: 'fuelrush',
    name: 'Fuel Rush',
    duration: 10,
    blurb: 'Fleets scramble for Fuel Cells — and shadows move Contraband.',
    mods: { 'Fuel Cells': 1.32, Contraband: 1.15 },
  },
];

/**
 * Ship upgrades
 */
export const UPGRADES = {
  cargo: {
    id: 'cargo',
    name: 'Expanded Hold',
    description: '+15 cargo capacity per level',
    maxLevel: 5,
    perLevel: 15,
    baseCost: 3000,
    costScale: 1.55,
  },
  fuel: {
    id: 'fuel',
    name: 'Extended Tanks',
    description: '+25 max fuel per level',
    maxLevel: 5,
    perLevel: 25,
    baseCost: 2500,
    costScale: 1.55,
  },
};

export const BASE_PRICES = {
  Earthport: {
    Food: 40,
    Ore: 90,
    Medicine: 70,
    Electronics: 120,
    'Fuel Cells': 50,
    'Luxury Goods': 180,
    Contraband: 130,
  },
  'Mars Exchange': {
    Food: 55,
    Ore: 45,
    Medicine: 95,
    Electronics: 100,
    'Fuel Cells': 55,
    'Luxury Goods': 160,
    Contraband: 125,
  },
  'Titan Yard': {
    Food: 70,
    Ore: 50,
    Medicine: 85,
    Electronics: 80,
    'Fuel Cells': 45,
    'Luxury Goods': 200,
    Contraband: 140,
  },
  'Nova Prime': {
    Food: 60,
    Ore: 85,
    Medicine: 65,
    Electronics: 70,
    'Fuel Cells': 60,
    'Luxury Goods': 140,
    Contraband: 150,
  },
  'Vega Station': {
    Food: 50,
    Ore: 100,
    Medicine: 75,
    Electronics: 95,
    'Fuel Cells': 55,
    'Luxury Goods': 110,
    Contraband: 175,
  },
  'Outer Rim Depot': {
    Food: 80,
    Ore: 70,
    Medicine: 110,
    Electronics: 130,
    'Fuel Cells': 35,
    'Luxury Goods': 150,
    Contraband: 85,
  },
};

export const DEMAND_TEMPLATES = {
  shortage: [
    '{planet} reports a critical shortage of {commodity}!',
    'Emergency demand: {commodity} prices spike on {planet}.',
    '{planet} fleets are bidding up {commodity}.',
  ],
  surplus: [
    '{planet} is flooded with surplus {commodity}.',
    'Overproduction dumps {commodity} prices on {planet}.',
    'Warehouses overflow with {commodity} at {planet}.',
  ],
};

export const DEFAULT_COMPANY_NAME = 'Stellar Haul Co.';

/** Achievement definitions — checked against run stats/state */
export const ACHIEVEMENTS = [
  {
    id: 'first_jump',
    name: 'Clear for Departure',
    desc: 'Complete your first jump',
    check: (s) => (s.stats?.jumps || 0) >= 1,
  },
  {
    id: 'ten_jumps',
    name: 'Lane Runner',
    desc: 'Complete 10 jumps',
    check: (s) => (s.stats?.jumps || 0) >= 10,
  },
  {
    id: 'fifty_jumps',
    name: 'Void Veteran',
    desc: 'Complete 50 jumps',
    check: (s) => (s.stats?.jumps || 0) >= 50,
  },
  {
    id: 'big_sale',
    name: 'Whale Deal',
    desc: 'Single sale of 5,000+ credits',
    check: (s) => (s.stats?.bestSale || 0) >= 5_000,
  },
  {
    id: 'mega_sale',
    name: 'Market Maker',
    desc: 'Single sale of 15,000+ credits',
    check: (s) => (s.stats?.bestSale || 0) >= 15_000,
  },
  {
    id: 'smuggler',
    name: 'Ghost Hauler',
    desc: 'Smuggle 20+ Contraband past patrols',
    check: (s) => (s.stats?.contrabandSmuggled || 0) >= 20,
  },
  {
    id: 'insured',
    name: 'Covered Captain',
    desc: 'File an insurance claim',
    check: (s) => (s.stats?.insuranceClaims || 0) >= 1,
  },
  {
    id: 'warehouser',
    name: 'Planetary Stash',
    desc: 'Deposit goods into a warehouse',
    check: (s) => (s.stats?.warehouseDeposits || 0) >= 1,
  },
  {
    id: 'debt_free',
    name: 'Clean Books',
    desc: 'Fully repay a loan at least once',
    check: (s) => (s.stats?.loansCleared || 0) >= 1,
  },
  {
    id: 'route_pilot',
    name: 'Charted Course',
    desc: 'Save a multi-stop trade route',
    check: (s) => (s.stats?.routesSaved || 0) >= 1,
  },
  {
    id: 'net_50k',
    name: 'Rising Merchant',
    desc: 'Reach 50,000 net worth mid-run',
    check: (s) => (s.stats?.maxNetWorth || 0) >= 50_000,
  },
  {
    id: 'net_100k',
    name: 'Baron of the Belt',
    desc: 'Reach 100,000 net worth mid-run',
    check: (s) => (s.stats?.maxNetWorth || 0) >= 100_000,
  },
  {
    id: 'quest_runner',
    name: 'Contract Ace',
    desc: 'Complete 5 board contracts',
    check: (s) => (s.stats?.questsCompleted || 0) >= 5,
  },
  {
    id: 'hull_smuggler',
    name: 'Shadow Registry',
    desc: 'Finish a jump in a Shadow Runner',
    check: (s) => s.hullId === 'smuggler' && (s.stats?.jumps || 0) >= 1,
  },
];

/** Cosmetic ship titles unlocked by achievement count / ids */
export const SHIP_TITLES = [
  { id: 'rookie', name: 'Rookie Hauler', minAchievements: 0 },
  { id: 'licensed', name: 'Licensed Trader', minAchievements: 3 },
  { id: 'sector', name: 'Sector Operator', minAchievements: 6 },
  { id: 'legend', name: 'Legend of the Lanes', minAchievements: 10 },
];

export function emptyStats() {
  return {
    jumps: 0,
    unitsBought: 0,
    unitsSold: 0,
    bestSale: 0,
    contrabandSmuggled: 0,
    customsCaught: 0,
    insuranceClaims: 0,
    warehouseDeposits: 0,
    loansCleared: 0,
    routesSaved: 0,
    maxNetWorth: STARTING_CREDITS,
    questsCompleted: 0,
    pirateEncounters: 0,
    crewHired: 0,
    stockTrades: 0,
    // Post-run analytics
    profitByCommodity: {},
    spendByCommodity: {},
    planetsVisited: {},
    stockSpent: 0,
    stockEarned: 0,
    crewWagePaid: 0,
    rivalWins: 0,
    startCredits: STARTING_CREDITS,
  };
}

export function emptyCrew() {
  return { navigator: false, broker: false, gunner: false };
}

export function emptyPortfolio() {
  return Object.fromEntries(
    Object.keys(STOCK_INDICES).map((id) => [id, 0])
  );
}

/**
 * Branching epilogue from end-of-run stats.
 */
export function getEpilogue(state, netWorth) {
  const debt = state.debt || 0;
  const rep = state.reputation ?? 55;
  const smuggled = state.stats?.contrabandSmuggled || 0;
  const caught = state.stats?.customsCaught || 0;
  const quests = state.stats?.questsCompleted || 0;

  if (debt >= 15_000 || (debt > 0 && netWorth < 5_000)) {
    return {
      id: 'debtors',
      title: 'Debtors’ Prison',
      text: 'Collectors seize the ship. You serve time filing manifests for the sector bank — a cautionary tale in every spacer bar.',
    };
  }
  if (rep < 25 && (smuggled >= 15 || caught >= 3)) {
    return {
      id: 'outlaw',
      title: 'Outlaw Exile',
      text: 'Warrants follow you past the Rim. You vanish into uncharted lanes — legend or liability, depending who tells it.',
    };
  }
  if (netWorth >= 200_000) {
    return {
      id: 'tycoon',
      title: 'Tycoon Estate',
      text: 'You retire to a glass spire above Earthport, funding academies for the next wave of haulers. The lanes remember your mark.',
    };
  }
  if (rep >= 85 && netWorth >= 50_000) {
    return {
      id: 'pillar',
      title: 'Pillar of the Sector',
      text: 'Chambers of commerce toast your name. Contracts seek you out. For once, the patrols salute as you dock.',
    };
  }
  if (quests >= 5) {
    return {
      id: 'courier',
      title: 'Contract Legend',
      text: 'Guild boards print your callsign in gold. Delivery after delivery, you proved reliability still sells.',
    };
  }
  if (netWorth >= 100_000) {
    return {
      id: 'baron',
      title: 'Space Baron’s Ledger',
      text: 'A fat ledger, a trusted hull, and enough leverage to dictate terms. Not quite immortal — but close enough.',
    };
  }
  if (netWorth < 20_000) {
    return {
      id: 'failed',
      title: 'Failed Trader',
      text: 'Empty holds and thinner hopes. You sell the transponder and take a desk job under artificial skies.',
    };
  }
  return {
    id: 'hauler',
    title: 'Honest Hauler',
    text: 'Another run in the books. Not a myth, not a ruin — just a captain who made the lanes pay enough to try again.',
  };
}

export function getHull(hullId) {
  return SHIP_HULLS[hullId] || SHIP_HULLS.freighter;
}

export function upgradeCost(upgradeKey, currentLevel) {
  const u = UPGRADES[upgradeKey];
  if (!u || currentLevel >= u.maxLevel) return null;
  return Math.round(u.baseCost * u.costScale ** currentLevel);
}

export function getRating(netWorth) {
  if (netWorth < 20_000) return 'Failed Trader';
  if (netWorth < 50_000) return 'Small Hauler';
  if (netWorth < 100_000) return 'Sector Merchant';
  if (netWorth < 200_000) return 'Space Baron';
  return 'Galactic Tycoon';
}

export function reputationLabel(rep) {
  if (rep < 25) return 'Outlaw';
  if (rep < 45) return 'Shady';
  if (rep < 65) return 'Trader';
  if (rep < 85) return 'Trusted';
  return 'Pillar';
}

export function getShipTitle(achievementIds) {
  const n = achievementIds?.length || 0;
  let title = SHIP_TITLES[0];
  for (const t of SHIP_TITLES) {
    if (n >= t.minAchievements) title = t;
  }
  return title;
}
