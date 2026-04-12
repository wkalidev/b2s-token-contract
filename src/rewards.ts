/**
 * RewardsClient — b2s-rewards-distributor-v3
 * Compatible with @stacks/transactions v7+
 */

import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  uintCV,
  principalCV,
  cvToValue,
  PostConditionMode,
  type StacksTransactionWire,
} from '@stacks/transactions'
import { B2S_CONTRACT_ADDRESS, microToToken, tokenToMicro, getNetwork, type NetworkType, type Network, type TxOptions } from './token'

export const REWARDS_CONTRACT_NAME  = 'b2s-rewards-distributor-v3'
export const REWARDS_BASE_APY       = 12.5
export const REWARDS_BLOCKS_PER_DAY = 144

export interface StakerInfo {
  stakedAmount:         bigint
  stakedFormatted:      number
  stakeTimestamp:       bigint
  lastRewardClaim:      bigint
  totalRewardsEarned:   bigint
  totalRewardsFormatted: number
}

export class RewardsClient {
  private network:         Network
  private contractAddress: string
  private contractName:    string

  constructor(opts: { network?: NetworkType; contractAddress?: string } = {}) {
    this.network         = getNetwork(opts.network ?? 'mainnet')
    this.contractAddress = opts.contractAddress ?? B2S_CONTRACT_ADDRESS
    this.contractName    = REWARDS_CONTRACT_NAME
  }

  private async readOnly(fn: string, args: unknown[], sender: string) {
    return fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName:    this.contractName,
      functionName:    fn,
      functionArgs:    args as any,
      network:         this.network,
      senderAddress:   sender,
    })
  }

  private async write(fn: string, args: unknown[], opts: TxOptions): Promise<StacksTransactionWire> {
    const tx = await makeContractCall({
      contractAddress:   this.contractAddress,
      contractName:      this.contractName,
      functionName:      fn,
      functionArgs:      args as any,
      senderKey:         opts.senderKey,
      network:           this.network,
      postConditionMode: PostConditionMode.Allow,
      fee:               opts.fee ?? 2000n,
    })
    await broadcastTransaction({ transaction: tx, network: this.network })
    return tx
  }

  /** Stake $B2S tokens to start earning 12.5% APY */
  async stake(amount: number, opts: TxOptions) {
    return this.write('stake', [uintCV(tokenToMicro(amount))], opts)
  }

  /** Unstake $B2S tokens — auto-claims pending rewards */
  async unstake(amount: number, opts: TxOptions) {
    return this.write('unstake', [uintCV(tokenToMicro(amount))], opts)
  }

  /** Claim pending staking rewards */
  async claimRewards(opts: TxOptions) {
    return this.write('claim-rewards', [], opts)
  }

  /** Get full staker info for an address */
  async getStakerInfo(address: string): Promise<StakerInfo | null> {
    const r   = await this.readOnly('get-staker-info', [principalCV(address)], address)
    const val = cvToValue(r) as any
    if (!val) return null
    return {
      stakedAmount:          BigInt(val['staked-amount']),
      stakedFormatted:       microToToken(val['staked-amount']),
      stakeTimestamp:        BigInt(val['stake-timestamp']),
      lastRewardClaim:       BigInt(val['last-reward-claim']),
      totalRewardsEarned:    BigInt(val['total-rewards-earned']),
      totalRewardsFormatted: microToToken(val['total-rewards-earned']),
    }
  }

  /** Get pending (unclaimed) rewards for an address */
  async getPendingRewards(address: string) {
    const r   = await this.readOnly('get-pending-rewards', [principalCV(address)], address)
    const raw = BigInt(cvToValue(r) ?? 0)
    return { pending: raw, formatted: microToToken(raw) }
  }

  /** Calculate estimated rewards for a given amount and duration */
  async calculateAPY(amount: number, days: number, senderAddress: string) {
    const r   = await this.readOnly('calculate-apy', [uintCV(tokenToMicro(amount)), uintCV(days)], senderAddress)
    const raw = BigInt(cvToValue(r) ?? 0)
    return { reward: raw, formatted: microToToken(raw) }
  }

  /** Get total amount currently staked */
  async getTotalStaked(senderAddress: string) {
    const r   = await this.readOnly('get-total-staked', [], senderAddress)
    const raw = BigInt(cvToValue(r) ?? 0)
    return { staked: raw, formatted: microToToken(raw) }
  }

  /** Get total rewards distributed to all stakers */
  async getTotalRewardsDistributed(senderAddress: string) {
    const r   = await this.readOnly('get-total-rewards-distributed', [], senderAddress)
    const raw = BigInt(cvToValue(r) ?? 0)
    return { total: raw, formatted: microToToken(raw) }
  }
}