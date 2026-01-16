import { NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

// This endpoint is for client-side transaction creation
// The actual transaction signing happens on the client with the user's wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromAddress, toAddress, amount } = body

    if (!fromAddress || !toAddress || !amount) {
      return NextResponse.json(
        { error: "fromAddress, toAddress, and amount are required" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Connect to Solana devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    try {
      const fromPubkey = new PublicKey(fromAddress)
      const toPubkey = new PublicKey(toAddress)

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL, // Convert SOL to lamports
        })
      )

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = fromPubkey

      // Serialize transaction for client-side signing
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })

      return NextResponse.json(
        {
          transaction: Buffer.from(serializedTransaction).toString("base64"),
          message: "Transaction created. Sign with your wallet to complete deposit.",
        },
        { status: 200 }
      )
    } catch (error: any) {
      return NextResponse.json(
        { error: "Invalid wallet address", message: error.message },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Error creating deposit transaction:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}


