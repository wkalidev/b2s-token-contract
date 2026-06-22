export declare const DEPLOYER_ADDRESS: string;

export declare const CONTRACT_ADDRESSES: {
  'b2s-token-v4':             string;
  'b2s-staking-vault-v2':     string;
  'b2s-staking-vault-v3':     string;
  'b2s-liquidity-pool-v6':    string;
  'b2s-governance':           string;
  'b2s-prediction-market':    string;
  'b2s-price-oracle':         string;
  'b2s-fee-router':           string;
  'b2s-rewards-distributor':  string;
  'b2s-airdrop':              string;
  'b2s-marketplace':          string;
  'stacks-quest-v2':          string;
  'stacks-quest-agent-v3':    string;
  'toolkit-math':             string;
};

export type ContractName = keyof typeof CONTRACT_ADDRESSES;

export declare function getContractId(name: ContractName): string;
export declare function getContractAddress(name: ContractName): string;
export declare function getContractName(name: ContractName): string;

declare const _default: {
  CONTRACT_ADDRESSES: typeof CONTRACT_ADDRESSES;
  DEPLOYER_ADDRESS: string;
  getContractId: typeof getContractId;
  getContractAddress: typeof getContractAddress;
  getContractName: typeof getContractName;
};
export default _default;
