const DEPLOYER = 'SP1V72500C63KN9E348QDK9X879MASSTN0J3KBQ5N';

export const CONTRACT_ADDRESSES = {
  'b2s-token-v4':             `${DEPLOYER}.b2s-token-v4`,
  'b2s-staking-vault-v2':     `${DEPLOYER}.b2s-staking-vault-v2`,
  'b2s-staking-vault-v3':     `${DEPLOYER}.b2s-staking-vault-v3`,
  'b2s-liquidity-pool-v6':    `${DEPLOYER}.b2s-liquidity-pool-v6`,
  'b2s-governance':           `${DEPLOYER}.b2s-governance`,
  'b2s-prediction-market':    `${DEPLOYER}.b2s-prediction-market`,
  'b2s-price-oracle':         `${DEPLOYER}.b2s-price-oracle`,
  'b2s-fee-router':           `${DEPLOYER}.b2s-fee-router`,
  'b2s-rewards-distributor':  `${DEPLOYER}.b2s-rewards-distributor`,
  'b2s-airdrop':              `${DEPLOYER}.b2s-airdrop`,
  'b2s-marketplace':          `${DEPLOYER}.b2s-marketplace`,
  'stacks-quest-v2':          `${DEPLOYER}.stacks-quest-v2`,
  'stacks-quest-agent-v3':    `${DEPLOYER}.stacks-quest-agent-v3`,
  'toolkit-math':             `${DEPLOYER}.toolkit-math`,
};

export const DEPLOYER_ADDRESS = DEPLOYER;

export function getContractId(name) {
  const addr = CONTRACT_ADDRESSES[name];
  if (!addr) throw new Error(`Unknown contract: ${name}`);
  return addr;
}

export function getContractAddress(name) { return getContractId(name).split('.')[0]; }
export function getContractName(name)    { return getContractId(name).split('.')[1]; }

export default { CONTRACT_ADDRESSES, DEPLOYER_ADDRESS, getContractId, getContractAddress, getContractName };
