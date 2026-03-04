# $B2S Token — Base2Stacks DeFi Ecosystem

[![Deployed on Mainnet](https://img.shields.io/badge/Deployed-Mainnet-brightgreen)](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96?chain=mainnet)
[![Language](https://img.shields.io/badge/Language-Clarity-blue)](https://clarity-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![Stacks](https://img.shields.io/badge/Built%20on-Stacks-orange)](https://stacks.co)
[![Builder Rewards](https://img.shields.io/badge/Stacks-Builder%20Rewards%20March%202026-ff6b00)](https://talent.app/~/earn/stacks-builder-rewards-mar)

> A full DeFi suite built in Clarity on Stacks mainnet — fungible token, AMM liquidity pool, and staking rewards distributor.

---

## 🌐 Live on Mainnet

| Contract | Address | Explorer |
|---|---|---|
| `b2s-token` | `SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token?chain=mainnet) |
| `b2s-liquidity-pool-v5` | `SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-liquidity-pool-v5` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-liquidity-pool-v5?chain=mainnet) |
| `b2s-rewards-distributor-v3` | `SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-rewards-distributor-v3` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-rewards-distributor-v3?chain=mainnet) |

---

## 📋 Overview

**Base2Stacks** is a DeFi ecosystem built entirely in [Clarity](https://clarity-lang.org/) on the Stacks blockchain. It brings Bitcoin-secured decentralized finance through three production smart contracts:

- **$B2S Token** — SIP-010 fungible token with daily reward claims and built-in anti-spam protection
- **AMM Liquidity Pool** — Uniswap v2-style automated market maker for B2S ↔ STX swaps
- **Rewards Distributor** — Block-based staking with configurable APY and auto-compounding claims

All contracts are **immutable, trustless, and verified** on Stacks mainnet.

---

## 🏗️ Architecture

```
b2s-token-contract/
├── contracts/
│   ├── b2s-token.clar                  # SIP-010 fungible token
│   ├── b2s-liquidity-pool.clar         # AMM (x * y = k)
│   └── b2s-rewards-distributor.clar    # Staking & rewards
├── tests/                              # Clarinet test suite
├── docs/                               # Extended documentation
├── ARCHITECTURE.md                     # System design deep-dive
├── CONTRIBUTING.md
└── deploy.js                           # Mainnet deployment script
```

---

## 📦 Contracts

### 1. `b2s-token` — SIP-010 Fungible Token

The core token of the ecosystem, compliant with the [SIP-010](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md) standard.

**Key features:**
- Daily reward claims: 5 $B2S per user per day
- 24-hour anti-spam cooldown between claims
- Staking integration with APY tracking
- Standard SIP-010 `transfer`, `get-balance`, `get-total-supply`

**Token economics:**

| Parameter | Value |
|---|---|
| Decimals | 6 (1 token = 1,000,000 micro-units) |
| Initial supply | 0 (fair launch) |
| Daily rewards | 5 tokens / user / day |
| Max supply | Uncapped |

```clarity
;; Claim your daily B2S tokens
(contract-call? .b2s-token claim-daily-reward)

;; Check your balance
(contract-call? .b2s-token get-balance tx-sender)
```

---

### 2. `b2s-liquidity-pool` — AMM

A constant-product automated market maker (`x * y = k`) enabling trustless B2S ↔ STX swaps on-chain.

**Key features:**
- Uniswap v2 fee formula: **0.25%** per swap
- LP token minting proportional to liquidity contribution
- Slippage protection on all operations (`min-out` parameters)
- Minimum liquidity lock on first deposit (prevents price manipulation)
- Block-level volume tracking

**Functions:**

| Function | Description |
|---|---|
| `add-liquidity` | Deposit B2S + STX, receive LP tokens |
| `remove-liquidity` | Burn LP tokens, receive B2S + STX |
| `swap-b2s-for-stx` | Swap B2S → STX with slippage guard |
| `swap-stx-for-b2s` | Swap STX → B2S with slippage guard |
| `quote-swap-b2s-for-stx` | Read-only price quote |
| `quote-swap-stx-for-b2s` | Read-only price quote |
| `get-reserves` | Current pool reserves |
| `get-pool-share` | Provider share in basis points |

```clarity
;; Swap 1,000,000 micro-B2S for STX, accepting at least 900 micro-STX
(contract-call? .b2s-liquidity-pool-v5 swap-b2s-for-stx u1000000 u900)

;; Get current reserves
(contract-call? .b2s-liquidity-pool-v5 get-reserves)
```

**AMM formula:**
```
amount_out = (amount_in × (10000 - 25) × reserve_out)
           / (reserve_in × 10000 + amount_in × (10000 - 25))
```

---

### 3. `b2s-rewards-distributor` — Staking

Block-based staking contract that distributes B2S rewards proportionally over time.

**Key features:**
- **12.5% base APY** (adjustable by owner via governance)
- Rewards calculated per Stacks block (~10 min)
- Auto-claim on stake and unstake operations
- Min stake: 1 B2S token — Max stake: 1,000,000 B2S tokens
- Full history tracking per staker

**Functions:**

| Function | Description |
|---|---|
| `stake` | Lock B2S tokens and start earning |
| `unstake` | Withdraw tokens (auto-claims rewards) |
| `claim-rewards` | Claim pending rewards without unstaking |
| `set-base-apy` | Owner-only: update APY |
| `get-pending-rewards` | View claimable rewards |
| `estimate-rewards` | Simulate returns for N days |

```clarity
;; Stake 10 B2S tokens (10,000,000 micro-units)
(contract-call? .b2s-rewards-distributor-v3 stake u10000000)

;; Check pending rewards
(contract-call? .b2s-rewards-distributor-v3 get-pending-rewards tx-sender)

;; Claim rewards
(contract-call? .b2s-rewards-distributor-v3 claim-rewards)
```

**Reward formula:**
```
reward = staked × apy × blocks_elapsed / (1_000_000 × 52_560)
```
where `52,560 = 144 blocks/day × 365 days`

---

## 🔐 Security

- ✅ No admin backdoors — contracts are immutable once deployed
- ✅ Slippage protection on all swap and liquidity operations
- ✅ Overflow-safe arithmetic (Clarity's native checked math)
- ✅ `tx-sender` authentication on all state-changing calls
- ✅ Zero-amount guards on every entry point
- ✅ Minimum liquidity lock prevents first-deposit price manipulation
- ✅ Deployment keys managed via `.env` (never committed)

---

## 🚀 Local Development

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) >= 2.0
- Node.js >= 18
- A Stacks wallet (Leather or Xverse)

### Setup

```bash
git clone https://github.com/wkalidev/b2s-token-contract.git
cd b2s-token-contract
npm install

# Check contracts
clarinet check

# Run tests
clarinet test
```

### Deployment

```bash
# Copy and fill in your seed phrase
cp .env.example .env

# Deploy to mainnet
node deploy.js
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 🧪 Tests

Tests are written with [Clarinet](https://github.com/hirosystems/clarinet) and cover:

- Token minting, transfer, and balance checks
- AMM swap correctness and fee calculation
- Liquidity add/remove and LP token math
- Staking reward accrual and claim logic
- Edge cases: zero amounts, insufficient balance, slippage exceeded

```bash
clarinet test
```

---

## 📖 Documentation

| File | Description |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, contract interactions, data flow |
| [EXAMPLES.md](./EXAMPLES.md) | Real-world usage examples and call patterns |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |
| [docs/](./docs/) | Extended reference |

---

## 🔗 Links

- 🌐 [Base2Stacks Tracker App](https://wkalidev-base2stacks-tracker.vercel.app)
- 🔍 [Mainnet Explorer — SP93...ARQ96](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96?chain=mainnet)
- 🏆 [Stacks Builder Rewards — March 2026](https://talent.app/~/earn/stacks-builder-rewards-mar)
- 📚 [Clarity Language Docs](https://clarity-lang.org/)
- 🛠️ [Hiro Developer Docs](https://docs.hiro.so)

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📜 License

MIT License — see [LICENSE](./LICENSE)

---

**Built with ❤️ for the Stacks ecosystem — #StacksBuilderRewards 🏆**