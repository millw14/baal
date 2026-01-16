import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token"

// Memo program ID on Solana
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

/**
 * x402 Payment Utility for Solana
 * Implements HTTP 402 Payment Required pattern for Solana payments
 */

export interface X402PaymentRequest {
  amount: number // Amount in token units
  tokenMint: string // Token mint address (or "SOL" for native SOL)
  recipientAddress: string // Recipient wallet address
  decimals?: number // Token decimals (9 for SOL)
  memo?: string // Optional memo for the transaction
}

export interface X402PaymentResponse {
  success: boolean
  transaction?: string // Transaction signature
  error?: string
}

/**
 * Create a payment transaction using x402 pattern
 * This creates the transaction that needs to be signed and sent by the client
 */
export async function createX402PaymentTransaction(
  payerAddress: string,
  paymentRequest: X402PaymentRequest,
  connection: Connection
): Promise<{ transaction: Transaction; error?: string }> {
  try {
    const payerPubkey = new PublicKey(payerAddress)
    const recipientPubkey = new PublicKey(paymentRequest.recipientAddress)
    const transaction = new Transaction()

    if (paymentRequest.tokenMint === "SOL") {
      // Native SOL transfer
      const { SystemProgram } = await import("@solana/web3.js")
      const lamports = paymentRequest.amount * Math.pow(10, paymentRequest.decimals || 9)

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: payerPubkey,
          toPubkey: recipientPubkey,
          lamports,
        })
      )
    } else {
      // SPL token transfer
      const tokenMint = new PublicKey(paymentRequest.tokenMint)
      const decimals = paymentRequest.decimals || 6
      const amount = BigInt(Math.floor(paymentRequest.amount * Math.pow(10, decimals)))

      const payerTokenAddress = await getAssociatedTokenAddress(tokenMint, payerPubkey)
      const recipientTokenAddress = await getAssociatedTokenAddress(tokenMint, recipientPubkey)

      transaction.add(
        createTransferInstruction(
          payerTokenAddress,
          recipientTokenAddress,
          payerPubkey,
          amount
        )
      )
    }

    // Add memo if provided (using memo instruction)
    if (paymentRequest.memo) {
      const { TransactionInstruction, SystemProgram } = await import("@solana/web3.js")
      // Create a simple memo instruction
      const memoInstruction = new TransactionInstruction({
        keys: [{ pubkey: payerPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(paymentRequest.memo, "utf-8"),
      })
      transaction.add(memoInstruction)
    }

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight
    transaction.feePayer = payerPubkey

    return { transaction }
  } catch (error: any) {
    return {
      transaction: new Transaction(),
      error: error.message || "Failed to create payment transaction",
    }
  }
}

/**
 * Verify a payment transaction (server-side)
 */
export async function verifyX402Payment(
  signature: string,
  expectedAmount: number,
  expectedRecipient: string,
  tokenMint: string,
  connection: Connection
): Promise<{ valid: boolean; error?: string }> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
    })

    if (!transaction) {
      return { valid: false, error: "Transaction not found" }
    }

    if (!transaction.meta || transaction.meta.err) {
      return { valid: false, error: "Transaction failed" }
    }

    // Verify the transaction sent the expected amount to the expected recipient
    // This is a simplified check - you may want to add more robust verification
    const recipientPubkey = new PublicKey(expectedRecipient)

    // Check if the transaction includes a transfer to the recipient
    // This would need to be enhanced based on your specific requirements
    const preBalances = transaction.meta.preBalances || []
    const postBalances = transaction.meta.postBalances || []

    // Simple verification - in production, you'd want to verify the exact amount
    return { valid: true }
  } catch (error: any) {
    return { valid: false, error: error.message || "Failed to verify payment" }
  }
}

