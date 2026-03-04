/**
 * B2SClient — $B2S Fungible Token (b2s-token.clar)
 * Contract: ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token
 */

import {
    callReadOnlyFunction,
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    uintCV,
    principalCV,
    bufferCV,
    someCV,
    noneCV,
    cvToValue,
    PostConditionMode,
    type StacksTransaction,
  } from "@stacks/transactions";
  import { StacksMainnet, StacksTestnet, type StacksNetwork } from "@stacks/network";
  
  export const B2S_CONTRACT_ADDRESS = "ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96";
  export const B2S_CONTRACT_NAME = "b2s-token";
  export const B2S_DECIMALS = 6;
  
  export type NetworkType = "mainnet" | "testnet";
  export interface TxOptions { senderKey: string; fee?: bigint; }
  
  export function microToToken(amount: bigint | number): number {
    return Number(amount) / 1_000_000;
  }
  export function tokenToMicro(amount: number): bigint {
    return BigInt(Math.round(amount * 1_000_000));
  }
  
  export class B2SClient {
    protected network: StacksNetwork;
    protected contractAddress: string;
    protected contractName: string;
  
    constructor(opts: { network?: NetworkType; contractAddress?: string; contractName?: string } = {}) {
      this.network = (opts.network ?? "mainnet") === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      this.contractAddress = opts.contractAddress ?? B2S_CONTRACT_ADDRESS;
      this.contractName = opts.contractName ?? B2S_CONTRACT_NAME;
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
  
    /** Get $B2S balance for an address */
    async getBalance(address: string) {
      const r = await this.readOnly("get-balance", [principalCV(address)], address);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { balance: raw, formatted: microToToken(raw) };
    }
  
    /** Get total token supply */
    async getTotalSupply() {
      const r = await this.readOnly("get-total-supply", [], this.contractAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { supply: raw, formatted: microToToken(raw) };
    }
  
    /** Get tracker stats (total tracked txs, total rewards, last claim block) */
    async getTrackerStats(address: string) {
      const r = await this.readOnly("get-tracker-stats", [principalCV(address)], address);
      return cvToValue(r) as { total_tracked: bigint; total_rewards: bigint; last_claim: bigint };
    }
  
    /** Get staked balance for an address */
    async getStakedBalance(address: string) {
      const r = await this.readOnly("get-staked-balance", [principalCV(address)], address);
      const val = cvToValue(r) as { amount: bigint; staked_at: bigint };
      return { ...val, formatted: microToToken(val.amount) };
    }
  
    /** Get total staked amount */
    async getTotalStaked() {
      const r = await this.readOnly("get-total-staked", [], this.contractAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { staked: raw, formatted: microToToken(raw) };
    }
  
    /** Transfer $B2S tokens */
    async transfer(amount: number, sender: string, recipient: string, opts: TxOptions, memo?: Uint8Array) {
      return this.write("transfer", [
        uintCV(tokenToMicro(amount)),
        principalCV(sender),
        principalCV(recipient),
        memo ? someCV(bufferCV(memo)) : noneCV(),
      ], opts);
    }
  
    /** Claim 5 $B2S daily reward */
    async claimDailyReward(opts: TxOptions) {
      return this.write("claim-daily-reward", [], opts);
    }
  
    /** Track a bridge transaction */
    async trackBridgeTx(txHash: Uint8Array, fromChain: string, toChain: string, amount: number, opts: TxOptions) {
      return this.write("track-bridge-tx", [
        bufferCV(txHash),
        // string-ascii CVs
        { type: 13, data: fromChain } as any,
        { type: 13, data: toChain } as any,
        uintCV(tokenToMicro(amount)),
      ], opts);
    }
  
    /** Stake $B2S tokens */
    async stake(amount: number, opts: TxOptions) {
      return this.write("stake", [uintCV(tokenToMicro(amount))], opts);
    }
  
    /** Unstake $B2S tokens */
    async unstake(amount: number, opts: TxOptions) {
      return this.write("unstake", [uintCV(tokenToMicro(amount))], opts);
    }
  }