# 🏛️ B2S Governance System

Complete guide to the Base2Stacks decentralized governance system.

## 📋 Overview

The B2S Governance DAO allows token holders to vote on protocol decisions. Voting power is based on staked tokens (1 token = 1 vote).

## 🗳️ How Governance Works

### Creating Proposals

**Requirements:**
- Minimum stake: 10,000 $B2S tokens
- Connected wallet

**Process:**
1. Click "Create Proposal"
2. Enter title (max 100 characters)
3. Write description (max 500 characters)
4. Select category
5. Submit transaction

**Categories:**
- 🏦 **Economic** - APY changes, rewards, tokenomics
- 🔐 **Security** - Protocol security upgrades
- ⚙️ **Technical** - Feature additions, bug fixes
- 👥 **Community** - Community initiatives, partnerships

### Voting

**Requirements:**
- Must hold staked $B2S tokens
- One vote per proposal per address

**Process:**
1. Browse active proposals
2. Read proposal details
3. Click "Vote Yes" or "Vote No"
4. Confirm transaction
5. Vote is recorded on-chain

**Voting Power:**
```
Your Voting Power = Your Staked Amount
Example: 5,000 staked $B2S = 5,000 votes
```

### Proposal Lifecycle
```
┌──────────────┐
│   CREATED    │ Proposal submitted by user
└──────┬───────┘
       │
       v
┌──────────────┐
│    ACTIVE    │ 7 days voting period (1,008 blocks)
└──────┬───────┘
       │
       v
┌──────────────┐
│  VOTE ENDS   │ Counting votes
└──────┬───────┘
       │
       ├─────> PASSED (Yes > 51% + Quorum met)
       │
       └─────> FAILED (Yes ≤ 51% or No quorum)
              │
              v
       ┌──────────────┐
       │   EXECUTED   │ Changes implemented
       └──────────────┘
```

## 📊 Voting Rules

### Quorum
- **Required**: 20% of total staked tokens must vote
- **Example**: If 1M tokens staked, need 200K votes minimum

### Approval Threshold
- **Required**: 51% YES votes
- **Example**: If 300K vote, need 153K YES votes

### Voting Period
- **Duration**: 7 days (~1,008 blocks)
- **Start**: Immediately after creation
- **End**: Block height + 1,008

## 🎯 Proposal Examples

### Economic Proposal
```
Title: Increase APY to 15%
Description: Proposal to increase base staking APY from 12.5% 
to 15% to attract more liquidity and compete with other protocols.
Category: economic
```

### Security Proposal
```
Title: Implement Multi-sig Treasury
Description: Add 3-of-5 multi-signature requirement for treasury 
operations to improve security and decentralization.
Category: security
```

### Technical Proposal
```
Title: Add Cross-Chain Bridge to Polygon
Description: Integrate bridge functionality to Polygon network 
to expand ecosystem reach and user base.
Category: technical
```

### Community Proposal
```
Title: $50K Marketing Budget
Description: Allocate $50,000 in $B2S tokens for Q2 2026 
marketing campaign including influencer partnerships.
Category: community
```

## 📖 Smart Contract Functions

### Public Functions

#### create-proposal
```clarity
(create-proposal 
  (title (string-ascii 100))
  (description (string-utf8 500))
  (category (string-ascii 20)))
```

Creates a new governance proposal.

**Returns**: Proposal ID

**Errors**:
- `u407`: Insufficient stake (need 10,000 tokens)

#### cast-vote
```clarity
(cast-vote (proposal-id uint) (vote-yes bool))
```

Cast your vote on a proposal.

**Parameters**:
- `proposal-id`: ID of the proposal
- `vote-yes`: true for YES, false for NO

**Returns**: Success boolean

**Errors**:
- `u404`: Proposal not found
- `u405`: Already voted
- `u406`: Voting period ended
- `u407`: No voting power

#### execute-proposal
```clarity
(execute-proposal (proposal-id uint))
```

Execute a passed proposal (admin only).

**Returns**: Success boolean

**Errors**:
- `u404`: Proposal not found
- `u406`: Voting still active
- `u408`: Proposal didn't pass

### Read-Only Functions

#### get-proposal
```clarity
(get-proposal (proposal-id uint))
```

Get proposal details.

#### get-vote
```clarity
(get-vote (proposal-id uint) (voter principal))
```

Check how an address voted.

#### get-voting-power
```clarity
(get-voting-power (user principal))
```

Get user's voting power.

#### has-proposal-passed
```clarity
(has-proposal-passed (proposal-id uint))
```

Check if proposal met quorum and approval threshold.

#### get-proposal-status
```clarity
(get-proposal-status (proposal-id uint))
```

Returns: "active" | "passed" | "failed" | "executed"

#### get-voting-results
```clarity
(get-voting-results (proposal-id uint))
```

Get vote counts and percentages.

## 💡 Best Practices

### For Proposers

1. **Research First**: Check if similar proposals exist
2. **Be Clear**: Write detailed, specific descriptions
3. **Engage Community**: Discuss in Discord/Twitter first
4. **Right Category**: Choose appropriate category
5. **Timing**: Submit when community is active

### For Voters

1. **Read Carefully**: Understand proposal before voting
2. **Consider Impact**: Think about long-term effects
3. **Vote Responsibility**: Your vote affects everyone
4. **Participate**: Don't let proposals fail due to low turnout
5. **Stay Informed**: Follow discussion on social media

## 🔐 Security

### Proposal Validation
- ✅ Minimum stake requirement prevents spam
- ✅ Character limits prevent abuse
- ✅ On-chain voting prevents manipulation
- ✅ One vote per address prevents double voting

### Vote Security
- ✅ Votes are immutable once cast
- ✅ Voting power calculated from staked amount
- ✅ Results are transparent and verifiable
- ✅ No off-chain voting (fully decentralized)

## 📈 Governance Stats

Track governance metrics:
- Total proposals created
- Active proposals
- Pass/fail rate
- Average voter turnout
- Total votes cast
- Most active voters

## 🔮 Future Enhancements

### Planned Features
- [ ] Delegation system (vote on behalf)
- [ ] Proposal comments and discussion
- [ ] Proposal categories filtering
- [ ] Historical vote tracking
- [ ] Governance rewards for participation
- [ ] Snapshot integration
- [ ] Multi-choice proposals
- [ ] Time-weighted voting

### V2 Ideas
- Quadratic voting
- Conviction voting
- Emergency proposals (24h voting)
- Proposal deposits (refunded if passed)
- Automated execution for some proposals

## 🤝 Community

### Get Involved
- 💬 [Discord](https://discord.gg/b2s) (coming soon)
- 🐦 [Twitter](https://twitter.com/willycodexwar)
- 📢 [Farcaster](https://warpcast.com/willywarrior)

### Governance Discussion
Before creating proposals, discuss ideas with the community!

## 📜 License

MIT License

---

**Version**: 1.0.0  
**Last Updated**: February 8, 2026  
**Status**: ✅ Live on Testnet