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
  'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-staking-vault-v2
  compound-rewards)
