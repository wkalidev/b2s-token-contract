# Daily Rewards Guide

## Contract
SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token

## How it works
- Call claim-daily-reward() once per day
- Cooldown: 144 blocks (~24 hours)
- Reward: 5 B2S tokens per claim
- No staking required

## Tracking claims
(define-read-only (get-tracker-stats (tracker principal))
  (map-get? tracker-stats { tracker: tracker })
)

## Bridge tracking bonus
Track a bridge transaction to earn 10 B2S extra!
Call track-bridge-tx() with valid tx data.
