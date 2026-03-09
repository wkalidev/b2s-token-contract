# $B2S Token Smart Contract

Official Clarity smart contracts for the Base2Stacks Bridge Tracker ecosystem — deployed on **Stacks Mainnet**.

[![Mainnet](https://img.shields.io/badge/Deployed-Stacks%20Mainnet-green)](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96?chain=mainnet)
[![Language](https://img.shields.io/badge/Language-Clarity-blue)](https://clarity-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@wkalidev/b2s-contracts)](https://www.npmjs.com/package/@wkalidev/b2s-contracts)
[![Builder Rewards](https://img.shields.io/badge/Stacks-Builder%20Rewards%202026-orange)](https://stacks.org)

## 📋 Overview

The $B2S token powers the Base2Stacks DeFi ecosystem with:

- Daily reward claims (5 $B2S per day)
- Staking vault with time-lock multipliers
- AMM Liquidity Pool with B2S ↔ STX swaps
- Rewards distribution system
- Prediction Market (Price / Stacks / Governance / Sport / Crisis Alert)
- Airdrop distribution system
- Price Oracle with TWAP
- DAO Governance

## 📦 Smart Contracts (Mainnet)

| Contract | Address | Clarity | Explorer |
|---|---|---|---|
| `b2s-token` | `SP936Y...ARQ96.b2s-token` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token?chain=mainnet) |
| `b2s-token-v4` | `SP936Y...ARQ96.b2s-token-v4` | v4 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token-v4?chain=mainnet) |
| `b2s-liquidity-pool-v5` | `SP936Y...ARQ96.b2s-liquidity-pool-v5` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-liquidity-pool-v5?chain=mainnet) |
| `b2s-liquidity-pool-v6` | `SP936Y...ARQ96.b2s-liquidity-pool-v6` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-liquidity-pool-v6?chain=mainnet) |
| `b2s-rewards-distributor-v3` | `SP936Y...ARQ96.b2s-rewards-distributor-v3` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-rewards-distributor-v3?chain=mainnet) |
| `b2s-prediction-market` | `SP936Y...ARQ96.b2s-prediction-market` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-prediction-market?chain=mainnet) |
| `b2s-governance` | `SP936Y...ARQ96.b2s-governance` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-governance?chain=mainnet) |
| `b2s-price-oracle` | `SP936Y...ARQ96.b2s-price-oracle` | v4 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-price-oracle?chain=mainnet) |
| `b2s-staking-vault-v2` | `SP936Y...ARQ96.b2s-staking-vault-v2` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-staking-vault-v2?chain=mainnet) |
| `b2s-airdrop-v2` | `SP936Y...ARQ96.b2s-airdrop-v2` | v2 | [View](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-airdrop-v2?chain=mainnet) |

## 🌐 Live App

**[https://base2stacks-tracker.vercel.app](https://base2stacks-tracker.vercel.app)**

## 📦 NPM Package

```bash
npm install @wkalidev/b2s-contracts
```

```javascript
import { CONTRACT_ADDRESSES, getContractId } from '@wkalidev/b2s-contracts';

// Get contract address
const tokenContract = getContractId('b2s-token');
// => 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token'

// All contracts
console.log(CONTRACT_ADDRESSES);
```

## 💡 Features

### 1. Daily Rewards
```clarity
(claim-daily-reward)
```
- Claims 5 $B2S tokens per day
- 24-hour cooldown between claims

### 2. Staking Vault (Time-Lock)
```clarity
(stake (amount uint) (lock-blocks uint))
(unstake)
```
- Lock multipliers: 1x (default), 1.5x (525 blocks), 2x (1050 blocks), 3x (2100 blocks)
- Funds locked until unlock block

### 3. AMM Liquidity Pool v6
```clarity
(add-b2s-stx (b uint) (s uint))
(swap-stx-for-b2s (in uint) (min-out uint))
(swap-b2s-for-stx (in uint) (min-out uint))
```
- Uniswap v2-style AMM (x*y=k)
- 0.25% swap fee
- B2S ↔ STX pairs

### 4. Prediction Market
```clarity
(create-market (question (string-utf8 256)) (category (string-ascii 32)) (deadline-blocks uint))
(place-bet (market-id uint) (vote bool) (amount uint))
(resolve-market (market-id uint) (outcome bool))
(claim-winnings (market-id uint))
```
- 5 categories: Price / Stacks / Governance / Sport / Crisis Alert
- 2% platform fee on winnings

### 5. Price Oracle
```clarity
(update-b2s-price (price uint))
(update-stx-price (price uint))
(get-twap-b2s)
```
- On-chain TWAP for B2S and STX
- Authorized feeder pattern

### 6. Airdrop
```clarity
(set-allocation (user principal) (amount uint))
(claim)
```
- Owner sets allocations
- One-time claim per address

### 7. Governance
```clarity
(create-proposal ...)
(vote ...)
```
- DAO governance with staking requirement

## 🏗️ Contract Structure

```
contracts/
├── b2s-token.clar                  # SIP-010 fungible token (Clarity 2)
├── b2s-token-v4.clar               # SIP-010 fungible token (Clarity 4)
├── b2s-liquidity-pool-v5.clar      # AMM pool v5
├── b2s-liquidity-pool-v6.clar      # AMM pool v6 (multi-pair)
├── b2s-rewards-distributor-v3.clar # Staking & rewards
├── b2s-prediction-market.clar      # Prediction market
├── b2s-governance.clar             # DAO governance
├── b2s-price-oracle.clar           # On-chain price oracle + TWAP
├── b2s-staking-vault-v2.clar       # Time-lock staking vault
└── b2s-airdrop-v2.clar             # Airdrop distributor
```

## 📊 Token Economics

| Metric | Value |
|---|---|
| Standard | SIP-010 |
| Symbol | $B2S |
| Decimals | 6 |
| Initial Supply | 400,000,000 B2S |
| Daily Rewards | 5 $B2S / user |
| Swap Fee | 0.25% |
| Prediction Fee | 2% |
| Token URI | [token.json](https://base2stacks-tracker.vercel.app/token.json) |

## 🔐 Security Features

- ✅ Balance overflow protection
- ✅ Anti-spam cooldown mechanism
- ✅ Input validation on all functions
- ✅ Principal-based authentication
- ✅ Slippage protection on swaps
- ✅ Time-lock staking with multipliers
- ✅ Emergency refund mechanism

## 🛠️ Local Development

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) 3.8+
- Node.js 18+
- Stacks wallet (Leather)

### Setup
```bash
git clone https://github.com/wkalidev/b2s-token-contract.git
cd b2s-token-contract
npm install
clarinet check
```

### Deploy (Mainnet)
```bash
# Add MNEMONIC to .env
node deploy.mjs
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📜 License

MIT License — See [LICENSE](./LICENSE)

## 🔗 Links

- 🌐 [Live App](https://base2stacks-tracker.vercel.app)
- 📊 [Explorer — Deployer Address](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96?chain=mainnet)
- 📦 [NPM Package](https://www.npmjs.com/package/@wkalidev/b2s-contracts)
- 🐦 [Twitter](https://twitter.com/willycodexwar)
- 🟪 [Farcaster](https://warpcast.com/willywarrior)
- 🏆 [Stacks Builder Rewards](https://stacks.org)

---

**Built with ❤️ by [Wkalidev (zcodebase)](https://github.com/wkalidev) — #StacksBuilderRewards March 2026 🏆**