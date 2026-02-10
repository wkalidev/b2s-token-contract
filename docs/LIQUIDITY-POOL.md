# 💧 B2S Liquidity Pool (AMM)

Automated Market Maker for swapping B2S ↔ STX tokens.

## 📋 Overview

The B2S Liquidity Pool is an Automated Market Maker (AMM) using the constant product formula (x * y = k). Users can swap between $B2S and STX tokens or provide liquidity to earn fees.

## 🎯 Key Features

### For Traders
- 🔄 Instant swaps between $B2S and STX
- 💰 No order books - always available
- 📊 Transparent pricing based on reserves
- 💸 Low 0.25% trading fee
- ⚡ Fast on-chain transactions

### For Liquidity Providers
- 💧 Earn 0.25% on all trades
- 🎁 Receive LP tokens representing your share
- 📈 Automatic compounding of fees
- 🔓 Withdraw anytime (no lock-up)
- 📊 Track your pool share and earnings

## 🔄 How to Swap

### Swap B2S for STX

1. Enter amount of $B2S to swap
2. See estimated STX you'll receive
3. Review rate and slippage
4. Click "Swap Tokens"
5. Confirm transaction in wallet

**Example:**
```
Input: 100 $B2S
Fee: 0.25 $B2S (0.25%)
Output: ~9.8 STX
Rate: 1 $B2S = 0.098 STX
```

### Swap STX for B2S

Same process, just flip the direction!

## 💧 How to Provide Liquidity

### Adding Liquidity

1. Enter amount of $B2S
2. Enter corresponding STX (maintains pool ratio)
3. Review LP tokens you'll receive
4. Click "Add Liquidity"
5. Receive LP tokens

**Example:**
```
Pool Ratio: 10 $B2S = 1 STX

You Add:
- 1,000 $B2S
- 100 STX

You Receive:
- ~316.22 LP tokens (√(1000 * 100))
- 10% of pool share
```

### Removing Liquidity

1. Enter LP tokens to redeem
2. See how much $B2S + STX you'll get
3. Click "Remove Liquidity"
4. Receive your tokens back

**You get back:**
- Your original deposit
- Plus your share of trading fees
- Proportional to your pool share

## 📊 AMM Formula

### Constant Product Formula
```
x * y = k

Where:
x = Reserve of $B2S
y = Reserve of STX
k = Constant product
```

### Price Calculation
```
Price of $B2S = STX Reserve / B2S Reserve

Example:
Reserve B2S: 100,000
Reserve STX: 10,000
Price: 10,000 / 100,000 = 0.1 STX per $B2S
```

### Swap Output Formula
```
Output = (Input × Output Reserve) / (Input Reserve + Input)

With 0.25% fee:
Actual Input = Input × 0.9975
```

### LP Token Minting

**First Liquidity:**
```
LP Tokens = √(B2S Amount × STX Amount)
```

**Subsequent Liquidity:**
```
LP Tokens = min(
  (B2S Amount × Total LP) / B2S Reserve,
  (STX Amount × Total LP) / STX Reserve
)
```

## 💰 Earning Fees

### How Fees Work

Every swap pays a **0.25% fee** that goes to liquidity providers.

**Example:**
```
Swap: 1,000 $B2S
Fee: 2.5 $B2S (0.25%)
Fee Distribution: Proportional to LP token holdings
```

### Your Earnings
```
Your Fee Earnings = (Your LP Tokens / Total LP Tokens) × Total Fees

Example:
Your LP: 100 tokens
Total LP: 1,000 tokens
Your Share: 10%

If total fees = 100 $B2S
Your earnings: 10 $B2S
```

## 📈 Impermanent Loss

### What is it?

When token prices change, the value of your LP position can be less than if you just held the tokens.

**Example:**
```
Initial: 
- 100 $B2S @ $1 = $100
- 10 STX @ $10 = $100
- Total: $200

Price doubles (B2S = $2):
- Pool rebalances to 70.7 $B2S + 14.14 STX
- LP Value: ~$282
- Just Holding: $300
- Impermanent Loss: $18 (6%)
```

### Mitigating IL

