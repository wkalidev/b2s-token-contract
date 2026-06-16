/**
 * AgentClient — Stacks Quest Agent v3
 * QuestClient — Stacks Quest v2
 * Daily check-in + action log on Stacks mainnet
 */

const HIRO     = 'https://api.mainnet.hiro.so'
const DEPLOYER = 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N'
const AGENT_CONTRACT = `${DEPLOYER}.stacks-quest-agent-v3`
const QUEST_CONTRACT = `${DEPLOYER}.stacks-quest-v2`

const B2S_APP_URL = 'https://base2stacks-tracker.vercel.app'
const SQ_APP_URL  = 'https://stacks-quest-ten.vercel.app'

export interface AgentCard {
  name:        string
  description: string
  url:         string
  version:     string
  skills:      Array<{ id: string; name: string; description: string }>
  x402:        { supported: boolean }
  mcp:         string
  oasf:        { skills: string[]; domains: string[] }
}

export interface CheckinStreak {
  currentStreak: number
  bestStreak:    number
  lastCheckin:   number
  totalCheckins: number
}

export interface AgentGlobalStats {
  totalCheckins: number
  totalFees:     number
  currentDay:    number
}

export interface PlayerStats {
  totalPlayed:   number
  totalWon:      number
  bestStreak:    number
  currentStreak: number
  lastPlayed:    number
}

export interface DailyPuzzle {
  puzzleType: string
  tolerance:  number
}

