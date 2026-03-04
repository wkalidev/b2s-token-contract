/**
 * b2s-sdk — Official SDK for the Base2Stacks ($B2S) ecosystem
 *
 * Covers all 4 smart contracts:
 * - b2s-token          → B2SClient
 * - b2s-governance     → GovernanceClient
 * - b2s-liquidity-pool → LiquidityClient
 * - b2s-rewards-distributor → RewardsClient
 *
 * @see https://github.com/wkalidev/b2s-token-contract
 * @see https://wkalidev-base2stacks-tracker.vercel.app
 */

// Clients
export { B2SClient } from "./token";
export { GovernanceClient } from "./governance";
export { LiquidityClient } from "./liquidity";
export { RewardsClient } from "./rewards";

// Constants
export {
  B2S_CONTRACT_ADDRESS,
  B2S_CONTRACT_NAME,
  B2S_DECIMALS,
  microToToken,
  tokenToMicro,
} from "./token";

export { GOVERNANCE_CONTRACT_NAME } from "./governance";
export { LIQUIDITY_CONTRACT_NAME } from "./liquidity";
export {
  REWARDS_CONTRACT_NAME,
  REWARDS_BASE_APY,
  REWARDS_BLOCKS_PER_DAY,
} from "./rewards";

// Types
export type { NetworkType, TxOptions } from "./token";
export type { Proposal, VotingResults } from "./governance";
export type { PoolReserves, LiquidityHistory } from "./liquidity";
export type { StakerInfo } from "./rewards";

/**
 * @deprecated - old monolithic client below, kept for reference only
 * JavaScript/TypeScript SDK for the Base2Stacks ($B2S) token smart contract
 * on the Stacks blockchain (Bitcoin L2)
 *
 * Contract: ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token
 * @see https://github.com/wkalidev/b2s-token-contract
 */

import {
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  uintCV,
  principalCV,
  cvToValue,
  PostConditionMode,
  type StacksTransaction,
} from "@stacks/transactions";
import {
  StacksMainnet,
  StacksTestnet,
  type StacksNetwork,
} from "@stacks/network";

// ─── Constants ────────────────────────────────────────────────────────────────

export const B2S_CONTRACT_ADDRESS =
  "ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96";
export const B2S_CONTRACT_NAME = "b2s-token";
export const B2S_DECIMALS = 6;
export const B2S_DAILY_REWARD = 5; // tokens per day
export const B2S_STAKING_APY = 12.5; // percent
export const B2S_COOLDOWN_HOURS = 24;

// ─── Types ────────────────────────────────────────────────────────────────────

export type NetworkType = "mainnet" | "testnet";

export interface B2SClientOptions {
  network?: NetworkType;
  contractAddress?: string;
  contractName?: string;
}

export interface BalanceResult {
  balance: bigint;
  /** Human-readable balance (balance / 10^6) */
  formatted: number;
}

export interface StakeInfo {
  stakedAmount: bigint;
  formatted: number;
}

export interface ClaimStatus {
  canClaim: boolean;
  lastClaimTime: bigint;
  nextClaimTime: bigint;
  hoursUntilNextClaim: number;
}

export interface TxOptions {
  senderKey: string;
  fee?: bigint;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert micro-units to human-readable token amount
 */
export function microToToken(microAmount: bigint | number): number {
  return Number(microAmount) / Math.pow(10, B2S_DECIMALS);
}

/**
 * Convert human-readable token amount to micro-units
 */
export function tokenToMicro(amount: number): bigint {
  return BigInt(Math.round(amount * Math.pow(10, B2S_DECIMALS)));
}

/**
 * Calculate estimated staking reward
 */
export function calculateStakingReward(
  stakedAmount: number,
  daysStaked: number
): number {
  const dailyRate = B2S_STAKING_APY / 100 / 365;
  return stakedAmount * dailyRate * daysStaked;
}

// ─── B2SClient ────────────────────────────────────────────────────────────────

/**
 * Main client for interacting with the $B2S smart contract
 *
 * @example
 * ```ts
 * import { B2SClient } from 'b2s-sdk';
 *
 * const client = new B2SClient({ network: 'mainnet' });
 * const balance = await client.getBalance('SP1ABC...');
 * console.log(`Balance: ${balance.formatted} $B2S`);
 * ```
 */
export class B2SClient {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(options: B2SClientOptions = {}) {
    const {
      network = "mainnet",
      contractAddress = B2S_CONTRACT_ADDRESS,
      contractName = B2S_CONTRACT_NAME,
    } = options;

