process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { makeContractDeploy, AnchorMode } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');

const API = 'https://api.hiro.so';
const mnemonic = "egg scatter agree excite alarm dilemma vendor grace broom risk situate crater";

async function deploy(contractName, contractPath, senderKey) {
  let code = fs.readFileSync(contractPath, { encoding: 'ascii' });
  code = code.replace(/\r\n/g, '\n')  // Windows line endings → Unix
           .replace(/\r/g, '\n')     // Old Mac line endings → Unix
           .replace(/[^\x20-\x7E\n\t]/g, '')  // Supprime non-ASCII
           .trim();

  console.log(`Deploying ${contractName}...`);

  const network = new StacksMainnet({ url: API });

  const tx = await makeContractDeploy({
    contractName,
    codeBody: code,
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 100000n,
  });

  const serialized = tx.serialize();

  const res = await fetch(`${API}/v2/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: serialized,
  });

  const text = await res.text();
  console.log(`${contractName}:`, text);
}

async function main() {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const senderKey = wallet.accounts[0].stxPrivateKey;

  await deploy('b2s-governance', './contracts/b2s-governance.clar', senderKey);
  await deploy('b2s-liquidity-pool', './contracts/b2s-liquidity-pool.clar', senderKey);
  await deploy('b2s-rewards-distributor', './contracts/b2s-rewards-distributor.clar', senderKey);
}

main().catch(console.error);