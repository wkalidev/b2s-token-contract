import { callReadOnlyFunction, cvToValue, stringAsciiCV } from "@stacks/transactions"
import { StacksMainnet } from "@stacks/network"

export const ORACLE_CONTRACT = 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-price-oracle'

export class OracleClient {
  private network = new StacksMainnet()

  async getPrice(pair = 'STX-USD') {
    const [address, name] = ORACLE_CONTRACT.split('.')
    const result = await callReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: 'get-price',
      functionArgs: [stringAsciiCV(pair)],
      network: this.network,
      senderAddress: address,
    })
    const raw = cvToValue(result) as { price: bigint; decimals: bigint; block: bigint }
    return {
      pair,
      price: Number(raw.price) / 1e6,
      decimals: Number(raw.decimals),
      lastUpdateBlock: Number(raw.block),
    }
  }
}