    this.network =
      network === "mainnet" ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = contractAddress;
    this.contractName = contractName;
  }

  // ── Read-Only Functions ──────────────────────────────────────────────────

  /**
   * Get the $B2S token balance for a given Stacks address
   */
  async getBalance(userAddress: string): Promise<BalanceResult> {
    const result = await callReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "get-balance",
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    const raw = BigInt(cvToValue(result) ?? 0);
    return {
      balance: raw,
      formatted: microToToken(raw),
    };
  }

  /**
   * Get the staked amount for a given address
   */
  async getStakedAmount(userAddress: string): Promise<StakeInfo> {
    const result = await callReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "get-staked-amount",
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    const raw = BigInt(cvToValue(result) ?? 0);
    return {
      stakedAmount: raw,
      formatted: microToToken(raw),
    };
  }

  /**
   * Check claim status for a given address
   */
  async getClaimStatus(userAddress: string): Promise<ClaimStatus> {
    const result = await callReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "get-last-claim-time",
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    const lastClaim = BigInt(cvToValue(result) ?? 0);
    const nowMs = BigInt(Date.now());
    const cooldownMs = BigInt(B2S_COOLDOWN_HOURS * 60 * 60 * 1000);
    const nextClaim = lastClaim + cooldownMs;
    const canClaim = nowMs >= nextClaim;
    const msUntilNext = canClaim ? 0n : nextClaim - nowMs;

    return {
      canClaim,
      lastClaimTime: lastClaim,
      nextClaimTime: nextClaim,
      hoursUntilNextClaim: Number(msUntilNext) / (1000 * 60 * 60),
    };
  }

  // ── Write Functions ──────────────────────────────────────────────────────

  /**
   * Claim daily $B2S reward (5 tokens, 24h cooldown)
   */
  async claimDailyReward(options: TxOptions): Promise<StacksTransaction> {
    const tx = await makeContractCall({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "claim-daily-reward",
      functionArgs: [],
      senderKey: options.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: options.fee ?? 2000n,
    });

    await broadcastTransaction({ transaction: tx, network: this.network });
    return tx;
  }

  /**
   * Stake $B2S tokens to earn 12.5% APY
   * @param amount Amount in $B2S tokens (not micro-units)
   */
  async stake(amount: number, options: TxOptions): Promise<StacksTransaction> {
    const microAmount = tokenToMicro(amount);

    const tx = await makeContractCall({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "stake",
      functionArgs: [uintCV(microAmount)],
      senderKey: options.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: options.fee ?? 2000n,
    });

    await broadcastTransaction({ transaction: tx, network: this.network });
    return tx;
  }

  /**
   * Unstake $B2S tokens and claim staking rewards
   * @param amount Amount in $B2S tokens (not micro-units)
   */
  async unstake(
    amount: number,
    options: TxOptions
  ): Promise<StacksTransaction> {
    const microAmount = tokenToMicro(amount);

    const tx = await makeContractCall({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "unstake",
      functionArgs: [uintCV(microAmount)],
      senderKey: options.senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: options.fee ?? 2000n,
    });

    await broadcastTransaction({ transaction: tx, network: this.network });
    return tx;
  }
}

// ─── Default export ───────────────────────────────────────────────────────────

export default B2SClient;