# Auto-Compound Guide

## What is compounding?
Instead of claiming rewards, compound-rewards() adds
pending rewards directly to your staked balance.

## Benefits
- Higher effective APY through compounding
- Single transaction vs claim + restake

## Requirements
- Must have active vault position
- Pending rewards >= compound-threshold (default 1 B2S)

## How to compound
(contract-call?
  'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-staking-vault-v2
  compound-rewards)
