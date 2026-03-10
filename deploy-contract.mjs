import 'dotenv/config';
import pkg from '@stacks/transactions';
const { makeContractDeploy, AnchorMode, PostConditionMode } = pkg;
import { readFileSync } from 'fs';
import { generateWallet } from '@stacks/wallet-sdk';

const contractFile = process.argv[2];
const contractName = process.argv[3] || contractFile?.split('/')?.pop()?.replace('.clar', '');

if (!contractFile || !contractName) {
  console.error('Usage: node deploy-contract.mjs <contract-file> <contract-name>');
  process.exit(1);
}

const mnemonic = process.env.MNEMONIC.trim();

let contractCode = readFileSync(contractFile, 'utf8');
contractCode = contractCode.replace(/^\uFEFF/, '');
contractCode = contractCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

console.log(`Deploying: ${contractName}`);
console.log(`File: ${contractFile}`);
console.log(`Code length: ${contractCode.length} chars`);

async function deploy() {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const privateKey = wallet.accounts[0].stxPrivateKey;

  const tx = await makeContractDeploy({
    contractName,
    codeBody: contractCode,
    senderKey: privateKey,
    network: 'mainnet',
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    clarityVersion: 2,
    fee: 50000,
    nonce: 63,
  });

  const serialized = tx.serialize();
  const txHex = Buffer.from(serialized).toString('hex');

  const response = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: Buffer.from(txHex, 'hex'),
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);

  if (response.status === 200) {
    console.log(`\n✅ Deployed! TX ID: ${text}`);
    console.log(`Explorer: https://explorer.hiro.so/txid/${text.replace(/"/g, '')}?chain=mainnet`);
  }
}

deploy().catch(console.error);