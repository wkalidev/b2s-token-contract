# Staking Documentation

## Contracts
- b2s-staking-vault-v2: Advanced staking
- b2s-rewards-distributor-v3: Daily rewards

## APY Structure
| Lock Period | Multiplier | APY |
|-------------|------------|-----|
| No lock | 1x | 12.5% |
| 1 week | 1.5x | 18.75% |
| 2 weeks | 2x | 25% |
| 1 month | 3x | 37.5% |

## Compound Rewards
Call compound-rewards() to reinvest pending rewards.
Minimum threshold: 1 B2S (configurable by admin)
