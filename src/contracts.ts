export const DEPLOYER = 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N'

export const CONTRACT_NAMES = {
  B2S_TOKEN: 'b2s-token-v4',
  B2S_TOKEN_V4: 'b2s-token-v4',
  STAKING_VAULT: 'b2s-staking-vault-v2',
  LIQUIDITY_POOL: 'b2s-liquidity-pool-v6',
  REWARDS_DISTRIBUTOR: 'b2s-rewards-distributor',
  GOVERNANCE: 'b2s-governance',
  PREDICTION_MARKET: 'b2s-prediction-market',
  PRICE_ORACLE: 'b2s-price-oracle',
  AIRDROP: 'b2s-airdrop',
  FEE_ROUTER: 'b2s-fee-router',
} as const

export type ContractName = (typeof CONTRACT_NAMES)[keyof typeof CONTRACT_NAMES]

export function getContractId(name: ContractName): string {
  return `${DEPLOYER}.${name}`
}

export const CONTRACTS: Record<ContractName, string> = Object.fromEntries(
  Object.values(CONTRACT_NAMES).map((name) => [name, getContractId(name)])
) as Record<ContractName, string>

export const LOCK_MULTIPLIERS = [
  { minBlocks: 2100, multiplier: 3, label: '~14 days', apy: '37.5%' },
  { minBlocks: 1050, multiplier: 2, label: '~7 days', apy: '25%' },
  { minBlocks: 525, multiplier: 1.5, label: '~3.5 days', apy: '18.75%' },
  { minBlocks: 0, multiplier: 1, label: 'no lock', apy: '12.5%' },
] as const

export function getLockMultiplier(lockBlocks: number) {
  return LOCK_MULTIPLIERS.find((m) => lockBlocks >= m.minBlocks) ?? LOCK_MULTIPLIERS[3]
}
