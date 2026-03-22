export interface TokenBalance {
  microBalance: bigint
  balance: number
  owner: string
  contract: string
}

export interface StakePosition {
  staker: string
  amountMicro: bigint
  amount: number
  lockBlocks: number
  startBlock: number
  unlockBlock: number
  multiplier: number
  estimatedApy: string
}

export interface PoolReserves {
  reserveX: bigint
  reserveY: bigint
  totalLiquidity: bigint
  price: number
}

export interface SwapQuote {
  amountIn: bigint
  amountOut: bigint
  priceImpact: number
  fee: bigint
}

export interface BridgeTransaction {
  txId: string
  fromChain: 'base' | 'stacks'
  toChain: 'base' | 'stacks'
  sender: string
  recipient: string
  amountMicro: bigint
  amountHuman: number
  feeCollected: bigint
  block: number
  status: 'pending' | 'confirmed' | 'failed'
}

export interface Proposal {
  id: number
  proposer: string
  title: string
  startBlock: number
  endBlock: number
  votesFor: bigint
  votesAgainst: bigint
  status: 'active' | 'passed' | 'failed' | 'executed'
}

export interface ClaimRecord {
  claimer: string
  lastClaimBlock: number
  totalClaimed: bigint
  canClaimNow: boolean
  blocksUntilNextClaim: number
}

export interface PriceFeed {
  pair: string
  price: number
  decimals: number
  lastUpdateBlock: number
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }
