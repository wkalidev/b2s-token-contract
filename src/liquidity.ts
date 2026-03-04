/**
 * LiquidityClient — B2S AMM Pool (b2s-liquidity-pool.clar)
 * Swap B2S ↔ STX using constant product formula (x * y = k).
 *
 * Key rules from contract:
 * - Fee: 0.25% per swap (25/10000)
 * - LP tokens represent share of pool
 * - Pool share returned in basis points (1/10000)
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
  
  export const LIQUIDITY_CONTRACT_NAME = "b2s-liquidity-pool";
  
  export interface PoolReserves {
    b2s: bigint;
    stx: bigint;
    b2sFormatted: number;
    stxFormatted: number;
  }
  
  export interface LiquidityHistory {
    added: bigint;
    removed: bigint;
    rewards: bigint;
  }
  
  export class LiquidityClient {
    private network: StacksNetwork;
    private contractAddress: string;
    private contractName: string;
  
    constructor(opts: { network?: NetworkType; contractAddress?: string } = {}) {
      this.network = (opts.network ?? "mainnet") === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      this.contractAddress = opts.contractAddress ?? B2S_CONTRACT_ADDRESS;
      this.contractName = LIQUIDITY_CONTRACT_NAME;
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
     * Add liquidity to the B2S/STX pool.
     * @param amountB2s - Amount of $B2S to deposit
     * @param amountStx - Amount of STX to deposit
     * @param minLpTokens - Minimum LP tokens to receive (slippage protection)
     */
    async addLiquidity(amountB2s: number, amountStx: number, minLpTokens: number, opts: TxOptions) {
      return this.write("add-liquidity", [
        uintCV(tokenToMicro(amountB2s)),
        uintCV(tokenToMicro(amountStx)),
        uintCV(tokenToMicro(minLpTokens)),
      ], opts);
    }
  
    /**
     * Remove liquidity from the pool.
     * @param lpTokens - Amount of LP tokens to burn
     * @param minB2s - Minimum $B2S to receive (slippage protection)
     * @param minStx - Minimum STX to receive (slippage protection)
     */
    async removeLiquidity(lpTokens: number, minB2s: number, minStx: number, opts: TxOptions) {
      return this.write("remove-liquidity", [
        uintCV(tokenToMicro(lpTokens)),
        uintCV(tokenToMicro(minB2s)),
        uintCV(tokenToMicro(minStx)),
      ], opts);
    }
  
    /**
     * Swap $B2S for STX.
     * @param amountB2sIn - Amount of $B2S to sell
     * @param minStxOut - Minimum STX to receive (slippage protection)
     */
    async swapB2sForStx(amountB2sIn: number, minStxOut: number, opts: TxOptions) {
      return this.write("swap-b2s-for-stx", [
        uintCV(tokenToMicro(amountB2sIn)),
        uintCV(tokenToMicro(minStxOut)),
      ], opts);
    }
  
    /**
     * Swap STX for $B2S.
     * @param amountStxIn - Amount of STX to sell
     * @param minB2sOut - Minimum $B2S to receive (slippage protection)
     */
    async swapStxForB2s(amountStxIn: number, minB2sOut: number, opts: TxOptions) {
      return this.write("swap-stx-for-b2s", [
        uintCV(tokenToMicro(amountStxIn)),
        uintCV(tokenToMicro(minB2sOut)),
      ], opts);
    }
  
    /** Get current pool reserves */
    async getReserves(senderAddress: string): Promise<PoolReserves> {
      const r = await this.readOnly("get-reserves", [], senderAddress);
      const val = cvToValue(r) as { b2s: bigint; stx: bigint };
      return {
        b2s: BigInt(val.b2s),
        stx: BigInt(val.stx),
        b2sFormatted: microToToken(val.b2s),
        stxFormatted: microToToken(val.stx),
      };
    }
  
    /** Get LP token balance for a provider */
    async getLPBalance(address: string) {
      const r = await this.readOnly("get-lp-balance", [principalCV(address)], address);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { balance: raw, formatted: microToToken(raw) };
    }
  
    /** Get total LP tokens in circulation */
    async getTotalLPTokens(senderAddress: string) {
      const r = await this.readOnly("get-total-lp-tokens", [], senderAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { total: raw, formatted: microToToken(raw) };
    }
  
    /**
     * Quote how much STX you'd get for a given $B2S amount (no tx needed).
     */
    async quoteB2sForStx(amountB2s: number, senderAddress: string) {
      const r = await this.readOnly("quote-swap-b2s-for-stx", [uintCV(tokenToMicro(amountB2s))], senderAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { stxOut: raw, formatted: microToToken(raw) };
    }
  
    /**
     * Quote how much $B2S you'd get for a given STX amount (no tx needed).
     */
    async quoteStxForB2s(amountStx: number, senderAddress: string) {
      const r = await this.readOnly("quote-swap-stx-for-b2s", [uintCV(tokenToMicro(amountStx))], senderAddress);
      const raw = BigInt(cvToValue(r) ?? 0);
      return { b2sOut: raw, formatted: microToToken(raw) };
    }
  
    /** Get current price: $B2S per STX */
    async getPrice(senderAddress: string) {
      const r = await this.readOnly("get-price", [], senderAddress);
      return BigInt(cvToValue(r) ?? 0);
    }
  
    /** Get total swap volume */
    async getTotalVolume(senderAddress: string) {
      const r = await this.readOnly("get-total-volume", [], senderAddress);
      const val = cvToValue(r) as { b2s: bigint; stx: bigint };
      return {
        b2s: BigInt(val.b2s),
        stx: BigInt(val.stx),
        b2sFormatted: microToToken(val.b2s),
        stxFormatted: microToToken(val.stx),
      };
    }
  
    /**
     * Get provider's share of the pool in basis points (e.g. 500 = 5%).
     */
    async getPoolShare(address: string) {
      const r = await this.readOnly("get-pool-share", [principalCV(address)], address);
      const bps = Number(cvToValue(r) ?? 0);
      return { basisPoints: bps, percentage: bps / 100 };
    }
  
    /** Get liquidity history for a provider */
    async getLiquidityHistory(address: string): Promise<LiquidityHistory | null> {
      const r = await this.readOnly("get-liquidity-history", [principalCV(address)], address);
      const val = cvToValue(r);
      if (!val) return null;
      return {
        added: BigInt((val as any).added),
        removed: BigInt((val as any).removed),
        rewards: BigInt((val as any).rewards),
      };
    }
  }