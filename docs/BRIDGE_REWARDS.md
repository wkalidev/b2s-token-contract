# Bridge Tracking Rewards

## How to earn bridge rewards
1. Detect a bridge transaction (Base → Stacks or vice versa)
2. Call track-bridge-tx() with the transaction data
3. Admin verifies the transaction on-chain
4. Receive 10 B2S tokens as reward

## track-bridge-tx parameters
- tx-hash: bytes32 hash of the bridge transaction
- from-chain: source chain ("BASE" or "STACKS")
- to-chain: destination chain
- amount: bridged amount in micro-units

## Verification
Owner calls verify-bridge-tx() to mint reward.
Only verified transactions earn rewards.
