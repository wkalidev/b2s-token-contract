# Price Oracle

## Contract
SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N.b2s-price-oracle

## Data Sources
- CoinGecko API (off-chain)
- Hiro API for on-chain data

## Functions
- get-stx-price: Latest STX price
- get-b2s-price: B2S price derived from pool
- update-price: Admin price update

## Usage in contracts
(contract-call? ORACLE get-stx-price)
