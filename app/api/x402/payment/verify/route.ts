import { NextRequest, NextResponse } from "next/server"
import { verifyX402Payment } from "@/lib/utils/x402-payment"
import { Connection } from "@solana/web3.js"

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"

/**
 * Verify x402 payment transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signature, expectedAmount, expectedRecipient, tokenMint } = body

    if (!signature || !expectedAmount || !expectedRecipient || !tokenMint) {
      return NextResponse.json(
        { error: "Missing required fields: signature, expectedAmount, expectedRecipient, tokenMint" },
        { status: 400 }
      )
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed")

    const { valid, error } = await verifyX402Payment(
      signature,
      expectedAmount,
      expectedRecipient,
      tokenMint,
      connection
    )

    if (!valid) {
      return NextResponse.json(
        { valid: false, error: error || "Payment verification failed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      signature,
      message: "Payment verified successfully",
    })
  } catch (error: any) {
    console.error("Error verifying x402 payment:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

