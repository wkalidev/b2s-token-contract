# Price Oracle

## Contract
SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-price-oracle

## Data Sources
- CoinGecko API (off-chain)
- Hiro API for on-chain data

## Functions
- get-stx-price: Latest STX price
- get-b2s-price: B2S price derived from pool
- update-price: Admin price update

## Usage in contracts
(contract-call? ORACLE get-stx-price)
