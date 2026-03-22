# @wkalidev/b2s-contracts

$B2S Token — Smart Contracts & TypeScript SDK for Base2Stacks DeFi on Stacks mainnet.

[![CI](https://github.com/wkalidev/b2s-token-contract/actions/workflows/ci-clarity.yml/badge.svg)](https://github.com/wkalidev/b2s-token-contract/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Deployer:** SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96
**Network:** Stacks Mainnet

## Installation
```bash
npm install @wkalidev/b2s-contracts
```

## Deployed Contracts

| Contract | Description |
|----------|-------------|
| b2s-token-v4 | SIP-010 token, 6 decimals |
| b2s-staking-vault-v2 | 12.5–37.5% APY staking |
| b2s-liquidity-pool-v6 | AMM pool, 0.25% fee |
| b2s-rewards-distributor-v3 | 5 B2S daily claim |
| b2s-governance | On-chain DAO |
| b2s-fee-router | Bridge fee collection |

## Usage
```typescript
import { CONTRACTS, CONTRACT_NAMES } from '@wkalidev/b2s-contracts/contracts'
import { calcEffectiveApy, calcBridgeFee } from '@wkalidev/b2s-contracts/helpers'

calcEffectiveApy(2100) // 37.5%
calcBridgeFee(1_000_000_000n) // { totalFeeMicro: 3_000_000n }
```

## Development
```bash
clarinet check && clarinet test
npm install && npm run build && npm test
```

## License

MIT — Built for #StacksBuilderRewards March 2026 🏆
