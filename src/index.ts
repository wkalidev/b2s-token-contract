/**
 * b2s-sdk — Official SDK for the Base2Stacks ($B2S) ecosystem
 *
 * Covers all 4 smart contracts:
 * - b2s-token               → B2SClient
 * - b2s-governance          → GovernanceClient
 * - b2s-liquidity-pool      → LiquidityClient
 * - b2s-rewards-distributor → RewardsClient
 *
 * @see https://github.com/wkalidev/b2s-token-contract
 * @see https://wkalidev-base2stacks-tracker.vercel.app
 */

// ── Clients ──────────────────────────────────────────────────────────────────
export { B2SClient } from "./token";
export { GovernanceClient } from "./governance";
export { LiquidityClient } from "./liquidity";
export { RewardsClient } from "./rewards";

// ── Constants ────────────────────────────────────────────────────────────────
export {
  B2S_CONTRACT_ADDRESS,
  B2S_CONTRACT_NAME,
  B2S_DECIMALS,
  microToToken,
  tokenToMicro,
} from "./token";

export { GOVERNANCE_CONTRACT_NAME } from "./governance";
export { LIQUIDITY_CONTRACT_NAME } from "./liquidity";
export { REWARDS_CONTRACT_NAME, REWARDS_BASE_APY, REWARDS_BLOCKS_PER_DAY } from "./rewards";

// ── Types ────────────────────────────────────────────────────────────────────
export type { NetworkType, TxOptions } from "./token";
export type { Proposal, VotingResults } from "./governance";
export type { PoolReserves, LiquidityHistory } from "./liquidity";
export type { StakerInfo } from "./rewards";