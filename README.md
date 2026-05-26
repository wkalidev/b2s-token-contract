# @wkalidev/b2s-contracts

> $B2S Token — TypeScript SDK & Smart Contract addresses for **Base2Stacks DeFi** on Stacks mainnet.

[![npm version](https://img.shields.io/npm/v/@wkalidev/b2s-contracts?style=flat-square)](https://www.npmjs.com/package/@wkalidev/b2s-contracts)
[![npm downloads](https://img.shields.io/npm/dw/@wkalidev/b2s-contracts?style=flat-square)](https://www.npmjs.com/package/@wkalidev/b2s-contracts)
[![CI](https://github.com/wkalidev/b2s-token-contract/actions/workflows/ci-clarity.yml/badge.svg)](https://github.com/wkalidev/b2s-token-contract/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Stacks Mainnet](https://img.shields.io/badge/Network-Stacks%20Mainnet-5546FF?style=flat-square)](https://explorer.hiro.so)

---

## Why this SDK?

If you're building on **Stacks** and need to interact with $B2S DeFi contracts (token, staking, liquidity pool, governance, prediction markets), this SDK gives you:

- ✅ All mainnet **contract addresses** in one place — no more copy-pasting
- ✅ **TypeScript-first** — full type definitions included
- ✅ **Tree-shakeable** — ESM + CJS, import only what you need
- ✅ **Helper functions** — AMM swap math, APY calculator, address utils
- ✅ **Client classes** — `B2SClient`, `RewardsClient`, `OracleClient` ready to use

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
| `toolkit-math` | Math | Safe Clarity arithmetic |

---

## Quick Start

### Get contract addresses

```typescript
import { CONTRACTS, CONTRACT_NAMES, getContractId } from '@wkalidev/b2s-contracts/contracts'

// Full contract IDs
console.log(CONTRACTS['b2s-token-v4'])
// → 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-token-v4'

// Get any contract ID
const stakingId = getContractId(CONTRACT_NAMES.STAKING_VAULT)
// → 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-staking-vault-v2'
```

### Read $B2S balance

```typescript
import { B2SClient } from '@wkalidev/b2s-contracts'

const client = new B2SClient() // defaults to mainnet

const { formatted } = await client.getBalance('SP1ABC...XYZ')
console.log(`Balance: ${formatted} B2S`)
```

### AMM swap calculation

```typescript
import { calcSwapOutput, calcEffectiveApy, calcBridgeFee } from '@wkalidev/b2s-contracts/helpers'

// Calculate swap output (no RPC call needed)
const { amountOut, fee, priceImpact } = calcSwapOutput(
  1_000_000n,   // 1 B2S in
  50_000_000n,  // reserve B2S
  10_000_000n,  // reserve STX
)

// APY based on lock duration
calcEffectiveApy(2100) // → 37.5%
calcEffectiveApy(1050) // → 25%
calcEffectiveApy(0)    // → 12.5%

// Bridge fee breakdown
const { totalFeeMicro, toTreasury, toStakers } = calcBridgeFee(1_000_000_000n)
```

### Staking rewards

```typescript
import { RewardsClient } from '@wkalidev/b2s-contracts'

const rewards = new RewardsClient()

const pending = await rewards.getPendingRewards('SP1ABC...XYZ')
console.log(`Pending: ${pending.formatted} B2S`)

const info = await rewards.getStakerInfo('SP1ABC...XYZ')
console.log(`Staked: ${info?.stakedFormatted} B2S`)
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
  toMicroUnits,
  fromMicroUnits,
  formatB2S,
  blocksToDuration,
  isValidStacksAddress,
  truncateAddress,
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
  TokenBalance,
  StakePosition,
  PoolReserves,
  SwapQuote,
  BridgeTransaction,
  Proposal,
  ClaimRecord,
  PriceFeed,
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

### Clarity contracts

```bash
clarinet check   # type-check contracts
clarinet test    # run contract tests
```

---

## Live App

**[base2stacks-tracker.vercel.app](https://base2stacks-tracker.vercel.app)** — the full DeFi dApp using this SDK on Stacks mainnet.

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT — © 2026 [wkalidev](https://github.com/wkalidev)

---

**Built for [#StacksBuilderRewards](https://stacks.org) April 2026 🏆**