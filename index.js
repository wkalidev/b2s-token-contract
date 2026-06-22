const DEPLOYER = 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N';

const CONTRACT_ADDRESSES = {
  'b2s-token': `${DEPLOYER}.b2s-token`,
  'b2s-token-v4': `${DEPLOYER}.b2s-token-v4`,
  'b2s-liquidity-pool-v5': `${DEPLOYER}.b2s-liquidity-pool-v5`,
  'b2s-liquidity-pool-v6': `${DEPLOYER}.b2s-liquidity-pool-v6`,
  'b2s-rewards-distributor-v3': `${DEPLOYER}.b2s-rewards-distributor-v3`,
  'b2s-prediction-market': `${DEPLOYER}.b2s-prediction-market`,
  'b2s-governance': `${DEPLOYER}.b2s-governance`,
  'b2s-price-oracle': `${DEPLOYER}.b2s-price-oracle`,
  'b2s-staking-vault-v2': `${DEPLOYER}.b2s-staking-vault-v2`,
  'b2s-airdrop-v2': `${DEPLOYER}.b2s-airdrop-v2`,
};

const DEPLOYER_ADDRESS = DEPLOYER;

function getContractId(name) {
  const addr = CONTRACT_ADDRESSES[name];
  if (!addr) throw new Error(`Unknown contract: ${name}`);
  return addr;
}

function getContractAddress(name) { return getContractId(name).split('.')[0]; }
function getContractName(name) { return getContractId(name).split('.')[1]; }

module.exports = { CONTRACT_ADDRESSES, DEPLOYER_ADDRESS, getContractId, getContractAddress, getContractName };