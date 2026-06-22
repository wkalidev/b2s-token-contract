# Staking Vault v2 Guide

## Contract
SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-staking-vault-v2

## Lock Periods & Multipliers
| Period   | Blocks | Multiplier | APY    |
|----------|--------|------------|--------|
| No lock  | 0      | 1x         | 12.5%  |
| 1 week   | 525    | 1.5x       | 18.75% |
| 2 weeks  | 1050   | 2x         | 25%    |
| 1 month  | 2100   | 3x         | 37.5%  |

## Auto-compound
Call compound-rewards() when pending >= threshold (1 B2S default)
