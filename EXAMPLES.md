# Usage Examples

## JavaScript Integration

### Setup
```javascript
import { openContractCall } from '@stacks/connect';
import { uintCV, principalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();
const contractAddress = 'ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96';
const contractName = 'b2s-token';
```

### Claim Daily Reward
```javascript
async function claimReward() {
  const options = {
    network,
    contractAddress,
    contractName,
    functionName: 'claim-daily-reward',
    functionArgs: [],
    onFinish: (data) => {
      console.log('Claim successful!', data.txId);
    }
  };
  
  await openContractCall(options);
}
```

### Stake Tokens
```javascript
async function stakeTokens(amount) {
  // Convert to micro-units (6 decimals)
  const microAmount = amount * 1000000;
  
  const options = {
    network,
    contractAddress,
    contractName,
    functionName: 'stake',
    functionArgs: [uintCV(microAmount)],
    onFinish: (data) => {
      console.log('Stake successful!', data.txId);
    }
  };
  
  await openContractCall(options);
}

// Stake 10 tokens
stakeTokens(10);
```

### Get Balance
```javascript
import { callReadOnlyFunction } from '@stacks/transactions';

async function getBalance(userAddress) {
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-balance',
    functionArgs: [principalCV(userAddress)],
    senderAddress: userAddress
  });
  
  // Convert from micro-units
  const balance = result.value / 1000000;
  console.log(`Balance: ${balance} $B2S`);
  return balance;
}
```

## React Hook Example
```javascript
import { useConnect } from '@stacks/connect-react';
import { useState, useEffect } from 'react';

function useB2SBalance() {
  const { address } = useConnect();
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    async function fetchBalance() {
      if (!address) return;
      
      const result = await callReadOnlyFunction({
        network: new StacksTestnet(),
        contractAddress: 'ST936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96',
        contractName: 'b2s-token',
        functionName: 'get-balance',
        functionArgs: [principalCV(address)],
        senderAddress: address
      });
      
      setBalance(result.value / 1000000);
    }
    
    fetchBalance();
  }, [address]);
  
  return balance;
}
```

## CLI Examples

### Using Clarinet
```bash
# Check balance
clarinet console
> (contract-call? .b2s-token get-balance 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

# Claim reward
> (contract-call? .b2s-token claim-daily-reward)

# Stake 5 tokens
> (contract-call? .b2s-token stake u5000000)
```

---

**More examples at**: [base2stacks-tracker](https://github.com/wkalidev/base2stacks-tracker)