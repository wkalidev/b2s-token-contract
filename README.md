# @wkalidev/b2s-contracts

> $B2S Token — TypeScript SDK & Smart Contract addresses for **Base2Stacks DeFi** on Stacks mainnet.

[![npm version](https://img.shields.io/npm/v/@wkalidev/b2s-contracts?style=flat-square)](https://www.npmjs.com/package/@wkalidev/b2s-contracts)
[![npm downloads](https://img.shields.io/npm/dw/@wkalidev/b2s-contracts?style=flat-square)](https://www.npmjs.com/package/@wkalidev/b2s-contracts)
[![CI](https://github.com/wkalidev/b2s-token-contract/actions/workflows/ci-clarity.yml/badge.svg)](https://github.com/wkalidev/b2s-token-contract/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Stacks Mainnet](https://img.shields.io/badge/Network-Stacks%20Mainnet-5546FF?style=flat-square)](https://explorer.hiro.so)

---

## Why this SDK?

If you're building on **Stacks** and need to interact with $B2S DeFi contracts (token, staking, liquidity pool, governance, prediction markets, agent check-in), this SDK gives you:

- All mainnet **contract addresses** in one place — no more copy-pasting
- **TypeScript-first** — full type definitions included
- **Tree-shakeable** — ESM + CJS, import only what you need
- **Helper functions** — AMM swap math, APY calculator, address utils
- **Client classes** — `B2SClient`, `RewardsClient`, `OracleClient`, `AgentClient`, `QuestClient`

---

## Installation

```bash
npm install @wkalidev/b2s-contracts
# or
yarn add @wkalidev/b2s-contracts
# or
pnpm add @wkalidev/b2s-contracts
```

---

## Deployed Contracts (Stacks Mainnet)

**Deployer:** `SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N`

| Contract | Name | Description |
|----------|------|-------------|
| `b2s-token-v4` | $B2S Token | SIP-010 fungible token, 6 decimals |
| `b2s-staking-vault-v2` | Staking Vault | 12.5–37.5% APY with lock multipliers |
| `b2s-staking-vault-v3` | Staking Vault v3 | Latest staking vault |
| `b2s-liquidity-pool-v6` | AMM Pool | Constant product AMM, 0.25% fee |
| `b2s-rewards-distributor` | Rewards | 5 B2S daily claim |
| `b2s-governance` | DAO | On-chain proposals & voting |
| `b2s-fee-router` | Fee Router | Bridge fee collection & distribution |
| `b2s-prediction-market` | Prediction | AMM-style prediction markets |
| `b2s-price-oracle` | Oracle | On-chain price feeds |
| `b2s-airdrop` | Airdrop | Token airdrop distribution |
| `stacks-quest-v2` | Quest Game | Daily on-chain puzzle game |
| `stacks-quest-agent-v3` | Agent | Daily check-in + action log |
| `toolkit-math` | Math | Safe Clarity arithmetic |

---

## Quick Start

### Get contract addresses

```typescript
import { CONTRACTS, CONTRACT_NAMES, getContractId } from '@wkalidev/b2s-contracts/contracts'

console.log(CONTRACTS['b2s-token-v4'])
// → 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-token-v4'

const stakingId = getContractId(CONTRACT_NAMES.STAKING_VAULT)
// → 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-staking-vault-v2'
```

### Read $B2S balance

```typescript
import { B2SClient } from '@wkalidev/b2s-contracts'

const client = new B2SClient()
const { formatted } = await client.getBalance('SP1ABC...XYZ')
console.log(`Balance: ${formatted} B2S`)
```

### Agent — Daily check-in & streaks

```typescript
import { AgentClient } from '@wkalidev/b2s-contracts'

const agent = new AgentClient()

// Get user streak
const streak = await agent.getStreak('SP1ABC...XYZ')
console.log(`Streak: ${streak.currentStreak} days`)
console.log(`Best: ${streak.bestStreak} days`)

// Check if user checked in today
const checkedIn = await agent.hasCheckedInToday('SP1ABC...XYZ')
console.log(`Checked in today: ${checkedIn}`)

// Get check-in fee (in microSTX)
const fee = await agent.getCheckinFee()
console.log(`Fee: ${fee / 1_000_000} STX`)

// Global stats
const stats = await agent.getGlobalStats()
console.log(`Total check-ins: ${stats.totalCheckins}`)
console.log(`Total fees collected: ${stats.totalFees} microSTX`)
```

### Quest — Daily puzzle game

```typescript
import { QuestClient } from '@wkalidev/b2s-contracts'

const quest = new QuestClient()

// Get player stats
const stats = await quest.getPlayerStats('SP1ABC...XYZ')
console.log(`Games played: ${stats.totalPlayed}`)
console.log(`Games won: ${stats.totalWon}`)
console.log(`Current streak: ${stats.currentStreak}`)

// Check if player already played today
const played = await quest.hasPlayedToday('SP1ABC...XYZ')
console.log(`Played today: ${played}`)

// Get today's puzzle type
const puzzle = await quest.getTodayPuzzle()
console.log(`Today's puzzle: ${puzzle?.puzzleType}`)

// Global stats
const global = await quest.getGlobalStats()
console.log(`Total games: ${global.totalGames}`)
```

### AMM swap calculation

```typescript
import { calcSwapOutput, calcEffectiveApy, calcBridgeFee } from '@wkalidev/b2s-contracts/helpers'

const { amountOut, fee, priceImpact } = calcSwapOutput(
  1_000_000n,
  50_000_000n,
  10_000_000n,
)

calcEffectiveApy(2100) // → 37.5%
calcEffectiveApy(0)    // → 12.5%

const { totalFeeMicro, toTreasury, toStakers } = calcBridgeFee(1_000_000_000n)
```

### Staking rewards

```typescript
import { RewardsClient } from '@wkalidev/b2s-contracts'

const rewards = new RewardsClient()
const pending = await rewards.getPendingRewards('SP1ABC...XYZ')
console.log(`Pending: ${pending.formatted} B2S`)
```

### Price oracle

```typescript
import { OracleClient } from '@wkalidev/b2s-contracts'

const oracle = new OracleClient()
const { price } = await oracle.getPrice('STX-USD')
console.log(`STX price: $${price}`)
```

---

## Utilities

```typescript
import {
  toMicroUnits, fromMicroUnits, formatB2S,
  blocksToDuration, isValidStacksAddress, truncateAddress,
} from '@wkalidev/b2s-contracts/helpers'

formatB2S(5_000_000n)              // → '5.000000 B2S'
blocksToDuration(2100)             // → '~14d 0h'
isValidStacksAddress('SP1ABC...') // → true
truncateAddress('SP1V725...BQ5N') // → 'SP1V72...Q5N'
```

---

## TypeScript Types

```typescript
import type {
  TokenBalance, StakePosition, PoolReserves, SwapQuote,
  BridgeTransaction, Proposal, ClaimRecord, PriceFeed,
  CheckinStreak, AgentGlobalStats, AgentAction,
  QuestAttempt, PlayerStats, DailyPuzzle,
  Result,
} from '@wkalidev/b2s-contracts/types'
```

---

## Development

```bash
git clone https://github.com/wkalidev/b2s-token-contract.git
cd b2s-token-contract
npm install
npm run build
npm test
```

---

## Live Apps

- **[base2stacks-tracker.vercel.app](https://base2stacks-tracker.vercel.app)** — Full DeFi protocol
- **[stacks-quest-ten.vercel.app](https://stacks-quest-ten.vercel.app)** — Daily puzzle game
- **[stacks-quest-ten.vercel.app/agent](https://stacks-quest-ten.vercel.app/agent)** — Non-custodial AI agent

---

## Changelog

### v1.3.1
- Fixed `repository` field in package.json to point to correct repo
- Build cleanup and dependency consistency

### v1.3.0
- Added `AgentClient` — streak, check-in, global stats
- Added `QuestClient` — player stats, puzzle, game stats
- New types: `CheckinStreak`, `AgentGlobalStats`, `PlayerStats`, `DailyPuzzle`

### v1.2.3
- `B2SClient`, `RewardsClient`, `OracleClient`, `FeeRouterClient`
- AMM math helpers, APY calculator, bridge fee calculator

## Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT — © 2026 [wkalidev](https://github.com/wkalidev)

---

**Built for [#StacksBuilderRewards](https://stacks.org) 2026**