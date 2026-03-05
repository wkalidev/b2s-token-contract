require('dotenv').config();

const { makeContractDeploy, AnchorMode } = require('@stacks/transactions');
const { StacksMainnet }                  = require('@stacks/network');
const { generateWallet }                 = require('@stacks/wallet-sdk');
const fs                                 = require('fs');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API = 'https://api.hiro.so';

const CONTRACTS = [
  // { name: 'b2s-governance',          path: './contracts/b2s-governance.clar' },
  //{ name: 'b2s-liquidity-pool-v5',   path: './contracts/b2s-liquidity-pool.clar' },
   { name: 'b2s-prediction-market', path: './contracts/b2s-prediction-market.clar' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read and sanitize a Clarity source file */
function readContract(filePath) {
  return fs
    .readFileSync(filePath, { encoding: 'ascii' })
    .replace(/\r\n/g, '\n')           // Windows → Unix line endings
    .replace(/\r/g, '\n')             // Old Mac → Unix line endings
    .replace(/[^\x20-\x7E\n\t]/g, '') // Strip non-ASCII characters
    .trim();
}

/** Deploy a single contract and return the txid */
async function deployContract(name, path, senderKey, network) {
  console.log(`\nDeploying ${name}...`);

  const tx = await makeContractDeploy({
    contractName: name,
    codeBody:     readContract(path),
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee:        100_000n,
  });

  const res = await fetch(`${API}/v2/transactions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body:    tx.serialize(),
  });

  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Broadcast failed (${res.status}): ${body}`);
  }

  // Hiro returns the txid wrapped in quotes — strip them for clean output
  const txid = body.replace(/"/g, '');
  console.log(`✅ ${name}: ${txid}`);
  return txid;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
async function main() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error('MNEMONIC environment variable is not set. Add it to your .env file.');
  }

  const wallet    = await generateWallet({ secretKey: mnemonic, password: '' });
  const senderKey = wallet.accounts[0].stxPrivateKey;
  const network   = new StacksMainnet({ url: API });

  const results = [];

  for (const contract of CONTRACTS) {
    try {
      const txid = await deployContract(contract.name, contract.path, senderKey, network);
      results.push({ name: contract.name, txid, status: 'ok' });
    } catch (err) {
      console.error(`❌ ${contract.name}: ${err.message}`);
      results.push({ name: contract.name, error: err.message, status: 'failed' });
    }
  }

  console.log('\n--- Deployment summary ---');
  for (const r of results) {
    if (r.status === 'ok') {
      console.log(`✅ ${r.name}\n   txid: ${r.txid}`);
    } else {
      console.log(`❌ ${r.name}\n   error: ${r.error}`);
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});