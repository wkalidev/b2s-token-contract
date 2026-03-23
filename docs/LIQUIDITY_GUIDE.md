# Liquidity Provider Guide

## Add Liquidity
1. Approve B2S transfer
2. Call add-liquidity(amount-b2s, amount-stx, min-lp)
3. Receive LP tokens proportional to your share

## Remove Liquidity
1. Call remove-liquidity(lp-tokens, min-b2s, min-stx)
2. Receive B2S + STX proportional to LP tokens

## Earn Fees
0.25% of every swap goes to LP providers.
Fees accumulate in pool reserves automatically.

## Slippage Protection
Always set min-lp-tokens > 0 to protect against
price movements during your transaction.
