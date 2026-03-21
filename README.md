# $B2S Token — Smart Contracts

[![Mainnet](https://img.shields.io/badge/Network-Stacks%20Mainnet-green)](https://explorer.hiro.so/?chain=mainnet)
[![Clarity](https://img.shields.io/badge/Language-Clarity%204-blue)](https://clarity-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)
[![Builder Rewards](https://img.shields.io/badge/Stacks-Builder%20Rewards%20March%202026-orange)](https://stacks.org)

Official Clarity smart contracts for the Base2Stacks DeFi ecosystem on Stacks mainnet.

**[https://base2stacks-tracker.vercel.app](https://base2stacks-tracker.vercel.app)**

---

## 📦 Deployed Contracts (Mainnet)

**Deployer**: `SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96`

| Contract | Explorer |
|---|---|
| `b2s-token` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token?chain=mainnet) |
| `b2s-token-v4` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token-v4?chain=mainnet) |
| `b2s-staking-vault-v2` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-staking-vault-v2?chain=mainnet) |
| `b2s-liquidity-pool-v5` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-liquidity-pool-v5?chain=mainnet) |
| `b2s-liquidity-pool-v6` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-liquidity-pool-v6?chain=mainnet) |
| `b2s-rewards-distributor-v3` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-rewards-distributor-v3?chain=mainnet) |
| `b2s-governance` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-governance?chain=mainnet) |
| `b2s-prediction-market` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-prediction-market?chain=mainnet) |
| `b2s-price-oracle` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-price-oracle?chain=mainnet) |
| `b2s-airdrop-v2` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-airdrop-v2?chain=mainnet) |
| `b2s-fee-router` | [View ↗](https://explorer.hiro.so/address/SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-fee-router?chain=mainnet) |

---

## 📋 Contract Descriptions

### `b2s-token` / `b2s-token-v4`
SIP-010 fungible token. 6 decimals (1 token = 1,000,000 micro-units). v4 adds correct token URI and Clarity 4 syntax.

### `b2s-staking-vault-v2`
Stake $B2S to earn **12.5% base APY** with lock multipliers:
- 525+ blocks (~3.5 days) → **1.5x**
- 1050+ blocks (~7 days) → **2x**
- 2100+ blocks (~14 days) → **3x** → up to **37.5% APY**

### `b2s-liquidity-pool-v5` / `v6`
AMM pool using constant product formula (x×y=k). 0.25% swap fee. v6 adds USDCx pairs.

### `b2s-rewards-distributor-v3`
Distributes daily rewards (5 $B2S per claim, 24h cooldown). Receives 50% of bridge fees from `b2s-fee-router`.

### `b2s-governance`
On-chain DAO. Requires 10,000 $B2S staked to create proposals. 7-day voting period, 20% quorum, 51% approval.

### `b2s-prediction-market`
AMM-style prediction markets. 5 categories. 2% platform fee on winnings.

### `b2s-price-oracle`
Clarity 4 price oracle for STX/USD feeds.

### `b2s-fee-router`
Records bridge transactions. Collects 0.3% fee → 50% treasury, 50% stakers.

### `b2s-airdrop-v2`
Token airdrop distribution contract.

---

## 🚀 Local Development

```bash
git clone https://github.com/wkalidev/b2s-token-contract.git
cd b2s-token-contract
clarinet check
clarinet test
```

---

## 📁 Structure

```
b2s-token-contract/
├── contracts/
│   ├── b2s-token.clar
│   ├── b2s-token-v4.clar
│   ├── b2s-staking-vault-v2.clar
│   ├── b2s-liquidity-pool-v5.clar
│   ├── b2s-liquidity-pool-v6.clar
│   ├── b2s-rewards-distributor-v3.clar
│   ├── b2s-governance.clar
│   ├── b2s-prediction-market.clar
│   ├── b2s-price-oracle.clar
│   ├── b2s-airdrop-v2.clar
│   └── b2s-fee-router.clar
├── tests/
└── Clarinet.toml
```

---

## 🔗 Related

| Repo | Description |
|---|---|
| [base2stacks-tracker](https://github.com/wkalidev/base2stacks-tracker) | Main frontend — [live app](https://base2stacks-tracker.vercel.app) |
| [b2s-analytics-dashboard](https://github.com/wkalidev/b2s-analytics-dashboard) | Analytics dashboard |
| [stacks-clarity-toolkit](https://github.com/wkalidev/stacks-clarity-toolkit) | Clarity dev toolkit |

---

## 📜 License

MIT — See [LICENSE](./LICENSE)

## 👨‍💻 Author

**wkalidev (zcodebase)** · [Twitter](https://twitter.com/willycodexwar) · [Farcaster](https://warpcast.com/willywarrior)

---

**Built for #StacksBuilderRewards March 2026 🏆**\n## Fee Router\n0.3% bridge fee — 50% treasury, 50% stakers
