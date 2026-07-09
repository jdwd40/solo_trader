# Star Trader Solo

A simple browser-based turn-based space commodity trading game.  
Run one company, travel between planets, buy low / sell high, manage fuel and cargo, and maximize net worth over 100 turns.

## Stack

- React + Vite
- Plain CSS
- localStorage save/load (no backend)

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## How to play

1. Check market prices on your current planet.
2. Buy commodities if you have credits and cargo space.
3. Travel to other planets (costs 10 fuel and 1 turn).
4. Sell where prices are higher.
5. Refuel using the local Fuel Cells price.
6. Survive random travel events.
7. Reach turn 100 with the highest net worth.

**Net worth** = credits + cargo valued at current planet prices.

## Features (v1.7)

- Full stack through v1.6 (slots, sound, rival, mobile nav, analytics, …)
- **Replay / verify codes** (STS1 checksum share strings, no server)
- **Tutorial mission track** with claimable cash rewards
- **Commodity & planet icons** for faster scanning on mobile
- **Auto-trade rules** (buy-if-cheap / sell-if-dear macros)
- **Difficulty presets** Easy / Normal / Hard (locked at launch)

## File structure

```
solo_trader/
├── index.html
├── package.json
├── vite.config.js
├── scripts/verify-logic.mjs
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── data/gameData.js
    ├── utils/gameLogic.js
    ├── hooks/useGameState.js
    └── components/
        ├── StatusBar.jsx
        ├── MarketTable.jsx
        ├── Sparkline.jsx
        ├── CargoPanel.jsx
        ├── TravelPanel.jsx
        ├── MarketIntel.jsx
        ├── ShipUpgrades.jsx
        ├── HighScoreBoard.jsx
        ├── EventLog.jsx
        ├── GameControls.jsx
        └── GameOverScreen.jsx
```

## License

Personal / educational project. Not affiliated with any commercial space-trading game.