- ✅ Earn trading fees to offset loss
- ✅ Long-term holding (fees accumulate)
- ✅ Provide liquidity to stable pairs
- ✅ Monitor price divergence

## 🔐 Smart Contract Functions

### Public Functions

#### add-liquidity
```clarity
(add-liquidity 
  (amount-b2s uint)
  (amount-stx uint)
  (min-lp-tokens uint))
```

Add liquidity to the pool.

**Parameters:**
- `amount-b2s`: Amount of $B2S to add
- `amount-stx`: Amount of STX to add
- `min-lp-tokens`: Minimum LP tokens (slippage protection)

**Returns:** LP tokens minted

#### remove-liquidity
```clarity
(remove-liquidity
  (lp-tokens uint)
  (min-b2s uint)
  (min-stx uint))
```

Remove liquidity from pool.

**Returns:** {b2s: amount, stx: amount}

#### swap-b2s-for-stx
```clarity
(swap-b2s-for-stx
  (amount-b2s-in uint)
  (min-stx-out uint))
```

Swap $B2S for STX.

**Returns:** STX amount received

#### swap-stx-for-b2s
```clarity
(swap-stx-for-b2s
  (amount-stx-in uint)
  (min-b2s-out uint))
```

Swap STX for $B2S.

**Returns:** $B2S amount received

### Read-Only Functions

#### get-reserves
```clarity
(get-reserves)
```

Returns current pool reserves.

#### quote-swap-b2s-for-stx
```clarity
(quote-swap-b2s-for-stx (amount-b2s uint))
```

Get expected STX output (before executing swap).

#### get-price
```clarity
(get-price)
```

Get current $B2S price in STX.

#### get-pool-share
```clarity
(get-pool-share (provider principal))
```

Get user's pool share percentage (in basis points).

## 💡 Trading Tips

### For Swappers

1. **Check Slippage**: Large trades = higher slippage
2. **Split Trades**: Break large swaps into smaller ones
3. **Compare Prices**: Check other DEXes
4. **Gas Fees**: Factor in transaction costs
5. **Timing**: Swap when pool is deeper

### For Liquidity Providers

1. **Start Small**: Test with small amounts first
2. **Monitor IL**: Track price divergence
3. **Long-term**: Hold longer to earn more fees
4. **Balanced Deposits**: Maintain pool ratio
5. **Withdraw Strategy**: Don't panic on small IL

## 📊 Pool Statistics

Track key metrics:
- **TVL** (Total Value Locked)
- **24h Volume**
- **24h Fees Generated**
- **APR** (Annual Percentage Rate)
- **Your Pool Share**
- **Your Earnings**

## 🎮 Gamification

### LP Badges (Coming Soon)
- 💧 Droplet: $100+ liquidity
- 🌊 Wave: $1,000+ liquidity
- 🌊 Ocean: $10,000+ liquidity
- 💎 Diamond LP: $100,000+ liquidity

## 🔮 Future Features

### Phase 2
- [ ] Concentrated liquidity (Uniswap V3 style)
- [ ] Multiple fee tiers (0.05%, 0.25%, 1%)
- [ ] Limit orders
- [ ] Range orders
- [ ] LP position NFTs

### Phase 3
- [ ] Multi-hop routing
- [ ] Cross-chain swaps
- [ ] Flash swaps
- [ ] Lending integration
- [ ] Yield farming strategies

## ⚠️ Risks

### Smart Contract Risk
- Audited code reduces risk
- Open-source and verifiable
- Bug bounty program (coming soon)

### Impermanent Loss
- Price divergence causes IL
- Mitigated by trading fees
- More risk in volatile markets

### Liquidity Risk
- Low liquidity = high slippage
- Can't exit large positions instantly
- Pool depth affects price impact

## 🤝 Support

Need help?
- 📚 [Full Documentation](README.md)
- 🐛 [Report Issue](https://github.com/wkalidev/b2s-token-contract/issues)
- 💬 [Community](https://warpcast.com/willywarrior)
- 🐦 [Twitter](https://twitter.com/willycodexwar)

## 📜 License

MIT License

---

**Version**: 1.0.0  
**Trading Fee**: 0.25%  
**Status**: ✅ Live on Testnet  
**Formula**: Constant Product (x × y = k)