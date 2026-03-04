/**
 * GovernanceClient — B2S DAO (b2s-governance.clar)
 * On-chain voting system for protocol decisions.
 *
 * Key rules from contract:
 * - Min stake to propose: 10,000 tokens
 * - Voting period: ~7 days (1008 blocks)
 * - Quorum: 20% of total voting power
 * - Approval threshold: 51%
 */

import {
    callReadOnlyFunction,
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    uintCV,
    principalCV,
    boolCV,
    cvToValue,
    PostConditionMode,
    type StacksTransaction,
  } from "@stacks/transactions";
  import { StacksMainnet, StacksTestnet, type StacksNetwork } from "@stacks/network";
  import { B2S_CONTRACT_ADDRESS, type NetworkType, type TxOptions } from "./token";
  
  export const GOVERNANCE_CONTRACT_NAME = "b2s-governance";
  
  export interface Proposal {
    proposer: string;
    title: string;
    description: string;
    startBlock: bigint;
    endBlock: bigint;
    yesVotes: bigint;
    noVotes: bigint;
    executed: boolean;
    category: string;
  }
  
  export interface VotingResults {
    yesVotes: bigint;
    noVotes: bigint;
    totalVotes: bigint;
    yesPercentage: bigint;
    noPercentage: bigint;
  }
  
  export class GovernanceClient {
    private network: StacksNetwork;
    private contractAddress: string;
    private contractName: string;
  
    constructor(opts: { network?: NetworkType; contractAddress?: string } = {}) {
      this.network = (opts.network ?? "mainnet") === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      this.contractAddress = opts.contractAddress ?? B2S_CONTRACT_ADDRESS;
      this.contractName = GOVERNANCE_CONTRACT_NAME;
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
      await broadcastTransaction({ transaction: tx, network: this.network });
      return tx;
    }
  
    /**
     * Create a new governance proposal.
     * Requires at least 10,000 $B2S staked.
     */
    async createProposal(
      title: string,
      description: string,
      category: string,
      opts: TxOptions
    ) {
      return this.write("create-proposal", [
        { type: 13, data: title } as any,       // string-ascii
        { type: 14, data: description } as any, // string-utf8
        { type: 13, data: category } as any,    // string-ascii
      ], opts);
    }
  
    /**
     * Cast a vote on an active proposal.
     * @param proposalId - ID of the proposal
     * @param voteYes - true = YES, false = NO
     */
    async castVote(proposalId: number, voteYes: boolean, opts: TxOptions) {
      return this.write("cast-vote", [uintCV(proposalId), boolCV(voteYes)], opts);
    }
  
    /**
     * Execute a proposal that has passed.
     * Can only be called after voting period ends.
     */
    async executeProposal(proposalId: number, opts: TxOptions) {
      return this.write("execute-proposal", [uintCV(proposalId)], opts);
    }
  
    /** Get full proposal details */
    async getProposal(proposalId: number, senderAddress: string): Promise<Proposal | null> {
      const r = await this.readOnly("get-proposal", [uintCV(proposalId)], senderAddress);
      const val = cvToValue(r);
      if (!val) return null;
      return {
        proposer: val.proposer,
        title: val.title,
        description: val.description,
        startBlock: BigInt(val["start-block"]),
        endBlock: BigInt(val["end-block"]),
        yesVotes: BigInt(val["yes-votes"]),
        noVotes: BigInt(val["no-votes"]),
        executed: val.executed,
        category: val.category,
      };
    }
  
    /** Get vote info for a specific voter on a proposal */
    async getVote(proposalId: number, voter: string) {
      const r = await this.readOnly("get-vote", [uintCV(proposalId), principalCV(voter)], voter);
      return cvToValue(r) as { vote: boolean; voting_power: bigint } | null;
    }
  
    /** Get voting power for an address (based on staked amount) */
    async getVotingPower(address: string) {
      const r = await this.readOnly("get-voting-power", [principalCV(address)], address);
      return BigInt(cvToValue(r) ?? 0);
    }
  
    /** Get total number of proposals */
    async getProposalCount(senderAddress: string) {
      const r = await this.readOnly("get-proposal-count", [], senderAddress);
      return Number(cvToValue(r) ?? 0);
    }
  
    /**
     * Get proposal status
     * @returns "active" | "passed" | "failed" | "executed"
     */
    async getProposalStatus(proposalId: number, senderAddress: string): Promise<string> {
      const r = await this.readOnly("get-proposal-status", [uintCV(proposalId)], senderAddress);
      return cvToValue(r) as string;
    }
  
    /** Get detailed voting results with percentages */
    async getVotingResults(proposalId: number, senderAddress: string): Promise<VotingResults> {
      const r = await this.readOnly("get-voting-results", [uintCV(proposalId)], senderAddress);
      const val = cvToValue(r) as any;
      return {
        yesVotes: BigInt(val["yes-votes"]),
        noVotes: BigInt(val["no-votes"]),
        totalVotes: BigInt(val["total-votes"]),
        yesPercentage: BigInt(val["yes-percentage"]),
        noPercentage: BigInt(val["no-percentage"]),
      };
    }
  
    /** Check if a proposal has passed (quorum + approval met) */
    async hasProposalPassed(proposalId: number, senderAddress: string): Promise<boolean> {
      const r = await this.readOnly("has-proposal-passed", [uintCV(proposalId)], senderAddress);
      return Boolean(cvToValue(r));
    }
  }