async function hiroRead(contract: string, fn: string, args: string[] = [], sender = DEPLOYER): Promise<any> {
  const [addr, name] = contract.split('.')
  const res = await fetch(`${HIRO}/v2/contracts/call-read/${addr}/${name}/${fn}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ sender, arguments: args }),
  })
  return res.json() as Promise<any>
}

function parseUint(repr: any): number {
  return parseInt(String(repr ?? '0').replace('u', '') || '0')
}

function parseBool(repr: any): boolean {
  return repr === 'true'
}

export class AgentClient {
  async getStreak(address: string): Promise<CheckinStreak> {
    try {
      const res: any  = await hiroRead(AGENT_CONTRACT, 'get-streak', [], address)
      const data: any = res?.result?.value?.value || {}
      return {
        currentStreak: parseUint(data['current-streak']?.value),
        bestStreak:    parseUint(data['best-streak']?.value),
        lastCheckin:   parseUint(data['last-checkin']?.value),
        totalCheckins: parseUint(data['total-checkins']?.value),
      }
    } catch {
      return { currentStreak: 0, bestStreak: 0, lastCheckin: 0, totalCheckins: 0 }
    }
  }

  async hasCheckedInToday(address: string): Promise<boolean> {
    try {
      const res: any = await hiroRead(AGENT_CONTRACT, 'has-checked-in-today', [], address)
      return parseBool(res?.result?.value)
    } catch {
      return false
    }
  }

  async getGlobalStats(): Promise<AgentGlobalStats> {
    try {
      const res: any  = await hiroRead(AGENT_CONTRACT, 'get-global-stats')
      const data: any = res?.result?.value?.value || {}
      return {
        totalCheckins: parseUint(data['total-checkins']?.value),
        totalFees:     parseUint(data['total-fees']?.value),
        currentDay:    parseUint(data['current-day']?.value),
      }
    } catch {
      return { totalCheckins: 0, totalFees: 0, currentDay: 0 }
    }
  }

  async getCheckinFee(): Promise<number> {
    try {
      const res: any = await hiroRead(AGENT_CONTRACT, 'get-checkin-fee')
      return parseUint(res?.result?.value)
    } catch {
      return 1000
    }
  }

  async getCurrentDay(): Promise<number> {
    try {
      const res       = await fetch(`${HIRO}/v2/info`)
      const data: any = await res.json()
      return Math.floor(data.stacks_tip_height / 144)
    } catch {
      return 0
    }
  }

  getMCPEndpoint(): string {
    return `${B2S_APP_URL}/api/mcp`
  }

  getAgentCard(): AgentCard {
    return {
      name:        'B2S DeFi Agent',
      description: 'Non-custodial DeFi agent on Stacks mainnet. Swap STX/B2S/USDCx, stake for up to 37.5% APY, bridge Base to Stacks, vote on DAO proposals, trade 567 NFT badges.',
      url:         B2S_APP_URL,
      version:     '1.0.0',
      skills: [
        { id: 'swap',       name: 'Token Swap',         description: 'AMM swap STX/B2S/USDCx with 0.25% fee' },
        { id: 'stake',      name: 'Staking',            description: 'Stake $B2S for 12.5% to 37.5% APY' },
        { id: 'bridge',     name: 'Cross-chain Bridge', description: 'Bridge tokens between Base and Stacks' },
        { id: 'governance', name: 'DAO Voting',          description: 'Vote on proposals with staked $B2S' },
        { id: 'nft_badges', name: 'NFT Badges',         description: 'Buy/sell 567 unique NFT badges' },
        { id: 'portfolio',  name: 'Portfolio Tracking', description: 'Real-time balances and positions on Stacks' },
        { id: 'prediction', name: 'Prediction Market',  description: 'Bet on real-world outcomes' },
      ],
      x402: { supported: false },
      mcp:  `${B2S_APP_URL}/api/mcp`,
      oasf: {
        skills:  ['tool_interaction', 'analytical_skills', 'agent_orchestration'],
        domains: ['technology/blockchain', 'technology/blockchain/defi', 'finance_and_business/finance'],
      },
    }
  }
}

export class QuestClient {
  async getPlayerStats(address: string): Promise<PlayerStats> {
    try {
      const res: any  = await hiroRead(QUEST_CONTRACT, 'get-player-stats', [], address)
      const data: any = res?.result?.value?.value || {}
      return {
        totalPlayed:   parseUint(data['total-played']?.value),
        totalWon:      parseUint(data['total-won']?.value),
        bestStreak:    parseUint(data['best-streak']?.value),
        currentStreak: parseUint(data['current-streak']?.value),
        lastPlayed:    parseUint(data['last-played']?.value),
      }
    } catch {
      return { totalPlayed: 0, totalWon: 0, bestStreak: 0, currentStreak: 0, lastPlayed: 0 }
    }
  }

  async hasPlayedToday(address: string): Promise<boolean> {
    try {
      const res: any = await hiroRead(QUEST_CONTRACT, 'has-played-today', [], address)
      return parseBool(res?.result?.value)
    } catch {
      return false
    }
  }

  async getTodayPuzzle(): Promise<DailyPuzzle | null> {
    try {
      const res: any  = await hiroRead(QUEST_CONTRACT, 'get-today-puzzle')
      const data: any = res?.result?.value?.value || {}
      if (!data) return null
      return {
        puzzleType: data['puzzle-type']?.value || '',
        tolerance:  parseUint(data['tolerance']?.value),
      }
    } catch {
      return null
    }
  }

  async getGlobalStats(): Promise<{ totalGames: number; currentDay: number }> {
    try {
      const res: any  = await hiroRead(QUEST_CONTRACT, 'get-global-stats')
      const data: any = res?.result?.value?.value || {}
      return {
        totalGames: parseUint(data['total-games']?.value),
        currentDay: parseUint(data['current-day']?.value),
      }
    } catch {
      return { totalGames: 0, currentDay: 0 }
    }
  }

  getMCPEndpoint(): string {
    return `${SQ_APP_URL}/api/mcp`
  }

  getAgentCard(): AgentCard {
    return {
      name:        'Stacks Quest Agent',
      description: 'Daily blockchain puzzle game + non-custodial DeFi agent on Stacks Bitcoin L2. Swap via Velar/Alex, bridge Base to Stacks, daily check-in with streak rewards.',
      url:         SQ_APP_URL,
      version:     '0.2.0',
      skills: [
        { id: 'daily_puzzle', name: 'Daily Puzzle',      description: 'Guess real Stacks blockchain data, bet tokens, win reward pool' },
        { id: 'swap',         name: 'Token Swap',         description: 'Route swaps via Velar DEX (STX/B2S/USDCx) and Alex DEX (STX/sBTC/ALEX)' },
        { id: 'bridge',       name: 'Cross-chain Bridge', description: 'Bridge Base Network to Stacks via Base2Stacks' },
        { id: 'checkin',      name: 'Daily Check-in',     description: '0.001 STX fee, builds streak, bonus rewards at 7/30/100 days' },
        { id: 'portfolio',    name: 'Portfolio',           description: 'Real-time balances for STX, sBTC, $B2S, USDCx, ALEX, WELSH' },
        { id: 'staking_info', name: 'Staking Info',       description: 'Best staking options on Stacks with APY and risk data' },
      ],
      x402: { supported: false },
      mcp:  `${SQ_APP_URL}/api/mcp`,
      oasf: {
        skills:  ['tool_interaction', 'natural_language_processing', 'analytical_skills'],
        domains: ['technology/blockchain', 'technology/blockchain/defi', 'gaming'],
      },
    }
  }
}