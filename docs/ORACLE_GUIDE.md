# Price Oracle Guide

## Why price oracles?
Smart contracts cannot access external data directly.
Price oracles bring off-chain prices on-chain.

## B2S Oracle
Uses pool reserves to derive B2S/STX price:
price = reserve_stx / reserve_b2s

## STX Oracle
Admin-updated STX/USD price from CoinGecko.
Update frequency: every 144 blocks (~1 day)

## Usage
(contract-call? ORACLE get-stx-price) ;; returns uint (USD * 10^6)
(contract-call? ORACLE get-b2s-price) ;; returns uint (STX * 10^6)
