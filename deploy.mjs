import 'dotenv/config';
import pkg from '@stacks/transactions';
const { makeContractDeploy, AnchorMode, PostConditionMode } = pkg;
import { readFileSync } from 'fs';
import { generateWallet } from '@stacks/wallet-sdk';

const mnemonic = process.env.MNEMONIC.trim();
const contractCode = readFileSync('./contracts/b2s-staking-vault-v2.clar', 'utf8');

async function deploy() {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const privateKey = wallet.accounts[0].stxPrivateKey;

  const tx = await makeContractDeploy({
    contractName: 'b2s-staking-vault-v2',
    codeBody: contractCode,
    senderKey: privateKey,
    network: 'mainnet',
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    clarityVersion: 2,
    fee: 50000,
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
}

deploy().catch(console.error);