import { NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"

// GET - Get wallet balance from Solana blockchain
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get("address")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "wallet address is required" },
        { status: 400 }
      )
    }

    // Connect to Solana devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    try {
      // Convert address to PublicKey
      const publicKey = new PublicKey(walletAddress)

      // Get balance (returns lamports, 1 SOL = 1,000,000,000 lamports)
      const balance = await connection.getBalance(publicKey)

      // Convert lamports to SOL
      const solBalance = balance / 1_000_000_000

      return NextResponse.json(
        {
          balance: solBalance,
          lamports: balance,
          address: walletAddress,
        },
        { status: 200 }
      )
    } catch (error: any) {
      // Invalid address format
      return NextResponse.json(
        { error: "Invalid wallet address", message: error.message },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Error fetching wallet balance:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

