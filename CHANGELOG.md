# Changelog

## [@wkalidev/b2s-sdk 1.2.0] - 2026-06-22

### Fixed
- **Critical:** Deployer address corrected to `SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N` (v1.1.0 published with wrong address `SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96`)
- `exports` map now includes `"types"` condition for TypeScript consumers
- `main` field corrected to `./index.js` (was pointing to non-existent `dist/contracts.cjs`)

### Changed
- Removed stale contracts: `b2s-token` (superseded by v4), `b2s-liquidity-pool-v5` (superseded by v6), `b2s-airdrop-v2` (renamed)

### Added
- `b2s-staking-vault-v3` — latest staking vault
- `b2s-fee-router` — bridge fee collection, 0.3%
- `b2s-marketplace` — NFT badge marketplace, 2.5% fee
- `b2s-rewards-distributor` — daily reward distribution
- `stacks-quest-v2` — daily puzzle game
- `stacks-quest-agent-v3` — daily check-in with streak tracking
- `toolkit-math` — safe Clarity arithmetic
- `ContractName` type export in `index.d.ts`

## [1.1.0] - 2026-03-22

### Added
- GitHub Actions CI/CD pipeline
- Release automation workflow
- CODE_OF_CONDUCT.md
- SECURITY.md
- CONTRIBUTING.md
- FUNDING.yml

### Changed
- Updated all references from testnet (ST936) to mainnet (SP936)
- Fixed CONTRIBUTING.md links (branch main)
- Corrected npm scope from @b2s/ to @wkalidev/

## [1.0.0] - 2026-03-10

### Added
- Initial release
- Core smart contracts on Stacks mainnet
- MIT License
