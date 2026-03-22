/**
 * @wkalidev/b2s-contracts
 * Official SDK for the Base2Stacks ($B2S) ecosystem on Stacks mainnet
 */

export { B2SClient, microToToken, tokenToMicro, B2S_CONTRACT_ADDRESS, B2S_DECIMALS } from "./token"
export { GovernanceClient } from "./governance"
export { LiquidityClient } from "./liquidity"
export { RewardsClient } from "./rewards"
export { OracleClient } from "./oracle"
export { FeeRouterClient } from "./fee-router"
export { DEPLOYER, CONTRACT_NAMES, CONTRACTS, getLockMultiplier, getContractId } from "./contracts"
export { toMicroUnits, fromMicroUnits, formatB2S, calcSwapOutput, calcEffectiveApy, calcBridgeFee, isValidStacksAddress, truncateAddress, blocksToDuration } from "./helpers"
export type { TokenBalance, StakePosition, PoolReserves, BridgeTransaction, Proposal, ClaimRecord, PriceFeed, Result } from "./types"
