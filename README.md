# $B2S Token Smart Contract

Official Clarity smart contract for Base2Stacks Bridge Tracker token system.

[![Deployed](https://img.shields.io/badge/Deployed-Testnet-green)](https://explorer.stacks.co/txid/ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token?chain=testnet)
[![Language](https://img.shields.io/badge/Language-Clarity-blue)](https://clarity-lang.org/)

## 📋 Overview

The $B2S token powers the Base2Stacks ecosystem with:
- Daily reward claims (5 tokens per day)
- Staking mechanism (12.5% APY)
- Anti-spam protection (24h cooldown)
- Secure balance tracking

## 🔧 Contract Details

- **Contract Address**: `ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token`
- **Network**: Stacks Testnet
- **Language**: Clarity
- **Decimals**: 6 (1 token = 1,000,000 micro-units)

## 💡 Features

### 1. Daily Rewards
```clarity
(claim-daily-reward)
```
- Claims 5 $B2S tokens
- 24-hour cooldown between claims
- Automatic balance update

### 2. Staking System
```clarity
(stake (amount uint))
```
- Stake tokens to earn 12.5% APY
- Minimum: 1 $B2S token
- Lock period: Flexible

### 3. Balance Tracking
```clarity
(get-balance (user principal))
```
- Real-time balance queries
- Public read-only function
- Returns balance in micro-units

## 🏗️ Contract Structure
```
b2s-token/
├── balances map          # User balances
├── last-claim-time map   # Claim cooldown tracker
├── staked-amounts map    # Staking balances
└── total-supply var      # Total tokens minted
```

## 🔐 Security Features

- ✅ Balance overflow protection
- ✅ Anti-spam cooldown mechanism
- ✅ Input validation on all functions
- ✅ Principal-based authentication
- ✅ Read-only balance queries

## 📊 Token Economics

| Metric | Value |
|--------|-------|
| Initial Supply | 0 |
| Max Supply | Unlimited |
| Daily Rewards | 5 tokens/user |
| Staking APY | 12.5% |
| Decimals | 6 |

## 🧪 Testing

Run tests with Clarinet:
```bash
clarinet test
```

## 🚀 Deployment

Deployed on Stacks Testnet:
```bash
clarinet deploy --testnet
```

## 📖 Function Reference

### Public Functions

#### claim-daily-reward
```clarity
(define-public (claim-daily-reward))
```
Claims daily reward if 24h have passed since last claim.

**Returns**: `(response bool uint)`

**Errors**:
- `u103`: Too soon (24h cooldown)

#### stake
```clarity
(define-public (stake (amount uint)))
```
Stakes tokens to earn APY.

**Parameters**:
- `amount`: Amount to stake (in micro-units)

**Returns**: `(response bool uint)`

**Errors**:
- `u104`: Insufficient balance

#### unstake
```clarity
(define-public (unstake (amount uint)))
```
Unstakes tokens and claims rewards.

**Parameters**:
- `amount`: Amount to unstake

**Returns**: `(response bool uint)`

### Read-Only Functions

#### get-balance
```clarity
(define-read-only (get-balance (user principal)))
```
Returns user's token balance.

**Parameters**:
- `user`: Principal address

**Returns**: `(response uint uint)`

#### get-staked-amount
```clarity
(define-read-only (get-staked-amount (user principal)))
```
Returns user's staked amount.

## 🛠️ Development

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet)
- Stacks wallet (Leather/Xverse)

### Local Setup
```bash
git clone https://github.com/wkalidev/b2s-token-contract.git
cd b2s-token-contract
clarinet check
```

## 🤝 Contributing

See [CONTRIBUTING.md](../base2stacks-tracker/CONTRIBUTING.md)

## 📜 License

MIT License - See [LICENSE](LICENSE)

## 🔗 Links

- [Main Tracker App](https://wkalidev-base2stacks-tracker.vercel.app)
- [GitHub Organization](https://github.com/wkalidev)
- [Stacks Builder Rewards](https://stacks.org)

---

**Built for #StacksBuilderRewards 🏆**