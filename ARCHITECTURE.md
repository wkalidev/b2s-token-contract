# Contract Architecture

## Overview

The B2S Token contract is built using Clarity, Stacks' smart contract language, with emphasis on security and simplicity.

## Data Structures

### Maps

#### balances
```clarity
(define-map balances principal uint)
```
Stores user token balances in micro-units.

#### last-claim-time
```clarity
(define-map last-claim-time principal uint)
```
Tracks block height of last claim for 24h cooldown.

#### staked-amounts
```clarity
(define-map staked-amounts principal uint)
```
Stores staked token amounts per user.

### Variables

#### total-supply
```clarity
(define-data-var total-supply uint u0)
```
Tracks total tokens in circulation.

## Function Flow

### Claim Daily Reward
```
User calls claim-daily-reward()
    ↓
Check last-claim-time
    ↓
If > 144 blocks (24h)
    ↓
Mint 5 tokens
    ↓
Update balance
    ↓
Update last-claim-time
    ↓
Return success
```

### Stake Tokens
```
User calls stake(amount)
    ↓
Verify balance >= amount
    ↓
Transfer to staking pool
    ↓
Update staked-amounts
    ↓
Start earning APY
    ↓
Return success
```

## Security Considerations

### 1. Overflow Protection
All arithmetic uses safe math operations.

### 2. Cooldown Mechanism
24-hour claim limit prevents spam.

### 3. Balance Validation
All transfers verify sufficient balance.

### 4. Principal Authentication
Functions use `tx-sender` for security.

## Gas Optimization

- Minimal storage reads
- Efficient map lookups
- Optimized function calls
- Read-only functions for queries

## Upgrade Path

Current version: v1.0.0
- No upgrade mechanism (immutable)
- Future: Deploy new version if needed

## Testing Strategy

1. Unit tests for each function
2. Integration tests for flows
3. Edge case coverage
4. Gas cost analysis

---

**Version**: 1.0.0  
**Last Updated**: Feb 8, 2026