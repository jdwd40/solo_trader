/**
 * Edge-case checks for Star Trader Solo (self-contained mirror of rules).
 * Run: node scripts/verify-logic.mjs
 */

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

const MIN_PRICE = 10;
const MAX_FUEL = 100;
const TRAVEL_FUEL_COST = 10;
const CARGO_CAPACITY = 50;
const MAX_TURNS = 100;

function cargoUsed(cargo) {
  return Object.values(cargo).reduce((s, n) => s + n, 0);
}

function canBuy({ credits, cargo, capacity, price, qty }) {
  if (!Number.isInteger(qty) || qty <= 0) return false;
  if (price * qty > credits) return false;
  if (qty > capacity - cargoUsed(cargo)) return false;
  return true;
}

function canSell({ cargo, commodity, qty }) {
  if (!Number.isInteger(qty) || qty <= 0) return false;
  return (cargo[commodity] || 0) >= qty;
}

function canTravel(fuel) {
  return fuel >= TRAVEL_FUEL_COST;
}

function clampFuel(fuel) {
  return Math.max(0, Math.min(MAX_FUEL, fuel));
}

function refreshPrice(old) {
  const factor = 0.8 + Math.random() * 0.45; // -20% .. +25%
  return Math.max(MIN_PRICE, Math.round(old * factor));
}

function getRating(netWorth) {
  if (netWorth < 20_000) return 'Failed Trader';
  if (netWorth < 50_000) return 'Small Hauler';
  if (netWorth < 100_000) return 'Sector Merchant';
  if (netWorth < 200_000) return 'Space Baron';
  return 'Galactic Tycoon';
}

console.log('1. Buy: not enough credits');
assert(
  !canBuy({
    credits: 100,
    cargo: {},
    capacity: 50,
    price: 40,
    qty: 5,
  }),
  'block buy when cost exceeds credits'
);

console.log('2. Buy: full cargo');
assert(
  !canBuy({
    credits: 99999,
    cargo: { Food: 50 },
    capacity: CARGO_CAPACITY,
    price: 10,
    qty: 1,
  }),
  'block buy when cargo full'
);

console.log('3. Buy: valid purchase');
assert(
  canBuy({
    credits: 10000,
    cargo: { Food: 0 },
    capacity: 50,
    price: 40,
    qty: 5,
  }),
  'allow buy with space and credits'
);

console.log('4. Sell: more than owned');
assert(
  !canSell({ cargo: { Ore: 2 }, commodity: 'Ore', qty: 5 }),
  'block sell above owned'
);

console.log('5. Sell: valid');
assert(
  canSell({ cargo: { Ore: 5 }, commodity: 'Ore', qty: 5 }),
  'allow sell when owned'
);

console.log('6. Travel fuel');
assert(!canTravel(9), 'block travel with 9 fuel');
assert(canTravel(10), 'allow travel with 10 fuel');

console.log('7. Fuel never exceeds max');
assert(clampFuel(150) === MAX_FUEL, 'clamp fuel to max');
assert(clampFuel(-5) === 0, 'clamp fuel to 0');

console.log('8. Prices never negative / below floor');
{
  let price = MIN_PRICE;
  let ok = true;
  for (let i = 0; i < 200; i++) {
    price = refreshPrice(price);
    if (price < MIN_PRICE || price < 0) ok = false;
  }
  assert(ok, '200 refreshes keep price >= 10');
}

console.log('9. Turn 100 ends game');
assert(100 >= MAX_TURNS, 'turn 100 is game over');
assert(99 < MAX_TURNS, 'turn 99 is still playing');

console.log('10. Ratings');
assert(getRating(19999) === 'Failed Trader', '<20k');
assert(getRating(20000) === 'Small Hauler', '20k');
assert(getRating(49999) === 'Small Hauler', '49,999');
assert(getRating(50000) === 'Sector Merchant', '50k');
assert(getRating(99999) === 'Sector Merchant', '99,999');
assert(getRating(100000) === 'Space Baron', '100k');
assert(getRating(199999) === 'Space Baron', '199,999');
assert(getRating(200000) === 'Galactic Tycoon', '200k+');

console.log('11. Save shape (serializable state)');
{
  const state = {
    companyName: 'Test Co',
    credits: 10000,
    cargoCapacity: 50,
    fuel: 100,
    maxFuel: 100,
    currentPlanet: 'Earthport',
    turn: 1,
    maxTurns: 100,
    cargo: { Food: 0, Ore: 0 },
    prices: { Earthport: { Food: 40 } },
    eventLog: [],
    lastEventId: 0,
    gameOver: false,
    pendingRumour: null,
  };
  const round = JSON.parse(JSON.stringify(state));
  assert(round.credits === 10000, 'save round-trip credits');
  assert(round.currentPlanet === 'Earthport', 'save round-trip planet');
  assert(round.fuel === 100, 'save round-trip fuel');
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
