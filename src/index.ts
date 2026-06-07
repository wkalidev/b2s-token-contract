/**
 * @wkalidev/b2s-contracts v1.3.0
 * Official SDK for the Base2Stacks ($B2S) ecosystem on Stacks mainnet
 * Includes: Token, Staking, Liquidity, Governance, Oracle, Bridge, Agent, Quest
 */

// Core DeFi
export { B2SClient, microToToken, tokenToMicro, B2S_CONTRACT_ADDRESS, B2S_DECIMALS } from './token'
export { GovernanceClient } from './governance'
export { LiquidityClient } from './liquidity'
export { RewardsClient } from './rewards'
export { OracleClient } from './oracle'
export { FeeRouterClient } from './fee-router'

// Agent + Quest (new in v1.3.0)
export { AgentClient, QuestClient } from './agent'

// Contracts registry
export { DEPLOYER, CONTRACT_NAMES, CONTRACTS, getLockMultiplier, getContractId } from './contracts'

// Helpers
export {
  toMicroUnits, fromMicroUnits, formatB2S,
  calcSwapOutput, calcEffectiveApy, calcBridgeFee,
  isValidStacksAddress, truncateAddress, blocksToDuration,
} from './helpers'

// Types
export type {
  TokenBalance, StakePosition, PoolReserves, SwapQuote,
  BridgeTransaction, Proposal, ClaimRecord, PriceFeed,
  CheckinStreak, AgentGlobalStats, AgentAction,
  QuestAttempt, PlayerStats, DailyPuzzle,
  Result,
} from './types'