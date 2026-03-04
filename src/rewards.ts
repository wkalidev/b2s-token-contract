/**
 * RewardsClient — B2S Rewards Distributor (b2s-rewards-distributor.clar)
 * Automatic reward distribution for stakers.
 *
 * Key rules from contract:
 * - Base APY: 12.5% (125000 / 1000000 precision)
 * - Rewards calculated per block (~144 blocks/day)
 * - Min stake: 1 token (1,000,000 micro-units)
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
  import { StacksMainnet, StacksTestnet, type StacksNetwork } from "@stacks/network";
  import { B2S_CONTRACT_ADDRESS, microToToken, tokenToMicro, type NetworkType, type TxOptions } from "./token";
  
  export const REWARDS_CONTRACT_NAME = "b2s-rewards-distributor";
  
  export const REWARDS_BASE_APY = 12.5;
  export const REWARDS_BLOCKS_PER_DAY = 144;
  
  export interface StakerInfo {
    stakedAmount: bigint;
    stakedFormatted: number;
    stakeTimestamp: bigint;
    lastRewardClaim: bigint;
    totalRewardsEarned: bigint;
    totalRewardsFormatted: number;
  }
  
  export class RewardsClient {
    private network: StacksNetwork;
    private contractAddress: string;
    private contractName: string;
  
    constructor(opts: { network?: NetworkType; contractAddress?: string } = {}) {
      this.network = (opts.network ?? "mainnet") === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      this.contractAddress = opts.contractAddress ?? B2S_CONTRACT_ADDRESS;
      this.contractName = REWARDS_CONTRACT_NAME;
    }
  
    private async readOnly(fn: string, args: any[], sender: string) {
      return callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: fn,
        functionArgs: args,
        network: this.network,
        senderAddress: sender,
      });
    }
  
    private async write(fn: string, args: any[], opts: TxOptions): Promise<StacksTransaction> {
      const tx = await makeContractCall({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: fn,
        functionArgs: args,
        senderKey: opts.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: opts.fee ?? 2000n,
      });
      await broadcastTransaction(tx, this.network);
      return tx;
    }
  
    /**
     * Stake $B2S tokens to start earning 12.5% APY.
     * @param amount - Amount in $B2S tokens
     */
    async stake(amount: number, opts: TxOptions) {
      return this.write("stake", [uintCV(tokenToMicro(amount))], opts);
    }
  
    /**
     * Unstake $B2S tokens.
     * Automatically claims pending rewards before unstaking.
     * @param amount - Amount in $B2S tokens
     */
    async unstake(amount: number, opts: TxOptions) {
      return this.write("unstake", [uintCV(tokenToMicro(amount))], opts);
    }
  
    /**
     * Claim pending staking rewards.
     * Rewards accumulate per block at 12.5% APY.
     */
    async claimRewards(opts: TxOptions) {
      return this.write("claim-rewards", [], opts);
    }
  
    /** Get full staker info for an address */
    async getStakerInfo(address: string): Promise<StakerInfo | null> {
      const r = await this.readOnly("get-staker-info", [principalCV(address)], address);
      const val = cvToValue(r) as any;
      if (!val) return null;
      return {
        stakedAmount: BigInt(val["staked-amount"]),
        stakedFormatted: microToToken(val["staked-amount"]),
        stakeTimestamp: BigInt(val["stake-timestamp"]),
        lastRewardClaim: BigInt(val["last-reward-claim"]),
        totalRewardsEarned: BigInt(val["total-rewards-earned"]),
        totalRewardsFormatted: microToToken(val["total-rewards-earned"]),
      };
    }
  
    /** Get pending (unclaimed) rewards for an address */
    async getPendingRewards(address: string) {
      const r = await this.readOnly("get-pending-rewards", [principalCV(address)], address);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { pending: raw, formatted: microToToken(raw) };
    }
  
    /**
     * Calculate estimated rewards for a given amount and duration.
     * Uses contract's formula: (amount * baseAPY * days) / (precision * 365)
     */
    async calculateAPY(amount: number, days: number, senderAddress: string) {
      const r = await this.readOnly("calculate-apy", [
        uintCV(tokenToMicro(amount)),
        uintCV(days),
      ], senderAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { reward: raw, formatted: microToToken(raw) };
    }
  
    /** Get total amount currently staked in the contract */
    async getTotalStaked(senderAddress: string) {
      const r = await this.readOnly("get-total-staked", [], senderAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { staked: raw, formatted: microToToken(raw) };
    }
  
    /** Get total rewards distributed to all stakers */
    async getTotalRewardsDistributed(senderAddress: string) {
      const r = await this.readOnly("get-total-rewards-distributed", [], senderAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { total: raw, formatted: microToToken(raw) };
    }
  }