import { NextRequest, NextResponse } from "next/server"
import { createX402PaymentTransaction } from "@/lib/utils/x402-payment"
import { Connection } from "@solana/web3.js"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"

/**
 * x402 Payment Required endpoint
 * Returns payment instructions following HTTP 402 pattern
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, amount, tokenMint, recipientAddress, memo, decimals } = body

    if (!privyId || !amount || !tokenMint || !recipientAddress) {
      return NextResponse.json(
        { error: "Missing required fields: privyId, amount, tokenMint, recipientAddress" },
        { status: 400 }
      )
    }

    // Get user and their managed wallet
    const user = await User.findOne({ privyId }).lean()
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const managedWallet = user.wallets?.find((w: any) => w.walletType === "managed")
    if (!managedWallet || !managedWallet.address) {
      return NextResponse.json(
        { error: "No managed wallet found" },
        { status: 400 }
      )
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed")

    // Create payment transaction
    const { transaction, error } = await createX402PaymentTransaction(
      managedWallet.address,
      {
        amount,
        tokenMint,
        recipientAddress,
        decimals: decimals || (tokenMint === "SOL" ? 9 : 6),
        memo,
      },
      connection
    )

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      )
    }

    // Return payment instructions (HTTP 402 pattern)
    // In x402, we return 402 status with payment details
    // The client will sign and send the transaction, then retry with proof
    return NextResponse.json(
      {
        paymentRequired: true,
        amount,
        tokenMint,
        recipientAddress,
        transaction: transaction.serialize({ requireAllSignatures: false }).toString("base64"),
        message: "Payment required to proceed",
      },
      { status: 402 } // HTTP 402 Payment Required
    )
  } catch (error: any) {
    console.error("Error creating x402 payment:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

