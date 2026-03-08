export declare const DEPLOYER_ADDRESS: string;

export declare const CONTRACT_ADDRESSES: {
  'b2s-token': string;
  'b2s-token-v4': string;
  'b2s-liquidity-pool-v5': string;
  'b2s-liquidity-pool-v6': string;
  'b2s-rewards-distributor-v3': string;
  'b2s-prediction-market': string;
  'b2s-governance': string;
  'b2s-price-oracle': string;
  'b2s-staking-vault-v2': string;
  'b2s-airdrop-v2': string;
};

export declare function getContractId(name: keyof typeof CONTRACT_ADDRESSES): string;
export declare function getContractAddress(name: keyof typeof CONTRACT_ADDRESSES): string;
export declare function getContractName(name: keyof typeof CONTRACT_ADDRESSES): string;