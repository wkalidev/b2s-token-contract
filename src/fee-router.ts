import { callReadOnlyFunction, cvToValue, uintCV, principalCV, stringAsciiCV, makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode } from "@stacks/transactions"
import { StacksMainnet } from "@stacks/network"
import type { TxOptions } from "./token"

export const FEE_ROUTER_CONTRACT = 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-fee-router'

export class FeeRouterClient {
  private network = new StacksMainnet()
  private contractAddress = 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96'
  private contractName = 'b2s-fee-router'

  async getTotalFeesCollected() {
    const result = await callReadOnlyFunction({
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
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: opts.fee ?? 2000n,
    })
    await broadcastTransaction(tx, this.network)
    return tx
  }
}
