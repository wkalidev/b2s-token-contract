import { 
  fetchCallReadOnlyFunction, 
  cvToValue, 
  uintCV, 
  principalCV, 
  stringAsciiCV, 
  makeContractCall, 
  broadcastTransaction, 
  PostConditionMode 
} from "@stacks/transactions"
import { STACKS_MAINNET } from "@stacks/network"
import type { TxOptions } from "./token"

export const FEE_ROUTER_CONTRACT = 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-fee-router'

export class FeeRouterClient {
  private network = STACKS_MAINNET
  private contractAddress = 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96'
  private contractName = 'b2s-fee-router'

  async getTotalFeesCollected() {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-total-fees-collected',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    })
    return BigInt(cvToValue(result) ?? 0)
  }

  async recordBridgeTx(
    sender: string,
    recipient: string,
    amount: bigint,
    fromChain: string,
    opts: TxOptions
  ) {
    const tx = await makeContractCall({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'record-bridge-tx',
      functionArgs: [
        principalCV(sender),
        principalCV(recipient),
        uintCV(amount),
        stringAsciiCV(fromChain),
      ],
      senderKey: opts.senderKey,
      network: this.network,
      // anchorMode supprimé — retiré dans @stacks/transactions v7+
      postConditionMode: PostConditionMode.Allow,
      fee: opts.fee ?? 2000n,
    })
    await broadcastTransaction({ transaction: tx, network: this.network }) // network retiré — plus accepté en 2e argument
    return tx
  }
}